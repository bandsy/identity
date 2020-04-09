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
  opaqueToken?: string;
  opaqueTokenExpiry?: Date;

  // bandsy account type
  salt?: string;
  passwordHash?: string;

  verificationCode?: string;
  verificationCodeExpiry?: Date;
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
  opaqueToken?: string;
  verified?: boolean;
  oauthService?: OauthServiceType;
  oauthId?: string;
}

interface IUserCreateInfo {
  accountType: UserAccountType;
  email: string;
  opaqueToken?: string;
  opaqueTokenExpiry?: Date;

  salt?: string;
  passwordHash?: string;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  verified?: boolean;
  oauthService?: OauthServiceType;
  oauthId?: string;
  accessToken?: string;
}

interface IUserUpdateInfo {
  opaqueToken?: string;
  opaqueTokenExpiry?: Date;
  salt?: string;
  passwordHash?: string;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
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
