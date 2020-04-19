import { randomBytes } from "crypto";

const generateRandomToken = (length: number): Promise<string> => new Promise((resolve, reject) => {
  randomBytes(Math.ceil(length / 2), (error, buffer) => {
    if (error != null) {
      return reject(error);
    }

    return resolve(buffer.toString("hex").slice(0, length));
  });
});

export {
  // eslint-disable-next-line import/prefer-default-export
  generateRandomToken,
};
