import { Document } from "mongoose";

import { IBaseService, BaseService } from "./base";
import { User } from "../schemas";
import { IUser } from "../types";
import { UserModel } from "../models";

interface IUserService extends IBaseService<User> {
  findByEmail(email: string): Promise<IUser | null>;
}

// workaround cos community made types are fine, until you try to get 2 libs working together...
type UserDoc = User & Document;

// TODO: redefine the other methods to use the proper option interfaces
class UserService extends BaseService<UserDoc> implements IUserService {
  constructor() {
    super();

    // ye this is terrible, i know, but dependency injection shit is broke af
    this.model = UserModel;
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    try {
      return (await this.model.findOne({ email }))?.toObject();
    } catch (error) {
      throw new Error(`error finding user by email: ${error}`);
    }
  }
}

export {
  IUserService,
  UserService,
};
