import { APP_NAME } from "../../config/config.service.js";

/**
 * Redis Key Generators for Token Management
 * @enum {function}
 */
export const REDIS_KEYS = {
  /**
   * Stores a Revoked Token's JTI
   * @param {string} sub - User ID
   * @param {string} jti - JWT ID
   * @returns {string} Redis key in Format: `${APP_NAME}:token_blacklist:${sub}:${jti}`
   */
  TOKEN_BLACKLIST: (sub, jti) => `${APP_NAME}:token_blacklist:${sub}:${jti}`,

  /**
   * Set of Revoked JTIs per User — Used for Logout-All Cleanup
   * @param {string} sub - User ID
   * @returns {string} Redis key in Format: `${APP_NAME}:revoked_sessions:${sub}`
   */
  REVOKED_SESSIONS: (sub) => `${APP_NAME}:revoked_sessions:${sub}`,
};
