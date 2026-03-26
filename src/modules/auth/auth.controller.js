import * as AuthService from "./auth.service.js";
import { sendSuccess } from "../../utils/index.js";
import { HTTP_STATUS } from "../../constants/index.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.validatedBody;
  const result = await AuthService.signup({ name, email, password });
  sendSuccess(res, {
    message: "Account Created Successfully",
    data: result,
    statusCode: HTTP_STATUS.CREATED,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.validatedBody;
  const result = await AuthService.login({ email, password });
  sendSuccess(res, {
    message: "Logged In Successfully",
    data: result,
  });
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.validatedBody;
  const result = await AuthService.rotateToken(refreshToken);
  sendSuccess(res, {
    message: "Tokens Refreshed Successfully",
    data: result,
  });
};

export const requestEmailVerification = async (req, res) => {
  await AuthService.requestEmailVerification(req.user);
  sendSuccess(res, {
    message: "Verification Email Sent Successfully",
  });
};

export const verifyEmail = async (req, res) => {
  const { token } = req.validatedQuery;
  await AuthService.verifyEmail(token);
  sendSuccess(res, {
    message: "Email Verified Successfully",
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.validatedBody;
  await AuthService.forgotPassword(email);
  sendSuccess(res, {
    message: "If this Email is Registered, a Reset Link has been Sent",
  });
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.validatedBody;
  await AuthService.resetPassword({ token, newPassword });
  sendSuccess(res, {
    message: "Password Reset Successfully",
  });
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.validatedBody;
  await AuthService.updatePassword({
    user: req.user,
    oldPassword,
    newPassword,
  });
  sendSuccess(res, {
    message: "Password Updated Successfully",
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
