import { prop } from "@typegoose/typegoose";

import Base from "./base";
import { IVerification, IVerificationType } from "../types";

class Verification extends Base implements IVerification {
  @prop({
    required: true,
  })
  public userUuid!: string;

  @prop({
    required: true,
  })
  public userEmail!: string;

  @prop({
    required: true,
    unique: true,
  })
  public code!: string;

  @prop({
    required: true,
    enum: IVerificationType,
  })
  public type!: IVerificationType;

  @prop({
    required: true,
  })
  public validUntil!: Date;
}

export default Verification;
