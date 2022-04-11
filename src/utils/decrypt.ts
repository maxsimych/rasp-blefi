import crypto from 'crypto';

const algorithm = 'aes128';
const outputEncoding = 'utf8';

export default function decrypt(encrypted: Buffer, key: string) {
  const decipher = crypto.createDecipheriv(algorithm, key, 'B?E(H+MbQeThWmZq');
  let decrypted = decipher.update(encrypted, undefined, outputEncoding);
  decrypted += decipher.final(outputEncoding);
  return decrypted;
}
