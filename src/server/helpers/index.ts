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
import {
  IOauthOptions,
  IAccessTokenResponse,
  IUserResponse,
  ITokenEndpoints,
  tokenEndpoints,
  exchangeToken,
  refreshToken,
  fetchUserData,
} from "./oauth";

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

  IOauthOptions,
  IAccessTokenResponse,
  IUserResponse,
  ITokenEndpoints,
  tokenEndpoints,
  exchangeToken,
  refreshToken,
  fetchUserData,
};
