import { ERROR_MESSAGES, HTTP_STATUS } from "../constants/index.js";

/**
 * Send Success Response
 * @param {Object} res - Express Response Object
 * @param {Object} options - Response Options
 * @param {*} options.data - Response Data
 * @param {string} options.message - Success Message (OPTIONAL)
 * @param {number} options.statusCode - HTTP Status Code (Default: 200)
 */
export const sendSuccess = (
  res,
  { data, message, statusCode = HTTP_STATUS.OK },
) => {
  const response = {
    success: true,
    statusCode,
  };

  if (message) response.message = message;
  if (data !== undefined) response.data = data;

  return res.status(statusCode).json(response);
};

/**
 * Send Error Response
 * Usually Handled by Error Middleware, BUT Available for Manual Use
 * @param {Object} res - Express Response Object
 * @param {Object} options - Error Options
 * @param {string} options.message - Error Message
 * @param {number} options.statusCode - HTTP Status Code (Default: 500)
 * @param {Array} options.errors - Detailed Validation Errors (OPTIONAL)
 */
export const sendError = (
  res,
  { message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors },
) => {
  const response = {
    success: false,
    statusCode,
    message: message || ERROR_MESSAGES.INTERNAL_ERROR,
  };

  if (errors) response.errors = errors;

  return res.status(statusCode).json(response);
};

/**
 * Send Paginated Response
 * @param {Object} res - Express Response Object
 * @param {Object} options - Pagination Options
 * @param {*} options.data - Paginated Data
 * @param {Object} options.pagination - Pagination Metadata
 * @param {number} options.pagination.currentPage - Current Page Number
 * @param {number} options.pagination.pageSize - Items per Page
 * @param {number} options.pagination.totalPages - Total Number of Pages
 * @param {number} options.pagination.totalItems - Total Number of Items
 * @param {boolean} options.pagination.hasMore - Whether More Pages Exist
 * @param {string} options.message - message (OPTIONAL)
 */
export const sendPaginated = (res, { data, pagination, message }) => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    statusCode: HTTP_STATUS.OK,
    ...(message && { message }),
    data,

    pagination: {
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      hasMore: pagination.hasMore,
    },
  });
};
