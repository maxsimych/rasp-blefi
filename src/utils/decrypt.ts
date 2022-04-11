import crypto from 'crypto';
import Buffer from 'buffer';
import { logger } from './logger';

const ALGORITHM = 'aes128';
const OUTPUT_ENCODING = 'utf8';
const IV_LENGTH = 16;

export default function decrypt(encrypted: Buffer, key: string) {
  const ivStart = encrypted.length - IV_LENGTH;
  const iv = encrypted.subarray(ivStart);
  logger.info('iv is:');
  logger.info(iv);
  const data = encrypted.subarray(0, ivStart);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(data, undefined, OUTPUT_ENCODING);
  decrypted += decipher.final(OUTPUT_ENCODING);
  return decrypted;
}
