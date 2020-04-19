import jwt from "jsonwebtoken";
import { UserAccountType } from "../../db";

const DEFAULT_ALGORITHM = "RS256";

interface IJwtOptions {
  expiresIn: number;
}

interface IIdentityJwtContent {
  uuid: string;
  email: string;

  accountType: UserAccountType;
}

const jwtSign = async <T extends object>(payload: T, privateKey: string, options: IJwtOptions): Promise<string> => new Promise((resolve, reject) => {
  jwt.sign(payload, privateKey, { ...options, algorithm: DEFAULT_ALGORITHM }, (error, token) => {
    if (error != null) {
      return reject(error);
    }

    return resolve(token);
  });
});

const jwtVerify = async <T extends object>(token: string, publicKey: string): Promise<T> => new Promise((resolve, reject) => {
  jwt.verify(token, publicKey, { algorithms: [DEFAULT_ALGORITHM] }, (error, decoded) => {
    if (error != null) {
      return reject(error);
    }

    // should not be null if there is no error
    return resolve(decoded as T);
  });
});

export {
  IIdentityJwtContent,
  jwtSign,
  jwtVerify,
};
