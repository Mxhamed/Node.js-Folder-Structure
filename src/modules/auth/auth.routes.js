import { Router } from "express";
import * as AuthValidation from "./auth.validators.js";
import * as AuthController from "./auth.controller.js";
import { RATE_LIMITERS } from "../../constants/index.js";
import {
  authenticate,
  getLimiter,
  validateBody,
  validateQuery,
} from "../../middleware/index.js";

const router = Router();

// ─── Authentication & Identity Management ──────────────────────────────────────────

router.post(
  "/register",
  validateBody(AuthValidation.registerSchema),
  getLimiter(RATE_LIMITERS.SIGNUP),
  AuthController.register,
);

router.post(
  "/login",
  validateBody(AuthValidation.loginSchema),
  getLimiter(RATE_LIMITERS.LOGIN),
  AuthController.login,
);

router.post("/logout", authenticate, AuthController.logout);

router.post("/logout-all", authenticate, AuthController.logoutAll);

router.post(
  "/refresh-token",
  validateBody(AuthValidation.refreshTokenSchema),
  getLimiter(RATE_LIMITERS.REFRESH_TOKEN),
  AuthController.refreshToken,
);

// ─── Password Management ──────────────────────────────────────────

router.post(
  "/forgot-password",
  validateBody(AuthValidation.forgotPasswordSchema),
  getLimiter(RATE_LIMITERS.FORGOT_PASSWORD),
  AuthController.forgotPassword,
);

router.patch(
  "/reset-password",
  validateBody(AuthValidation.resetPasswordSchema),
  getLimiter(RATE_LIMITERS.VERIFY_PASSWORD_RESET),
  AuthController.resetPassword,
);

router.patch(
  "/update-password",
  authenticate,
  validateBody(AuthValidation.updatePasswordSchema),
  getLimiter(RATE_LIMITERS.UPDATE_PASSWORD),
  AuthController.updatePassword,
);

// ─── Email Verification ──────────────────────────────────────────

router.post(
  "/request-email-verification",
  authenticate,
  getLimiter(RATE_LIMITERS.REQUEST_EMAIL_VERIFICATION),
  AuthController.requestEmailVerification,
);

router.get(
  "/verify-email",
  validateQuery(AuthValidation.verifyEmailSchema),
  getLimiter(RATE_LIMITERS.VERIFY_EMAIL),
  AuthController.verifyEmail,
);

// ─── Current User Profile ──────────────────────────────────────────

router.get("/me", authenticate, AuthController.getCurrentUser);

router.patch(
  "/me",
  authenticate,
  validateBody(AuthValidation.updateProfileSchema),
  AuthController.updateCurrentUser,
);

router.delete("/me", authenticate, AuthController.deleteCurrentUser);

export default router;
