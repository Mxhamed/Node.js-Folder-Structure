import {
  FRONTEND_URL,
  JWT_REFRESH_EXPIRES_IN,
  JWT_EMAIL_VERIFICATION_EXPIRES_IN,
  JWT_PASSWORD_RESET_EXPIRES_IN,
} from "../../../config/config.service.js";
import {
  ERROR_MESSAGES,
  TOKEN_TYPES,
  REDIS_KEYS,
} from "../../constants/index.js";
import { User, redis } from "../../database/index.js";
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  generateToken,
  generateAuthTokens,
  verifyToken,
  hashPassword,
  verifyPassword,
  composeMail,
  sendMail,
  toSeconds,
  getRelativeTime,
  toUnixTimestamp,
} from "../../utils/index.js";

// ─────────────────────────────────────────────

export const signup = async ({ fullName, email, password, phone, gender }) => {
  // Check If Email Already Exists
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) throw new ConflictError(ERROR_MESSAGES.USER_ALREADY_EXISTS);

  // Hash Password Before Saving
  const hashedPassword = await hashPassword(password);

  // Create User
  //   fullName Triggers the Virtual Setter → firstName + lastName
  //   phone gets Encrypted by the Setter
  await User.create({
    fullName,
    email,
    password: hashedPassword,
    phone,
    gender,
  });
};

// ─────────────────────────────────────────────

export const login = async ({ email, password }) => {
  // Check If User Exists
  const user = await User.findOne({ email }).select("+password").lean();
  if (!user) throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);

  // Verify Password
  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch) throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);

  // Generate Auth Tokens
  const { accessToken, refreshToken } = generateAuthTokens(
    user._id.toString(),
    user.role,
  );

  return {
    accessToken,
    refreshToken,
  };
};

// ─────────────────────────────────────────────

export const rotateToken = async (oldRefreshToken) => {
  // Verify Token Signature & Expiry
  const decoded = verifyToken(oldRefreshToken, TOKEN_TYPES.REFRESH);
  const { sub, jti, iat, exp } = decoded;

  // Check If User Exists
  const user = await User.findById(sub).lean();
  if (!user) throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);

  // Check Global Logout
  if (user.globalLogoutAt) {
    const logoutTimestamp = toUnixTimestamp(user.globalLogoutAt);
    if (iat < logoutTimestamp) {
      throw new UnauthorizedError(ERROR_MESSAGES.REVOKED_TOKEN);
    }
  }

  // Check Individual Token Blacklist
  const key = REDIS_KEYS.TOKEN_BLACKLIST(sub, jti);
  const isBlacklisted = await redis.get(key);
  if (isBlacklisted) throw new UnauthorizedError(ERROR_MESSAGES.REVOKED_TOKEN);

  // Blacklist Old Refresh Token
  const sKey = REDIS_KEYS.REVOKED_SESSIONS(sub);
  await Promise.all([
    redis.set(key, "1", { EXAT: exp }), // "1" = Placeholder Value, Only the Key's Existence Matters
    redis.sAdd(sKey, jti),
    redis.expire(sKey, toSeconds(JWT_REFRESH_EXPIRES_IN)), // Max Refresh Token Lifetime
  ]);

  // Issue New Tokens
  const remainingTime = exp - Math.floor(Date.now() / 1000); // Seconds Remaining
  const { accessToken, refreshToken: newRefreshToken } = generateAuthTokens(
    sub,
    user.role,
    remainingTime, // Seconds from Now
  );

  return { accessToken, refreshToken: newRefreshToken };
};

// ─────────────────────────────────────────────

export const requestEmailVerification = async (user) => {
  // Already Verified
  if (user.emailVerifiedAt) {
    throw new BadRequestError(ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED);
  }

  // Generate Verification Token
  const token = generateToken(
    { sub: user._id.toString() },
    TOKEN_TYPES.EMAIL_VERIFICATION,
  );

  // Compose & Send Email
  const mail = composeMail({
    to: user.email,
    subject: "Verify Your Email Address",
    html: `
      <p>Hi ${user.firstName},</p>
      <p>Click the Link below to Verify our Email. This Link Expires ${getRelativeTime(toSeconds(JWT_EMAIL_VERIFICATION_EXPIRES_IN))}.</p>
      <a href="${FRONTEND_URL}/verify-email?token=${token}">Verify Email</a>
    `,
  });

  await sendMail(mail);
};

// ─────────────────────────────────────────────

export const verifyEmail = async (token) => {
  // Verify Token
  const decoded = verifyToken(token, TOKEN_TYPES.EMAIL_VERIFICATION);
  const { sub } = decoded;

  // Check If User Exists
  const user = await User.findById(sub).lean();
  if (!user) throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);

  // Check If Already Verified
  if (user.emailVerifiedAt) {
    throw new BadRequestError(ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED);
  }

  // Mark Email as Verified
  await User.findByIdAndUpdate(sub, { emailVerifiedAt: new Date() });
};

// ─────────────────────────────────────────────

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email }).lean();

  // Always Return Success — Prevent Email Enumeration
  if (!user) return;

  // Generate Password Reset Token
  const token = generateToken(
    { sub: user._id.toString() },
    TOKEN_TYPES.PASSWORD_RESET,
  );

  // Compose & Send Email
  const mail = composeMail({
    to: user.email,
    subject: "Reset Your Password",
    html: `
      <p>Hi ${user.firstName},</p>
      <p>Click the Link below to Reset Your Password. This Link Expires ${getRelativeTime(toSeconds(JWT_PASSWORD_RESET_EXPIRES_IN))}.</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });

  await sendMail(mail);
};

// ─────────────────────────────────────────────

export const resetPassword = async ({ token, newPassword }) => {
  // Verify Token
  const decoded = verifyToken(token, TOKEN_TYPES.PASSWORD_RESET);
  const { sub } = decoded;

  // Check If User Exists
  const user = await User.findById(sub).lean();
  if (!user) throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);

  // Hash & Update Password
  const hashedPassword = await hashPassword(newPassword);
  await User.findByIdAndUpdate(sub, { password: hashedPassword });
};

// ─────────────────────────────────────────────

export const updatePassword = async ({ user, oldPassword, newPassword }) => {
  // Re-fetch with Password Field
  const freshUser = await User.findById(user._id).select("+password").lean();
  // Verify Old Password
  const isMatch = await verifyPassword(oldPassword, freshUser.password);
  if (!isMatch) throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);

  // Hash & Update
  const hashedPassword = await hashPassword(newPassword);
  await User.findByIdAndUpdate(user._id, { password: hashedPassword });
};

// ─────────────────────────────────────────────

export const logout = async ({ sub, jti, exp }) => {
  const key = REDIS_KEYS.TOKEN_BLACKLIST(sub, jti);
  const sKey = REDIS_KEYS.REVOKED_SESSIONS(sub);

  await Promise.all([
    redis.set(key, "1", { EXAT: exp }), // "1" = Placeholder Value, Only the Key's Existence Matters
    redis.sAdd(sKey, jti),
    redis.expire(sKey, toSeconds(JWT_REFRESH_EXPIRES_IN)), // Max Refresh Token Lifetime
  ]);
};

// ─────────────────────────────────────────────

export const logoutAll = async ({ sub }) => {
  const sKey = REDIS_KEYS.REVOKED_SESSIONS(sub);
  const jtis = await redis.sMembers(sKey);

  // Delete ALL Individual Blacklist Keys
  const keys = jtis.map((jti) => REDIS_KEYS.TOKEN_BLACKLIST(sub, jti));
  if (keys.length) await redis.unlink(keys);
  await redis.unlink(sKey);

  // Set Global Logout Timestamp
  await User.findByIdAndUpdate(sub, { globalLogoutAt: new Date() });
};
