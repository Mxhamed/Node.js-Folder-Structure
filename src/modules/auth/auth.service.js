import {
  FRONTEND_URL,
  JWT_REFRESH_EXPIRES_IN,
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
  toUnixTimestamp,
} from "../../utils/index.js";

// ─── Authentication & Identity Management ──────────────────────────────────────────

export const register = async ({
  fullName,
  email,
  password,
  phone,
  gender,
  dateOfBirth,
}) => {
  // Check If Email Already Exists
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) throw new ConflictError(ERROR_MESSAGES.USER_ALREADY_EXISTS);

  // Hash Password Before Saving
  const hashedPassword = await hashPassword(password);

  // Create User
  await User.create({
    fullName, // Triggers the Virtual Setter → firstName + lastName
    email,
    password: hashedPassword,
    phone, // Gets Encrypted by the Setter
    gender,
    dateOfBirth,
  });
};

export const login = async ({ email, password }) => {
  // Check If User Exists
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);

  // Verify Password
  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch) throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);

  // Generate Auth Tokens
  const { accessToken, refreshToken } = generateAuthTokens(
    user._id.toString(),
    user.role,
  );

  // Strip Sensitive Field(s)
  const userObj = user.toObject();
  delete userObj.password;

  return {
    user: userObj,
    accessToken,
    refreshToken,
  };
};

export const logout = async ({ sub, jti, exp }) => {
  const key = REDIS_KEYS.TOKEN_BLACKLIST(sub, jti);
  const sKey = REDIS_KEYS.REVOKED_SESSIONS(sub);

  await Promise.all([
    redis.set(key, "1", { EXAT: exp }), // "1" = Placeholder Value, Only the Key's Existence Matters
    redis.sAdd(sKey, jti),
    redis.expire(sKey, toSeconds(JWT_REFRESH_EXPIRES_IN)), // Max Refresh Token Lifetime
  ]);
};

export const logoutAll = async ({ sub }) => {
  const sKey = REDIS_KEYS.REVOKED_SESSIONS(sub);
  const jtis = await redis.sMembers(sKey);

  // Delete ALL Individual Blacklist Keys
  const keys = jtis.map((jti) => REDIS_KEYS.TOKEN_BLACKLIST(sub, jti));
  if (keys.length) await redis.unlink(keys);
  await redis.unlink(sKey);

  // Set Global Logout Timestamp
  await User.updateOne({ _id: sub }, { globalLogoutAt: new Date() });
};

export const refreshToken = async (oldRefreshToken) => {
  // Verify Token Signature & Expiry
  const decoded = verifyToken(oldRefreshToken, TOKEN_TYPES.REFRESH);
  const { sub, jti, iat, exp } = decoded;

  // Check If User Exists
  const user = await User.findById(sub);
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

  return { user, accessToken, refreshToken: newRefreshToken };
};

// ─── Password Management ──────────────────────────────────────────

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email }).lean();

  // ALWAYS Return Success — Prevent Email Enumeration
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
      <p>Click the Link below to Reset Your Password.</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });

  await sendMail(mail);
};

export const resetPassword = async ({ token, newPassword }) => {
  // Verify Token
  const decoded = verifyToken(token, TOKEN_TYPES.PASSWORD_RESET);
  const { sub } = decoded;

  // Check If User Exists
  const user = await User.findById(sub).select("+password").lean();
  if (!user) throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);

  // Check If New Password is the Same as the Current One
  const isSame = await verifyPassword(newPassword, user.password);
  if (isSame) throw new BadRequestError(ERROR_MESSAGES.PASSWORD_SAME_AS_OLD);

  // Hash & Update Password
  const hashedPassword = await hashPassword(newPassword);
  await User.updateOne({ _id: sub }, { password: hashedPassword });
};

export const updatePassword = async ({ user, oldPassword, newPassword }) => {
  // Re-fetch with Password Field
  const freshUser = await User.findById(user._id).select("+password").lean();
  // Verify Old Password
  const isMatch = await verifyPassword(oldPassword, freshUser.password);
  if (!isMatch) throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);

  // Hash & Update
  const hashedPassword = await hashPassword(newPassword);
  await User.updateOne({ _id: user._id }, { password: hashedPassword });
};

// ─── Email Verification ──────────────────────────────────────────

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
      <p>Click the Link below to Verify our Email.</p>
      <a href="${FRONTEND_URL}/verify-email?token=${token}">Verify Email</a>
    `,
  });

  await sendMail(mail);
};

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
  await User.updateOne({ _id: sub }, { emailVerifiedAt: new Date() });
};

// ─── Current User Profile ──────────────────────────────────────────

export const updateCurrentUser = async ({ user, updates }) => {
  const { fullName, email, phone, gender, dateOfBirth } = updates;

  // Build Update Object
  const updateData = {};

  // Check Email Uniqueness If Email is Being Updated
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      throw new ConflictError(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    updateData.email = email;
    updateData.emailVerifiedAt = null; // Require Re-verification
  }

  if (fullName) {
    const [firstName, lastName] = fullName.split(" ");
    updateData.firstName = firstName;
    updateData.lastName = lastName;
  }

  if (phone) updateData.phone = phone;
  if (gender) updateData.gender = gender;
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    updateData,
    { new: true }, // Return Updated Document
  );

  return updatedUser.toObject();
};

export const deleteCurrentUser = async (user) => {
  // Soft Delete
  await User.updateOne({ _id: user._id }, { deletedAt: new Date() });
};
