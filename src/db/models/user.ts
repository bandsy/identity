import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import muuid from "uuid-mongodb";
import { Binary } from "bson";

import { IUser, UserAccountType, OauthServiceType } from "../types";

@modelOptions({
  schemaOptions: {
    toObject: {
      virtuals: true,
    },
  },
})
class User implements IUser {
  @prop({
    required: true,
    default: muuid.v4,
  })
  public _id!: object;

  @prop({
    default: undefined,
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
    default: undefined,
  })
  public opaqueToken?: string;

  @prop({
    default: undefined,
  })
  public opaqueTokenExpiry?: Date;

  @prop({
    default: undefined,
  })
  public salt?: string;

  @prop({
    default: undefined,
  })
  public passwordHash?: string;

  @prop({
    default: undefined,
  })
  public verificationCode?: string;

  @prop({
    default: undefined,
  })
  public verificationCodeExpiry?: Date;

  @prop({
    default: undefined,
  })
  public verified?: boolean;

  @prop({
    enum: OauthServiceType,
    default: undefined,
  })
  public oauthService?: OauthServiceType;

  @prop({
    default: undefined,
  })
  public oauthId?: string;

  @prop({
    default: undefined,
  })
  public accessToken?: string;

  // virtuals
  public get uuid(): string {
    // eslint-disable-next-line no-underscore-dangle
    return muuid.from(this._id as Binary).toString();
  }
}

const UserModel = getModelForClass(User);

export {
  User,
  UserModel,
};
