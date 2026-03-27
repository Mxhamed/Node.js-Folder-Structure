export {
  generateJTI,
  generateOTP,
  generateSlug,
  toSnakeCase,
  toCamelCase,
  toTitleCase,
  maskEmail,
  maskPhone,
  truncate,
  buildRedisKey,
} from "./string.js";

export {
  formatDate,
  formatDateLong,
  formatDateTime,
  toUnixTimestamp,
  fromUnixTimestamp,
  addDays,
  addHours,
  addMinutes,
  addSeconds,
  isPast,
  isFuture,
  isToday,
  isSameDay,
  daysDifference,
  hoursDifference,
  minutesDifference,
  getAge,
  startOfDay,
  endOfDay,
  isValidDate,
  getRelativeTime,
  toSeconds,
} from "./date.js";

export {
  default as AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  PayloadTooLargeError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
  GatewayTimeoutError,
} from "./AppError.js";

export { sendSuccess, sendError, sendPaginated } from "./response.js";

export { encrypt, decrypt } from "./crypto.js";

export { hashPassword, verifyPassword } from "./password.js";

export {
  generateToken,
  generateAuthTokens,
  decodeToken,
  verifyToken,
} from "./jwt.js";

export { connectToSMTP, composeMail, sendMail } from "./mailer.js";
