import * as AuthService from "./auth.service.js";
import { sendSuccess } from "../../utils/index.js";
import { HTTP_STATUS } from "../../constants/index.js";

// ─── Authentication & Identity Management ──────────────────────────────────────────

export const register = async (req, res) => {
  await AuthService.register(req.validatedBody);
  sendSuccess(res, {
    message: "Account Created Successfully",
    statusCode: HTTP_STATUS.CREATED,
  });
};

export const login = async (req, res) => {
  const result = await AuthService.login(req.validatedBody);
  sendSuccess(res, {
    message: "Logged In Successfully",
    data: result,
  });
};

export const logout = async (req, res) => {
  await AuthService.logout(req.token);
  sendSuccess(res, {
    message: "Logged Out Successfully",
  });
};

export const logoutAll = async (req, res) => {
  await AuthService.logoutAll(req.token);
  sendSuccess(res, {
    message: "Logged Out from ALL Devices Successfully",
  });
};

export const refreshToken = async (req, res) => {
  const result = await AuthService.refreshToken(req.validatedBody.refreshToken);
  sendSuccess(res, {
    message: "Tokens Refreshed Successfully",
    data: result,
  });
};

// ─── Password Management ──────────────────────────────────────────

export const forgotPassword = async (req, res) => {
  await AuthService.forgotPassword(req.validatedBody.email);
  sendSuccess(res, {
    message: "If this Email is Registered, a Reset Link has been Sent",
  });
};

export const resetPassword = async (req, res) => {
  await AuthService.resetPassword(req.validatedBody);
  sendSuccess(res, {
    message: "Password Reset Successfully",
  });
};

export const updatePassword = async (req, res) => {
  await AuthService.updatePassword({
    user: req.user,
    ...req.validatedBody,
  });
  sendSuccess(res, {
    message: "Password Updated Successfully",
  });
};

// ─── Email Verification ──────────────────────────────────────────

export const requestEmailVerification = async (req, res) => {
  await AuthService.requestEmailVerification(req.user);
  sendSuccess(res, {
    message: "Verification Email Sent Successfully",
  });
};

export const verifyEmail = async (req, res) => {
  await AuthService.verifyEmail(req.validatedQuery.token);
  sendSuccess(res, {
    message: "Email Verified Successfully",
  });
};

// ─── Current User Profile ──────────────────────────────────────────

export const getCurrentUser = async (req, res) => {
  sendSuccess(res, {
    message: "User Profile Retrieved Successfully",
    data: { user: req.user },
  });
};

export const updateCurrentUser = async (req, res) => {
  const updatedUser = await AuthService.updateCurrentUser({
    user: req.user,
    updates: req.validatedBody,
  });
  sendSuccess(res, {
    message: "Profile Updated Successfully",
    data: { user: updatedUser },
  });
};

export const deleteCurrentUser = async (req, res) => {
  await AuthService.deleteCurrentUser(req.user);
  sendSuccess(res, {
    message: "Account Deleted Successfully",
  });
};
