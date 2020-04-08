/* eslint-disable max-classes-per-file */
import { prop, getModelForClass, setGlobalOptions } from "@typegoose/typegoose";
import muuid from "uuid-mongodb";
import { Binary } from "bson";

setGlobalOptions({
  schemaOptions: {
    toObject: {
      virtuals: true,
    },
  },
});

enum UserAccountType {
  BANDSY,
  OAUTH,
}

enum OauthServiceType {
  DISCORD,
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

interface IDbUpdateInfo {
  success: boolean;
  matchedCount: number;
  updatedCount: number;
}

interface IDbDeleteInfo {
  success: boolean;
  matchedCount: number;
  deletedCount: number;
}

class User implements IUser {
  @prop({
    required: true,
    default: muuid.v4,
  })
  public _id!: object;

  @prop({
    default: null,
  })
  public __v?: number;

  @prop({
    required: true,
    enum: UserAccountType,
  })
  public accountType!: UserAccountType;

  @prop({
    required: true,
  })
  public email!: string;

  @prop({
    default: null,
  })
  public password?: string;

  @prop({
    default: null,
  })
  public verificationCode?: string;

  @prop({
    default: null,
  })
  public verified?: boolean;

  @prop({
    enum: OauthServiceType,
    default: null,
  })
  public oauthService?: OauthServiceType;

  @prop({
    default: null,
  })
  public oauthId?: string;

  @prop({
    default: null,
  })
  public accessToken?: string;

  // virtuals
  public get uuid(): string {
    // eslint-disable-next-line no-underscore-dangle
    return muuid.from(this._id as Binary).toString();
  }
}

const UserModel = getModelForClass(User);

class UserService {
  public static async findUserByUuid(uuid: string): Promise<IUser> {
    try {
      const bsonUuid = muuid.from(uuid);

      return (await UserModel.findById(bsonUuid))?.toObject();
    } catch (error) {
      throw new Error(`error finding user by uuid: ${error}`);
    }
  }

  public static async findUserByEmail(email: string): Promise<IUser> {
    try {
      return (await UserModel.findOne({ email }))?.toObject();
    } catch (error) {
      throw new Error(`error finding user by email: ${error}`);
    }
  }

  public static async findUsers(searchInfo: IUserSearchInfo): Promise<IUser[]> {
    try {
      return (await UserModel.find(searchInfo)).map(e => e.toObject());
    } catch (error) {
      throw new Error(`error finding users ( searchInfo: ${searchInfo} ): ${error}`);
    }
  }

  public static async createUser(createInfo: IUserCreateInfo): Promise<IUser> {
    try {
      return (await UserModel.create(createInfo)).toObject();
    } catch (error) {
      throw new Error(`error creating user ( createInfo: ${createInfo} ): ${error}`);
    }
  }

  public static async updateUser(uuid: string, updateInfo: IUserUpdateInfo): Promise<IDbUpdateInfo> {
    try {
      const bsonUuid = muuid.from(uuid);

      const tempInfo = await UserModel.updateOne({ _id: bsonUuid as object }, updateInfo);

      return tempInfo;
    } catch (error) {
      throw new Error(`error updating user ( uuid: ${uuid}, updateInfo: ${updateInfo} ): ${error}`);
    }
  }

  public static async deleteUser(uuid: string): Promise<IDbDeleteInfo> {
    try {
      const bsonUuid = muuid.from(uuid);

      const tempInfo = await UserModel.deleteOne({ _id: bsonUuid as object });

      return tempInfo as any;
    } catch (error) {
      throw new Error(`error deleting user ( uuid: ${uuid} ): ${error}`);
    }
  }
}

export {
  UserAccountType,
  OauthServiceType,
  IUser,
  IUserSearchInfo,
  IUserCreateInfo,
  IUserUpdateInfo,
  IDbUpdateInfo,
  IDbDeleteInfo,
  User,
  UserModel,
  UserService,
};
