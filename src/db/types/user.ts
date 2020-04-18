import { OauthServiceType } from "./oauth";
import {
  IBase,
  IBaseSearchInfo,
  IBaseCreateInfo,
  IBaseUpdateInfo,
} from "./base";
import { IMfaRecoveryCode } from "./mfa";

enum UserAccountType {
  BANDSY,
  OAUTH,
}

interface IUser extends IBase {
  accountType: UserAccountType;

  email: string;
  verified: boolean;

  // bandsy account type
  salt?: string;
  passwordHash?: string;

  // oauth account type
  oauthService?: OauthServiceType;
  accessToken?: string;
  accessTokenType?: string;
  accessTokenExpiresAt?: Date;
  refreshToken?: string;
  oauthScope?: string;

  // 2fa stuff
  mfaEnabled: boolean;
  mfaSecret?: string;
  mfaRecoveryCodes?: IMfaRecoveryCode[];
}

interface IUserSearchInfo extends IBaseSearchInfo<IUser> {
  accountType?: UserAccountType;

  email?: string;
  verified?: boolean;

  oauthService?: OauthServiceType;
}

interface IUserCreateInfo extends IBaseCreateInfo<IUser> {
  accountType: UserAccountType;

  email: string;
  verified: boolean;

  salt?: string;
  passwordHash?: string;

  oauthService?: OauthServiceType;
  accessToken?: string;
  accessTokenType?: string;
  accessTokenExpiresAt?: Date;
  refreshToken?: string;
  oauthScope?: string;
}

interface IUserUpdateInfo extends IBaseUpdateInfo<IUser> {
  verified?: boolean;

  salt?: string;
  passwordHash?: string;

  accessToken?: string;
  accessTokenType?: string;
  accessTokenExpiresAt?: Date;
  refreshToken?: string;
  oauthScope?: string;
}

export {
  UserAccountType,
  IUser,
  IUserSearchInfo,
  IUserCreateInfo,
  IUserUpdateInfo,
};
