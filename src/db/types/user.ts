import { OauthServiceType } from "./oauth";
import { IBase } from "./base";

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

interface IUserSearchInfo {
  uuid?: object;
  accountType?: UserAccountType;
  email?: string;
  verified?: boolean;
  oauthService?: OauthServiceType;
  oauthId?: string;
}

interface IUserCreateInfo {
  accountType: UserAccountType;
  email: string;

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

// interface IBaseModel {
//   _id: object;
//   uuid: string;
//   __v?: number;

//   createdAt: Date;
//   updatedAt: Date;
// }

// enum SearchComparison {
//   EQUAL,
//   LESS,
//   GREATER,
// }

// interface ISearchOptions<T> {
//   value: T;
//   comparison: SearchComparison;
// }

// interface ISortOptions<T> {
//   value: T;
// }

// interface IBaseSearchInfo {
//   uuid?: string;

//   createdAt?: ISearchOptions<Date>;
//   updatedAt?: ISearchOptions<Date>;
// }

// interface IBaseCreateInfo {
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface IBaseUpdateInfo {
//   updatedAt: Date;
// }

// enum UserAccountType {
//   BANDSY,
//   OAUTH,
// }

// interface IBaseUser extends IBaseModel {
//   accountType: UserAccountType;
//   email: string;
//   verified: boolean;
// }

// interface IBaseUserSearchInfo extends IBaseSearchInfo {
//   accountType: UserAccountType;
//   email: string;
//   verified: boolean;
// }

// interface IBaseUserCreateInfo extends IBaseCreateInfo {
//   accountType: UserAccountType;
//   email: string;
//   verified: boolean;
// }

// interface IBaseUserUpdateInfo extends IBaseUpdateInfo {
//   accountType: UserAccountType;
//   email: string;
//   verified: boolean;
// }

// interface IBandsyUser extends IBaseUser {
//   salt: string;
//   passwordHash: string;
// }

// enum OauthServiceType {
//   DISCORD,
// }

// interface IOauthUser extends IBaseUser {
//   oauthServiceType: OauthServiceType;
//   accessToken: string;
// }

// // IBaseModel
// // IBaseSearchOptions
// // IBaseSortOptions
// // IBaseSortInfo
// // IBaseSearchInfo
// // IBaseCreateInfo
// // IBaseUpdateInfo

// // IDbUpdateInfo
// // IDbDeleteInfo

// // ---

// // IUser

// // IBandsyUser

// // IOauthUser
