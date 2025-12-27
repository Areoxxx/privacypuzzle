/**
 * Secure encryption module using AES-256-GCM.
 * Provides functions to encrypt and decrypt messages with authentication.
 * 
 * @module lib/encryption
 */

const crypto = require('node:crypto');

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

function encrypt(message, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(password, salt);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(message, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]);
}

function decrypt(encryptedData, password) {
  if (encryptedData.length < 44) {
    throw new Error('Invalid or corrupted encrypted data');
  }

  const salt = encryptedData.slice(0, 16);
  const iv = encryptedData.slice(16, 28);
  const tag = encryptedData.slice(28, 44);
  const ciphertext = encryptedData.slice(44);

  const key = deriveKey(password, salt);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

module.exports = {
  encrypt,
  decrypt
};
