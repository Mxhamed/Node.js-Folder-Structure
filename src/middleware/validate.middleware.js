import { ValidationError } from "../utils/index.js";
import { ERROR_MESSAGES } from "../constants/index.js";

/**
 * Validate Request Body against Joi Schema
 * @param {Object} schema - Joi Validation Schema
 * @returns {Function} Express Middleware
 *
 * Usage: validateBody(createUserSchema)
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return ALL Errors
      stripUnknown: true, // Remove Unknown Fields
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_FAILED, errors);
    }

    req.validatedBody = value;
    next();
  };
};

/**
 * Validate Request Params
 * @param {Object} schema - Joi Validation Schema
 * @returns {Function} Express Middleware
 *
 * Usage: validateParams(updateUserSchema)
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false, // Return ALL Errors
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_FAILED, errors);
    }

    req.validatedParams = value;
    next();
  };
};

/**
 * Validate Request Query
 * @param {Object} schema - Joi Validation Schema
 * @returns {Function} Express Middleware
 *
 * Usage: validateQuery(paginatedUserSchema)
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false, // Return ALL Errors
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_FAILED, errors);
    }

    req.validatedQuery = value;
    next();
  };
};
