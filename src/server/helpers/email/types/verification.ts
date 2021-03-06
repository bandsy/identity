import { IEmailTransportOptions } from "./transporter";
import { Email, IBaseEmailOptions } from "./email";

interface IVerificationEmailOptions extends IBaseEmailOptions {
  verificationCode: string;
}

const DEFAULT_SUBECT = "Bandsy account verification";

class VerificationEmail extends Email<IVerificationEmailOptions> {
  constructor(transportOptions: IEmailTransportOptions) {
    super(transportOptions, "verification.ejs");

    this.subject = DEFAULT_SUBECT;
  }
}

export {
  IVerificationEmailOptions,
  VerificationEmail,
};
