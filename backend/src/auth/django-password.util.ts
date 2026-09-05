import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export class DjangoPasswordUtil {
  /**
   * Verifies a raw password against a Django pbkdf2_sha256 or bcrypt stored hash string.
   */
  static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    if (!storedHash) return false;

    // Django pbkdf2_sha256 format: pbkdf2_sha256$iterations$salt$hash
    if (storedHash.startsWith('pbkdf2_sha256$')) {
      const parts = storedHash.split('$');
      if (parts.length !== 4) return false;

      const [, iterationsStr, salt, expectedHash] = parts;
      const iterations = parseInt(iterationsStr, 10);
      if (isNaN(iterations)) return false;

      const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
      const computedHash = derivedKey.toString('base64');
      return computedHash === expectedHash;
    }

    // Bcrypt fallback for legacy hashes if any
    if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
      return bcrypt.compare(password, storedHash);
    }

    // Plain text check for emergency fallback
    return password === storedHash;
  }

  /**
   * Hashes a raw password into Django's standard pbkdf2_sha256 format.
   */
  static hashPassword(password: string, iterations = 390000): string {
    const salt = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
    const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
    const hashBase64 = derivedKey.toString('base64');
    return `pbkdf2_sha256$${iterations}$${salt}$${hashBase64}`;
  }
}
