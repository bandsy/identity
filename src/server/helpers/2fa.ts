import { createHmac, randomBytes } from "crypto";

import base32 from "hi-base32";

const generateSecret = (length = 20): string => {
  const randomBuffer = randomBytes(length);
  return base32.encode(randomBuffer).replace(/=/g, "");
};

const dynamicTruncate = (hmacValue: Buffer): number => {
  const offset = (hmacValue[hmacValue.length - 1] & 0xf);

  return (((hmacValue[offset] & 0x7f) << 24)
    | ((hmacValue[offset + 1] & 0xff) << 16)
    | ((hmacValue[offset + 2] & 0xff) << 8)
    | (hmacValue[offset + 3] & 0xff));
};

const generateHOTP = (secret: string, counter: number): number => {
  const decodedSecret = base32.decode.asBytes(secret);
  const buffer = Buffer.alloc(8);

  let bufCounter = counter;
  for (let i = 0; i < 8; i += 1) {
    buffer[7 - i] = bufCounter & 0xff;
    bufCounter >>= 8;
  }

  const hmac = createHmac("sha1", Buffer.from(decodedSecret));
  hmac.update(buffer);
  const hmacResult = hmac.digest();

  const code = dynamicTruncate(hmacResult);

  return code % (10 ** 6);
};

const generateTOTP = (secret: string, window = 0): number => {
  const counter = Math.floor(Date.now() / 30000);

  return generateHOTP(secret, counter + window);
};

// TODO: input validation, esp for secret being null (i dont trust ts obviously)
const verifyTOTP = (token: number, secret: string, window = 1): boolean => {
  if (Math.abs(+window) > 5) {
    throw new Error("totp window too large");
  }

  for (let errorWindow = -window; errorWindow <= +window; errorWindow += 1) {
    const totp = generateTOTP(secret, errorWindow);

    if (token === totp) {
      return true;
    }
  }

  return false;
};

export {
  generateSecret,
  dynamicTruncate,
  generateHOTP,
  generateTOTP,
  verifyTOTP,
};
