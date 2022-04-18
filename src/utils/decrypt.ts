import crypto from 'crypto';

const ALGORITHM = 'aes128';
const IV_LENGTH = 16;

export default function decrypt(encrypted: Buffer, key: string) {
  const ivStart = encrypted.length - IV_LENGTH;
  const iv = encrypted.subarray(ivStart);
  const data = encrypted.subarray(0, ivStart);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(data);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
}
