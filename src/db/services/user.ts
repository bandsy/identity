import muuid from "uuid-mongodb";

import { UserModel } from "../models";
import {
  IUser,
  IUserSearchInfo,
  IUserCreateInfo,
  IUserUpdateInfo,
  IDbUpdateInfo,
  IDbDeleteInfo,
} from "../types";

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return tempInfo as any;
    } catch (error) {
      throw new Error(`error deleting user ( uuid: ${uuid} ): ${error}`);
    }
  }
}

export {
  // eslint-disable-next-line import/prefer-default-export
  UserService,
};
