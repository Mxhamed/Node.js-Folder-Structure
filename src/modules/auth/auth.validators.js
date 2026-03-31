import Joi from "joi";
import { ERROR_MESSAGES, GENDERS, PATTERNS } from "../../constants/index.js";
import { getAge } from "../../utils/index.js";

// ─── Base Definitions ──────────────────────────────────────────

const fullName = Joi.string().pattern(PATTERNS.FULL_NAME).trim().messages({
  "string.pattern.base": ERROR_MESSAGES.INVALID_FULL_NAME,
  "any.required": "Full Name is Required",
});

const email = Joi.string().email().lowercase().trim().messages({
  "any.required": "Email is Required",
});

const password = Joi.string()
  .min(8)
  .max(64)
  .pattern(PATTERNS.PASSWORD)
  .messages({
    "string.min": "Password MUST be at Least 8 Characters",
    "string.max": "Password CANNOT Exceed 64 Characters",
    "string.pattern.base": ERROR_MESSAGES.INVALID_PASSWORD,
    "any.required": "Password is Required",
  });

const phone = Joi.string().pattern(PATTERNS.PHONE).messages({
  "string.pattern.base": ERROR_MESSAGES.INVALID_PHONE,
  "any.required": "Phone Number is Required",
});

const gender = Joi.string()
  .valid(...Object.values(GENDERS))
  .messages({
    "any.only": `Gender MUST be One of: ${Object.values(GENDERS).join(", ")}`,
    "any.required": "Gender is Required",
  });

const dateOfBirth = Joi.date()
  .iso()
  .max("now")
  .custom((value, helpers) => {
    const age = getAge(value);
    if (age < 18) return helpers.error("date.minAge");
    return value;
  })
  .messages({
    "date.base": "Invalid Date of Birth",
    "date.max": "Date of Birth CANNOT be in the Future",
    "date.minAge": "You MUST be at Least 18 Years Old to Register",
    "any.required": "Date of Birth is Required",
  });

const token = Joi.string().trim().required().messages({
  "any.required": "Token is Required",
});

// ─── Schemas ──────────────────────────────────────────

export const registerSchema = Joi.object({
  fullName: fullName.concat(Joi.string().required()),
  email: email.concat(Joi.string().required()),
  password: password.concat(Joi.string().required()),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords Do NOT Match",
    "any.required": "Please Confirm Your Password",
  }),
  phone: phone.concat(Joi.string().required()),
  gender: gender.concat(Joi.string().required()),
  dateOfBirth: dateOfBirth.concat(Joi.date().required()),
});

export const loginSchema = Joi.object({
  email: email.concat(Joi.string().required()),
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
  email: email.concat(Joi.string().required()),
});

export const resetPasswordSchema = Joi.object({
  token,
  newPassword: password.concat(Joi.string().required()),
});

export const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Old Password is Required",
  }),
  newPassword: password.concat(
    Joi.string().required().invalid(Joi.ref("oldPassword")).messages({
      "any.invalid": ERROR_MESSAGES.PASSWORD_SAME_AS_OLD,
    }),
  ),
});

export const updateProfileSchema = Joi.object({
  fullName,
  email,
  phone,
  gender,
  dateOfBirth,
})
  .min(1)
  .messages({
    "object.min": "At Least One Field is Required to Update",
  });
