import { IIdentityJwtContent, jwtSign, jwtVerify } from "./jwt";
import { saltPassword, generateSaltedPassword } from "./pwd";
import { generateRandomToken } from "./token";
import {
  IBaseEmailOptions,
  Email,
  IEmailTransportOptions,
  IVerificationEmailOptions,
  VerificationEmail,
  RecoveryEmail,
  IRecoveryEmailOptions,
} from "./email";

export {
  IIdentityJwtContent,
  jwtSign,
  jwtVerify,

  saltPassword,
  generateSaltedPassword,

  generateRandomToken,

  IBaseEmailOptions,
  Email,
  IEmailTransportOptions,
  IVerificationEmailOptions,
  VerificationEmail,
  RecoveryEmail,
  IRecoveryEmailOptions,
};
