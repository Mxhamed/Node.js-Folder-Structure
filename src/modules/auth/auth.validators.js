import Joi from "joi";
import { ERROR_MESSAGES, GENDERS, PATTERNS } from "../../constants/index.js";

const fullName = Joi.string()
  .pattern(PATTERNS.FULL_NAME)
  .trim()
  .required()
  .messages({
    "string.pattern.base": ERROR_MESSAGES.INVALID_FULL_NAME,
    "any.required": "Full Name is Required",
  });

const email = Joi.string().email().lowercase().trim().required().messages({
  "any.required": "Email is Required",
});

const password = Joi.string()
  .min(8)
  .max(64)
  .pattern(PATTERNS.PASSWORD)
  .required()
  .messages({
    "string.min": "Password MUST be at Least 8 Characters",
    "string.max": "Password CANNOT Exceed 64 Characters",
    "string.pattern.base": ERROR_MESSAGES.INVALID_PASSWORD,
    "any.required": "Password is Required",
  });

const phone = Joi.string().pattern(PATTERNS.PHONE).required().messages({
  "string.pattern.base": ERROR_MESSAGES.INVALID_PHONE,
  "any.required": "Phone Number is Required",
});

const token = Joi.string().trim().required().messages({
  "any.required": "Token is Required",
});

const gender = Joi.string()
  .valid(...Object.values(GENDERS))
  .required()
  .messages({
    "any.only": `Gender MUST be One of: ${Object.values(GENDERS).join(", ")}`,
    "any.required": "Gender is Required",
  });

// ─────────────────────────────────────────────

export const signupSchema = Joi.object({
  fullName,
  email,
  password,
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords Do NOT Match",
    "any.required": "Please Confirm Your Password",
  }),
  phone,
  gender,
});

export const loginSchema = Joi.object({
  email,
  password: Joi.string().required().messages({
    "any.required": "Password is Required",
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: token,
});

export const verifyEmailSchema = Joi.object({
  token,
});

export const forgotPasswordSchema = Joi.object({
  email,
});

export const resetPasswordSchema = Joi.object({
  token,
  newPassword: password,
});

export const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Old Password is Required",
  }),
  newPassword: password,
});
