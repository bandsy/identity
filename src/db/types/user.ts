import { OauthServiceType } from "./oauth";

enum UserAccountType {
  BANDSY,
  OAUTH,
}

interface IUser {
  _id: object;
  uuid: string;
  __v?: number;

  accountType: UserAccountType;

  email: string;

  // bandsy account type
  password?: string;

  verificationCode?: string;
  verified?: boolean;

  // oauth account type
  oauthService?: OauthServiceType;
  oauthId?: string;
  accessToken?: string;
}

interface IUserSearchInfo {
  uuid?: object;
  accountType?: UserAccountType;
  email?: string;
  password?: string;
  verified?: boolean;
  oauthService?: OauthServiceType;
  oauthId?: string;
}

interface IUserCreateInfo {
  accountType: UserAccountType;
  email: string;

  password?: string;
  verificationCode?: string;
  verified?: boolean;
  oauthService?: OauthServiceType;
  oauthId?: string;
  accessToken?: string;
}

interface IUserUpdateInfo {
  password?: string;
  verificationCode?: string;
  verified?: boolean;
  accessToken?: string;
}

export {
  UserAccountType,
  IUser,
  IUserSearchInfo,
  IUserCreateInfo,
  IUserUpdateInfo,
};
