import { prop, modelOptions } from "@typegoose/typegoose";
import muuid from "uuid-mongodb";
import { Binary } from "bson";

import { IBase } from "../types";

@modelOptions({
  schemaOptions: {
    toObject: {
      virtuals: true,
    },
  },
})
class Base implements IBase {
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
    default: Date.now,
  })
  public createdAt!: Date;

  @prop({
    default: Date.now,
  })
  public updatedAt!: Date;

  // virtuals
  public get uuid(): string {
    // eslint-disable-next-line no-underscore-dangle
    return muuid.from(this._id as Binary).toString();
  }
}

export default Base;
