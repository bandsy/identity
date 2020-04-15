import path from "path";
import fs from "fs";

import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import ejs from "ejs";

import { IEmailTransportOptions } from "./transporter";

const DEFAULT_DISPLAY_NAMME = "Bandsy Identity";

interface IBaseEmailOptions {
  username: string;
}

abstract class Email<T extends IBaseEmailOptions> {
  protected transporter: Mail;

  protected displayName: string;

  protected template: string;

  protected subject!: string;

  constructor(transportOptions: IEmailTransportOptions, templateName: string) {
    this.transporter = createTransport(transportOptions);

    this.displayName = DEFAULT_DISPLAY_NAMME;
    this.template = fs.readFileSync(path.join(__dirname, "templates", templateName)).toString();
  }

  // TODO: better send info
  public async send(targetEmail: string, options: T): Promise</* IEmailSendInfo */ void> {
    try {
      const render = ejs.render(this.template, options);

      return (await this.transporter.sendMail({
        from: `"${this.displayName}" <${this.displayName}>`,
        to: targetEmail,
        subject: this.subject,
        text: render,
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
