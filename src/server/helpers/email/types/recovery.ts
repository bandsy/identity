import { IEmailTransportOptions } from "./transporter";
import { Email, IBaseEmailOptions } from "./email";

interface IRecoveryEmailOptions extends IBaseEmailOptions {
  recoveryCode: string;
}

const DEFAULT_SUBECT = "Bandsy account verification";

class RecoveryEmail extends Email<IRecoveryEmailOptions> {
  constructor(transportOptions: IEmailTransportOptions) {
    super(transportOptions, "recovery.ejs");

    this.subject = DEFAULT_SUBECT;
  }
}

export {
  IRecoveryEmailOptions,
  RecoveryEmail,
};
