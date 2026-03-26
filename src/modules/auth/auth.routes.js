import { Router } from "express";
import * as AuthValidation from "./auth.validators.js";
import * as AuthController from "./auth.controller.js";
import { RATE_LIMITER_NAMES } from "../../constants/index.js";
import {
  authenticate,
  getLimiter,
  validateBody,
  validateQuery,
} from "../../middleware/index.js";

const router = Router();

router.post(
  "/signup",
  validateBody(AuthValidation.signupSchema),
  getLimiter(RATE_LIMITER_NAMES.SIGNUP),
  AuthController.signup,
);

router.post(
  "/login",
  validateBody(AuthValidation.loginSchema),
  getLimiter(RATE_LIMITER_NAMES.LOGIN),
  AuthController.login,
);

router.post(
  "/refresh-token",
  validateBody(AuthValidation.refreshTokenSchema),
  getLimiter(RATE_LIMITER_NAMES.REFRESH_TOKEN),
  AuthController.refreshToken,
);

router.post(
  "/request-email-verification",
  authenticate,
  getLimiter(RATE_LIMITER_NAMES.EMAIL_VERIFICATION),
  AuthController.requestEmailVerification,
);

router.get(
  "/verify-email",
  validateQuery(AuthValidation.verifyEmailSchema),
  getLimiter(RATE_LIMITER_NAMES.VERIFY_EMAIL),
  AuthController.verifyEmail,
);

router.post(
  "/forgot-password",
  validateBody(AuthValidation.forgotPasswordSchema),
  getLimiter(RATE_LIMITER_NAMES.FORGOT_PASSWORD),
  AuthController.forgotPassword,
);

router.patch(
  "/reset-password",
  validateBody(AuthValidation.resetPasswordSchema),
  getLimiter(RATE_LIMITER_NAMES.RESET_PASSWORD),
  AuthController.resetPassword,
);

router.patch(
  "/update-password",
  authenticate,
  validateBody(AuthValidation.updatePasswordSchema),
  getLimiter(RATE_LIMITER_NAMES.UPDATE_PASSWORD),
  AuthController.updatePassword,
);

router.post("/logout", authenticate, AuthController.logout);

router.post("/logout-all", authenticate, AuthController.logoutAll);

export default router;
