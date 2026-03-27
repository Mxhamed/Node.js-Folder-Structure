/**
 * Date Utility Functions
 * Helper Functions for Date Manipulation and Formatting
 */

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FORMATTING
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Format Date to YYYY-MM-DD
 * @param {Date|string|number} date - Date to Format
 * @returns {string} Formatted Date String
 *
 * @example
 * formatDate(new Date()) // "2025-03-15"
 * formatDate("2025-03-15T10:30:00Z") // "2025-03-15"
 */
export const formatDate = (date) => {
  if (!date) throw new Error("Date is Required");

  const d = new Date(date);
  if (isNaN(d.getTime())) throw new Error("Invalid Date");

  return d.toISOString().split("T")[0];
};

/**
 * Format Date to Human-Readable String
 * @param {Date|string|number} date - Date to Format
 * @returns {string} Formatted Date String
 *
 * @example
 * formatDateLong(new Date()) // "March 15, 2025"
 */
export const formatDateLong = (date) => {
  if (!date) throw new Error("Date is Required");

  const d = new Date(date);
  if (isNaN(d.getTime())) throw new Error("Invalid Date");

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format Date with Time
 * @param {Date|string|number} date - Date to Format
 * @returns {string} Formatted Datetime String
 *
 * @example
 * formatDateTime(new Date()) // "2025-03-15 10:30:45"
 */
export const formatDateTime = (date) => {
  if (!date) throw new Error("Date is Required");

  const d = new Date(date);
  if (isNaN(d.getTime())) throw new Error("Invalid Date");

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Convert Date to Unix Timestamp (Seconds)
 * @param {Date|string|number} dateInput - Date to Convert
 * @returns {number} Unix Timestamp in Seconds
 *
 * @example
 * toUnixTimestamp(new Date()) // 1710504645
 * toUnixTimestamp("2025-03-15T10:30:00Z") // 1710504600
 */
export const toUnixTimestamp = (dateInput) => {
  if (dateInput === null || dateInput === undefined) {
    throw new Error("Date Input is Required");
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) throw new Error("Invalid Date");

  // Convert Milliseconds to Seconds
  return Math.floor(date.getTime() / 1000);
};

/**
 * Convert Unix Timestamp to Date Object
 * @param {number} timestamp - Unix Timestamp in Seconds
 * @returns {Date} Date Object
 *
 * @example
 * fromUnixTimestamp(1710504645) // Date Object
 */
export const fromUnixTimestamp = (timestamp) => {
  if (typeof timestamp !== "number" || timestamp < 0) {
    throw new Error("Invalid Timestamp");
  }

  // Convert Seconds to Milliseconds
  return new Date(timestamp * 1000);
};

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATE MANIPULATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Add Days to a Date
 * @param {Date|string|number} date - Starting Date
 * @param {number} days - Number of Days to Add (Can be Negative)
 * @returns {Date} New Date
 *
 * @example
 * addDays(new Date(), 7) // Date 7 Days from Now
 * addDays(new Date(), -3) // Date 3 Days Ago
 */
export const addDays = (date, days) => {
  if (!date) throw new Error("Date is Required");
  if (typeof days !== "number") throw new Error("Days MUST be a Number");

  const result = new Date(date);
  if (isNaN(result.getTime())) throw new Error("Invalid Date");

  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add Hours to a Date
 * @param {Date|string|number} date - Starting Date
 * @param {number} hours - Number of Hours to Add
 * @returns {Date} New Date
 *
 * @example
 * addHours(new Date(), 2) // Date 2 Hours from Now
 */
export const addHours = (date, hours) => {
  if (!date) throw new Error("Date is Required");
  if (typeof hours !== "number") throw new Error("Hours MUST be a Number");

  const result = new Date(date);
  if (isNaN(result.getTime())) throw new Error("Invalid Date");

  result.setHours(result.getHours() + hours);
  return result;
};

/**
 * Add Minutes to a Date
 * @param {Date|string|number} date - Starting date
 * @param {number} minutes - Number of Minutes to Add
 * @returns {Date} New date
 *
 * @example
 * addMinutes(new Date(), 30) // Date 30 Minutes from Now
 */
export const addMinutes = (date, minutes) => {
  if (!date) throw new Error("Date is Required");
  if (typeof minutes !== "number") throw new Error("Minutes MUST be a Number");

  const result = new Date(date);
  if (isNaN(result.getTime())) throw new Error("Invalid Date");

  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

/**
 * Add Seconds to a Date
 * @param {Date|string|number} date - Starting Date
 * @param {number} seconds - Number of Seconds to Add
 * @returns {Date} New Date
 *
 * @example
 * addSeconds(new Date(), 300) // Date 5 Minutes from Now
 */
export const addSeconds = (date, seconds) => {
  if (!date) throw new Error("Date is Required");
  if (typeof seconds !== "number") throw new Error("Seconds MUST be a Number");

  const result = new Date(date);
  if (isNaN(result.getTime())) throw new Error("Invalid Date");

  result.setSeconds(result.getSeconds() + seconds);
  return result;
};

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATE COMPARISON
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check If Date is in the Past
 * @param {Date|string|number} date - Date to Check
 * @returns {boolean} True If Date is in the Past
 *
 * @example
 * isPast(new Date("2020-01-01")) // true
 * isPast(new Date("2030-01-01")) // false
 */
export const isPast = (date) => {
  if (!date) throw new Error("Date is Required");

  const d = new Date(date);
  if (isNaN(d.getTime())) throw new Error("Invalid Date");

  return d < new Date();
};

/**
 * Check If Date is in the Future
 * @param {Date|string|number} date - Date to Check
 * @returns {boolean} True If Date is in the Future
 *
 * @example
 * isFuture(new Date("2030-01-01")) // true
 * isFuture(new Date("2020-01-01")) // false
 */
export const isFuture = (date) => {
  if (!date) throw new Error("Date is Required");

  const d = new Date(date);
  if (isNaN(d.getTime())) throw new Error("Invalid Date");

  return d > new Date();
};

/**
 * Check If Date is Today
 * @param {Date|string|number} date - Date to Check
 * @returns {boolean} True If Date is Today
 *
 * @example
 * isToday(new Date()) // true
 */
export const isToday = (date) => {
  if (!date) throw new Error("Date is Required");

  const d = new Date(date);
  if (isNaN(d.getTime())) throw new Error("Invalid Date");

  const today = new Date();
  return d.toDateString() === today.toDateString();
};

/**
 * Check If Two Dates are on the Same Day
 * @param {Date|string|number} date1 - First Date
 * @param {Date|string|number} date2 - Second Date
 * @returns {boolean} True If Dates are on the Same Day
 *
 * @example
 * isSameDay(new Date("2025-03-15"), new Date("2025-03-15T23:59:59")) // true
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) throw new Error("Both dates are Required");

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    throw new Error("Invalid Date");
  }

  return d1.toDateString() === d2.toDateString();
};

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATE CALCULATIONS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get Difference in Days between Two Dates
 * @param {Date|string|number} date1 - First Date
 * @param {Date|string|number} date2 - Second Date
 * @returns {number} Absolute Difference in Days
 *
 * @example
 * daysDifference("2025-03-15", "2025-03-20") // 5
 */
export const daysDifference = (date1, date2) => {
  if (!date1 || !date2) throw new Error("Both Dates are Required");

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    throw new Error("Invalid Date");
  }

  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get Difference in Hours between Two Dates
 * @param {Date|string|number} date1 - First Date
 * @param {Date|string|number} date2 - Second Date
 * @returns {number} Absolute Difference in Hours
 *
 * @example
 * hoursDifference("2025-03-15T10:00:00", "2025-03-15T15:00:00") // 5
 */
export const hoursDifference = (date1, date2) => {
  if (!date1 || !date2) throw new Error("Both Dates are Required");

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    throw new Error("Invalid Date");
  }

  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60));
};

/**
 * Get Difference in Minutes between Two Dates
 * @param {Date|string|number} date1 - First Date
 * @param {Date|string|number} date2 - Second Date
 * @returns {number} Absolute Difference in Minutes
 *
 * @example
 * minutesDifference("2025-03-15T10:00:00", "2025-03-15T10:30:00") // 30
 */
export const minutesDifference = (date1, date2) => {
  if (!date1 || !date2) throw new Error("Both Dates are Required");

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    throw new Error("Invalid Date");
  }

  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60));
};

/**
 * Get Age in Years from Birthdate
 * @param {Date|string|number} birthdate - Date of Birth
 * @returns {number} Age in Years
 *
 * @example
 * getAge("1995-06-15") // 29 (as of 2025)
 */
export const getAge = (birthdate) => {
  if (!birthdate) throw new Error("Birthdate is Required");

  const birth = new Date(birthdate);
  if (isNaN(birth.getTime())) throw new Error("Invalid Date");

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY FUNCTIONS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get Start of Day (00:00:00.000)
 * @param {Date|string|number} date - Date
 * @returns {Date} Start of Day
 *
 * @example
 * startOfDay(new Date("2025-03-15T15:30:00")) // 2025-03-15T00:00:00.000
 */
export const startOfDay = (date) => {
  if (!date) throw new Error("Date is Required");

  const d = new Date(date);
  if (isNaN(d.getTime())) throw new Error("Invalid Date");

  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get End of Day (23:59:59.999)
 * @param {Date|string|number} date - Date
 * @returns {Date} End of Day
 *
 * @example
 * endOfDay(new Date("2025-03-15T10:00:00")) // 2025-03-15T23:59:59.999
 */
export const endOfDay = (date) => {
  if (!date) throw new Error("Date is Required");

  const d = new Date(date);
  if (isNaN(d.getTime())) throw new Error("Invalid Date");

  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Check If Date is Valid
 * @param {any} date - Value to Check
 * @returns {boolean} True If Valid Date
 *
 * @example
 * isValidDate(new Date()) // true
 * isValidDate("invalid") // false
 */
export const isValidDate = (date) => {
  if (date === null || date === undefined) return false;

  const d = new Date(date);
  return !isNaN(d.getTime());
};

/**
 * Get Relative Time Description
 * @param {Date|string|number} date - Date to Compare
 * @returns {string} Relative Time Description
 *
 * @example
 * getRelativeTime(addMinutes(new Date(), -5)) // "5 Minutes Ago"
 * getRelativeTime(addHours(new Date(), 2)) // "In 2 Hours"
 */
export const getRelativeTime = (date) => {
  if (!date) throw new Error("Date is Required");

  const d = new Date(date);
  if (isNaN(d.getTime())) throw new Error("Invalid date");

  const now = new Date();
  const diffMs = d - now;
  const diffSec = Math.floor(Math.abs(diffMs) / 1000);
  const isPast = diffMs < 0;

  // Return "just now" for Very Recent Times (Less than 1 Second)
  if (diffSec < 1) return "Just Now";

  const intervals = [
    { label: "Year", seconds: 31536000 },
    { label: "Month", seconds: 2592000 },
    { label: "Day", seconds: 86400 },
    { label: "Hour", seconds: 3600 },
    { label: "Minute", seconds: 60 },
    { label: "Second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffSec / interval.seconds);

    if (count >= 1) {
      const plural = count > 1 ? "s" : "";
      return isPast
        ? `${count} ${interval.label}${plural} Ago`
        : `In ${count} ${interval.label}${plural}`;
    }
    return "Just Now"; // Fallback
  }
};

/**
 * Converts a Duration String to Seconds
 * @param {string} duration - e.g. "15m", "24h", "7d"
 * @returns {number} Duration in Seconds
 */
export const toSeconds = (duration) => {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1), 10);
  switch (unit) {
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 24 * 60 * 60;
    default:
      throw new Error(`Unknown Duration Unit: ${unit}`);
  }
};
