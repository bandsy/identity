import { randomBytes } from "crypto";

import type { FastifyInstance, FastifyRequest } from "fastify";
import { createTransport } from "nodemailer";

import { parseBool } from "../../../utils";
import { UserService, UserAccountType } from "../../../db";

const {
  TRANS_HOST,
  TRANS_PORT,
  TRANS_SECURE,
  TRANS_EMAIL,
  TRANS_EMAIL_PASS,

  EMAIL_DISPLAY,
  EMAIL_DISPLAY_NAME,
} = process.env;

const transporter = createTransport({
  host: TRANS_HOST.trim(),
  port: Number.parseInt(TRANS_PORT.trim(), 10),
  secure: parseBool(TRANS_SECURE.trim()),
  auth: {
    user: TRANS_EMAIL.trim(),
    pass: TRANS_EMAIL_PASS.trim(),
  },
});

// const emailVerificationCodes = [];

interface RegistrationBody {
  email: string;
  password: string;
}

// enum VerificationType {
//   EMAIL = "email",
//   OAUTH = "oauth",
// }

enum OauthServiceType {
  DISCORD = "discord",
}

interface VerificationBody {
  email: string;
  verificationCode: string;
}

interface OauthVerificationBody {
  oauthServiceType: OauthServiceType;
  verificationCode: string;
}

const generateToken = (): Promise<string> => new Promise((resolve, reject) => {
  randomBytes(48, (error, buffer) => {
    if (error != null) {
      return reject(error);
    }

    return resolve(buffer.toString("hex"));
  });
});

// TODO: verification code timeout
// TODO: salt pass
// TODO: make email field unique
export default async (fastify: FastifyInstance): Promise<void> => {
  // acount creation (email + pass):
  // - send email + pass to server
  // - receive email confirmation link
  // - click confirmation link (to bandsy website)
  // - bandsy website makes api request with confirmation token
  // - on ok, finishes account creation and logs in user
  fastify.post("/register", async (request: FastifyRequest) => {
    const { email, password }: RegistrationBody = request.body;

    // generate verification code
    // save code to database with expiry date (bound to email + pass combo)
    // send email to user
    // return ok code (or failure)
    const verificationCode = await generateToken();

    const user = await UserService.createUser({
      accountType: UserAccountType.BANDSY,
      email,
      password,
      verificationCode,
      verified: false,
    });

    const emailInfo = await transporter.sendMail({
      from: `"${EMAIL_DISPLAY_NAME.trim()}" <${EMAIL_DISPLAY.trim()}>`,
      to: email,
      subject: "Bandsy account verification",
      text: `verificationCode: ${verificationCode}`,
    }).catch(error => error);

    return {
      user,
      emailInfo,
    };
  });

  fastify.post("/verify", async (request: FastifyRequest) => {
    const { email, verificationCode }: VerificationBody = request.body;

    // check if code exists
    // check if code not expired
    // add user to database
    // send ok code (or failure)
    // send opaque token
    const user = await UserService.findUserByEmail(email);
    if (user.verificationCode !== verificationCode) {
      throw new Error("verification codes dont match!");
    }

    const updateInfo = await UserService.updateUser(user.uuid, {
      verificationCode: undefined,
      verified: true,
    });

    return {
      verificationCode,
      updateInfo,
    };
  });

  fastify.post("/verify/oauth", async (request: FastifyRequest) => {
    const { oauthServiceType, verificationCode }: OauthVerificationBody = request.body;

    // verify if correct oauth service provided
    // query service with code
    // add user to database
    // send ok code (or failure)
    // send opaque token

    return {
      oauthServiceType,
      verificationCode,
    };
  });
};
