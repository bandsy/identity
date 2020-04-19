import path from "path";
import fs from "fs";

import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import ejs from "ejs";

import { IEmailTransportOptions } from "./transporter";

const DEFAULT_DISPLAY_NAMME = "Bandsy Identity";
const DEFAULT_DISPLAY = "identity.bandsy@feinwaru.com";

interface IBaseEmailOptions {
  username: string;
}

// TODO: make emails better, as it currently is with all the inheritance, its probably a bit overkill lmao
abstract class Email<T extends IBaseEmailOptions> {
  protected transporter: Mail;

  protected displayName: string;

  protected display: string;

  protected template: string;

  protected subject!: string;

  constructor(transportOptions: IEmailTransportOptions, templateName: string) {
    this.transporter = createTransport(transportOptions);

    this.displayName = DEFAULT_DISPLAY_NAMME;
    this.display = DEFAULT_DISPLAY;

    this.template = fs.readFileSync(path.join(process.env.NODE_PATH, "templates", templateName)).toString();
  }

  // TODO: better send info
  public async send(targetEmail: string, options: T): Promise</* IEmailSendInfo */ void> {
    try {
      const render = ejs.render(this.template, options);

      return (await this.transporter.sendMail({
        from: `"${this.displayName}" <${this.display}>`,
        to: targetEmail,
        subject: this.subject,
        html: render,
      }));
    } catch (error) {
      throw new Error(`failed to send email ( targetEmail: ${targetEmail}, options: ${options} ): ${error}`);
    }
  }
}

export {
  IBaseEmailOptions,
  Email,
};
