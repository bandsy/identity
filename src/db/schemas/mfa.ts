import { prop } from "@typegoose/typegoose";

import { IMfaRecoveryCode } from "../types";

class MfaRecoveryCode implements IMfaRecoveryCode {
  @prop({
    required: true,
  })
  public code!: string;

  @prop({
    required: true,
  })
  public valid!: boolean;
}

export default MfaRecoveryCode;
