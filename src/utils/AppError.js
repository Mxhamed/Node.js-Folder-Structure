import { HTTP_STATUS, ERROR_MESSAGES } from "../constants/index.js";

/**
 * Base Application Error Class
 * ALL Custom Errors Inherit from this
 */
export default class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 * Use when: Request is Malformed or Contains Invalid Syntax
 */
export class BadRequestError extends AppError {
  constructor(message = ERROR_MESSAGES.INVALID_INPUT) {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

/**
 * 401 Unauthorized
 * Use when: Authentication is Required BUT Missing/Invalid
 */
export class UnauthorizedError extends AppError {
  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * 403 Forbidden
 * Use when: User is Authenticated BUT Lacks Permissions
 */
export class ForbiddenError extends AppError {
  constructor(message = ERROR_MESSAGES.FORBIDDEN) {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

/**
 * 404 Not Found
 * Use when: Requested Resource DOESN'T Exist
 */
export class NotFoundError extends AppError {
  constructor(message = ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

/**
 * 409 Conflict
 * Use when: Resource ALREADY Exists or State Conflict
 */
export class ConflictError extends AppError {
  constructor(message = ERROR_MESSAGES.RESOURCE_ALREADY_EXISTS) {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

/**
 * 413 Payload Too Large
 * Use when: Request Body/File Exceeds Size Limits
 */
export class PayloadTooLargeError extends AppError {
  constructor(message = ERROR_MESSAGES.PAYLOAD_TOO_LARGE) {
    super(message, HTTP_STATUS.PAYLOAD_TOO_LARGE);
  }
}

/**
 * 422 Unprocessable Entity
 * Use when: Request Validation Fails
 */
export class ValidationError extends AppError {
  constructor(message = ERROR_MESSAGES.VALIDATION_FAILED, errors = null) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    this.errors = errors; // Detailed validation errors
  }
}

/**
 * 429 Too Many Requests
 * Use when: Rate Limit Exceeded
 */
export class TooManyRequestsError extends AppError {
  constructor(message = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS);
  }
}

/**
 * 500 Internal Server Error
 * Use when: Unexpected Server Error Occurs
 */
export class InternalServerError extends AppError {
  constructor(message = ERROR_MESSAGES.INTERNAL_ERROR) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * 503 Service Unavailable
 * Use when: Server is Temporarily Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = ERROR_MESSAGES.SERVICE_UNAVAILABLE) {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }
}

/**
 * 504 Gateway Timeout
 * Use when: Upstream Service Timeout
 */
export class GatewayTimeoutError extends AppError {
  constructor(message = "Gateway timeout - Request took too long") {
    super(message, HTTP_STATUS.GATEWAY_TIMEOUT);
  }
}
