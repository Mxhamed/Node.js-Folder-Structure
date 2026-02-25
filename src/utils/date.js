/**
 * Format Date to YYYY-MM-DD
 * @param {Date|string} date - Date to Format
 * @returns {string} Formatted Date String
 */
export const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

/**
 * Add Days to a Date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of Days to Add
 * @returns {Date} New Date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Check If Date is in the Past
 * @param {Date|string} date - Date to Check
 * @returns {boolean} True If Date is in the Past
 */
export const isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Get Difference in Days between Two Dates
 * @param {Date|string} date1 - First Date
 * @param {Date|string} date2 - Second Date
 * @returns {number} Difference in Days
 */
export const daysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
