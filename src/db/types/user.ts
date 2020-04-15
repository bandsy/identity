import { OauthServiceType } from "./oauth";
import {
  IBase,
  IBaseSearchInfo,
  IBaseCreateInfo,
  IBaseUpdateInfo,
} from "./base";

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
}

interface IUserUpdateInfo extends IBaseUpdateInfo<IUser> {
  verified?: boolean;

  salt?: string;
  passwordHash?: string;

  accessToken?: string;
}

export {
  UserAccountType,
  IUser,
  IUserSearchInfo,
  IUserCreateInfo,
  IUserUpdateInfo,
};
