import { prop, getModelForClass } from "@typegoose/typegoose";

import { Base } from "../schemas";
import { IUser, UserAccountType, OauthServiceType } from "../types";

class User extends Base implements IUser {
  @prop({
    required: true,
    enum: UserAccountType,
  })
  public accountType!: UserAccountType;

  @prop({
    required: true,
    unique: true,
  })
  public email!: string;

  @prop({
    default: null,
  })
  public verified!: boolean;

  @prop({
    default: null,
  })
  public salt?: string;

  @prop({
    default: null,
  })
  public passwordHash?: string;

  @prop({
    enum: OauthServiceType,
    default: null,
  })
  public oauthService?: OauthServiceType;

  @prop({
    default: null,
  })
  public accessToken?: string;
}

const UserModel = getModelForClass(User);

export {
  User,
  UserModel,
};
