import crypto from 'crypto';
import { logger } from './logger';

const ALGORITHM = 'aes128';
const OUTPUT_ENCODING = 'utf8';
const IV_LENGTH = 16;

export default function decrypt(encrypted: Buffer, key: string) {
  // TODO generate iv and concat it to the ciphertext, when set up MTU
  // const ivStart = encrypted.length - IV_LENGTH;
  // const iv = encrypted.subarray(ivStart);
  // const data = encrypted.subarray(0, ivStart);
  const ivString = process.env.ENCRYPTION_IV || 'QfTjWnZr4u7x!A%C';
  const iv = Buffer.from(ivString);
  const data = encrypted;
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(data, undefined, OUTPUT_ENCODING);
  decrypted += decipher.final(OUTPUT_ENCODING);
  return decrypted;
}
