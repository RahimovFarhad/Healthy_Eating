/**
 * Password hashing utilities
 * Provides bcrypt-based password hashing and verification
 * @module utils/hash
 */

import bcrypt from "bcrypt";

const SALT_ROUNDS = 12; 

/**
 * Hashes a password using bcrypt
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a password against a hash
 * @param {string} password - The plain text password to verify
 * @param {string} hash - The hashed password to compare against
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}