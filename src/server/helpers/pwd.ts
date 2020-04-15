import { createHmac } from "crypto";
import { generateRandomToken } from "./token";

const DEFAULT_SALT_LENGTH = 24;

interface ISaltedPassword {
  salt: string;
  passwordHash: string;
}

const saltPassword = (password: string, salt: string): Promise<ISaltedPassword> => new Promise(resolve => {
  const hash = createHmac("sha512", salt);
  hash.update(password);

  const passwordHash = hash.digest("hex");

  resolve({
    salt,
    passwordHash,
  });
});

const generateSaltedPassword = async (password: string): Promise<ISaltedPassword> => (
  saltPassword(password, await generateRandomToken(DEFAULT_SALT_LENGTH)));

export {
  saltPassword,
  generateSaltedPassword,
};
