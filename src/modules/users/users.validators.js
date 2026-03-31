import Joi from "joi";
import { PATTERNS, ERROR_MESSAGES, USER_ROLES } from "../../constants/index.js";

// ─── Constants ──────────────────────────────────────────

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// ─── Schemas ──────────────────────────────────────────

export const userIdSchema = Joi.object({
  id: Joi.string().pattern(PATTERNS.OBJECT_ID).required().messages({
    "string.pattern.base": ERROR_MESSAGES.INVALID_OBJECT_ID,
    "any.required": "User ID is Required",
  }),
});

export const getALlUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(DEFAULT_PAGE).messages({
    "number.base": "Page MUST be a Number",
    "number.min": "Page MUST be at Least 1",
  }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(MAX_LIMIT)
    .default(DEFAULT_LIMIT)
    .messages({
      "number.base": "Limit MUST be a Number",
      "number.min": "Limit MUST be at Least 1",
      "number.max": "Limit CANNOT Exceed 100",
    }),
});

export const updateRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .required()
    .messages({
      "any.only": `Role MUST be One of: ${Object.values(USER_ROLES).join(", ")}`,
      "any.required": "Role is Required",
    }),
});
