import { randomBytes, createHmac } from "crypto";
import { ServerResponse } from "http";

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
// import { createTransport } from "nodemailer";

// import { parseBool } from "../../../utils";
import { UserService, UserAccountType } from "../../../db";

// const {
//   TRANS_HOST,
//   TRANS_PORT,
//   TRANS_SECURE,
//   TRANS_EMAIL,
//   TRANS_EMAIL_PASS,

//   EMAIL_DISPLAY,
//   EMAIL_DISPLAY_NAME,
// } = process.env;

// const transporter = createTransport({
//   host: TRANS_HOST.trim(),
//   port: Number.parseInt(TRANS_PORT.trim(), 10),
//   secure: parseBool(TRANS_SECURE.trim()),
//   auth: {
//     user: TRANS_EMAIL.trim(),
//     pass: TRANS_EMAIL_PASS.trim(),
//   },
// });

// const emailVerificationCodes = [];

interface RegistrationBody {
  email?: string;
  password?: string;
}

// enum VerificationType {
//   EMAIL = "email",
//   OAUTH = "oauth",
// }

enum OauthServiceType {
  DISCORD = "discord",
}

interface VerificationBody {
  email?: string;
  verificationCode?: string;
}

interface OauthVerificationBody {
  oauthServiceType?: OauthServiceType;
  verificationCode?: string;
}

const generateRandomString = (length: number): Promise<string> => new Promise((resolve, reject) => {
  randomBytes(Math.ceil(length / 2), (error, buffer) => {
    if (error != null) {
      return reject(error);
    }

    return resolve(buffer.toString("hex").slice(0, length));
  });
});

interface ISaltedPassword {
  salt: string;
  passwordHash: string;
}

const saltPassword = (password: string, salt: string): Promise<ISaltedPassword> => new Promise(resolve => {
  const hash = createHmac("sha512", salt);
  hash.update(password);

  const passwordHash = hash.digest("hex");

  resolve({
    salt,
    passwordHash,
  });
});

const generateSaltedPassword = async (password: string): Promise<ISaltedPassword> => saltPassword(password, await generateRandomString(24));

// TODO: verification code timeout
// TODO: salt pass
// TODO: make email field unique
// TODO: log the user in at verification
// TODO: make opaque token unique
export default async (fastify: FastifyInstance): Promise<void> => {
  // fastify.get("/", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
  //   const { opaqueToken } = request.cookies;

  //   if (opaqueToken == null) {
  //     throw new Error("opaqueToken not set");
  //   }

  //   try {
  //     const users = await UserService.findUsers({
  //       opaqueToken,
  //     });

  //     if (users.length === 0) {
  //       // TODO: yes this obviously shouldnt be a 500
  //       throw new Error("no matching opaqueToken found");
  //     }

  //     if (users.length > 1) {
  //       throw new Error("something is SEVERELY fucked with our opaqueToken security");
  //     }

  //     const user = users[0];

  //     reply.code(200);

  //     return {
  //       user,
  //     };
  //   } catch (error) {
  //     reply.code(500);

  //     return {
  //       error: `error: ${error}`,
  //     };
  //   }
  // });

  // acount creation (email + pass):
  // - send email + pass to server
  // - receive email confirmation link
  // - click confirmation link (to bandsy website)
  // - bandsy website makes api request with confirmation token
  // - on ok, finishes account creation and logs in user
  // fastify.post("/register", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
  //   const { email, password }: RegistrationBody = request.body;
  //   if (email == null || password == null) {
  //     throw new Error("email and or password is null");
  //   }

  //   try {
  //     // generate verification code
  //     // save code to database with expiry date (bound to email + pass combo)
  //     // send email to user
  //     // return ok code (or failure)
  //     const { salt, passwordHash } = await generateSaltedPassword(password);
  //     const verificationCode = await generateRandomString(24);

  //     const user = await UserService.createUser({
  //       accountType: UserAccountType.BANDSY,
  //       email,
  //       salt,
  //       passwordHash,
  //       verificationCode,
  //       verificationCodeExpiry: new Date(new Date().getTime() + (1000 * 60 * 5)),
  //       verified: false,
  //     });

  //     // await transporter.sendMail({
  //     //   from: `"${EMAIL_DISPLAY_NAME.trim()}" <${EMAIL_DISPLAY.trim()}>`,
  //     //   to: email,
  //     //   subject: "Bandsy account verification",
  //     //   text: `verificationCode: ${verificationCode}`,
  //     // });

  //     reply.code(200);

  //     return {
  //       user,
  //       uuid: user.uuid,
  //     };
  //   } catch (error) {
  //     reply.code(500);

  //     return {
  //       error: `error: ${error}`,
  //     };
  //   }
  // });

  // fastify.post("/verify", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
  //   const { email, verificationCode }: VerificationBody = request.body;
  //   if (email == null || verificationCode == null) {
  //     throw new Error("email and or verificationCode is null");
  //   }

  //   try {
  //     // check if code exists
  //     // check if code not expired
  //     // add user to database
  //     // send ok code (or failure)
  //     // send opaque token
  //     const user = await UserService.findUserByEmail(email);
  //     if (user.verified) {
  //       // TODO: handle this some other way cos right now random peeps can go check if an email is verified
  //       // TODO: ***IMPORTANT*** same as above, make sure with evertything were not returning any more info than is necessary
  //       throw new Error("already verified");
  //     }

  //     if (user.verificationCodeExpiry == null || new Date() > new Date(user.verificationCodeExpiry)) {
  //       // TODO: send new verification code
  //       throw new Error("verification code expired");
  //     }

  //     if (user.verificationCode !== verificationCode) {
  //       throw new Error("verification codes dont match");
  //     }

  //     const opaqueToken = await generateRandomString(24);
  //     const opaqueTokenExpiry = new Date(new Date().getTime() + (1000 * 60 * 5));

  //     await UserService.updateUser(user.uuid, {
  //       opaqueToken,
  //       opaqueTokenExpiry,
  //       verificationCode: undefined,
  //       verificationCodeExpiry: undefined,
  //       verified: true,
  //     });

  //     reply.code(200);

  //     return {
  //       opaqueToken,
  //       opaqueTokenExpiry,
  //     };
  //   } catch (error) {
  //     reply.code(500);

  //     return {
  //       error: `error: ${error}`,
  //     };
  //   }
  // });

  // fastify.post("/verify/oauth", async (request: FastifyRequest) => {
  //   const { oauthServiceType, verificationCode }: OauthVerificationBody = request.body;

  //   // verify if correct oauth service provided
  //   // query service with code
  //   // add user to database
  //   // send ok code (or failure)
  //   // send opaque token

  //   return {
  //     oauthServiceType,
  //     verificationCode,
  //   };
  // });

  // fastify.post("/login", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
  //   const { email, password }: RegistrationBody = request.body;
  //   if (email == null || password == null) {
  //     throw new Error("email and or password is null");
  //   }

  //   if (request.cookies.opaqueToken != null) {
  //     throw new Error("already logged in (supposedly)");
  //   }

  //   try {
  //     const user = await UserService.findUserByEmail(email);
  //     if (user.salt == null || user.passwordHash == null) {
  //       throw new Error("db user does not have salt or passwordHash");
  //     }

  //     const { passwordHash } = await saltPassword(password, user.salt);
  //     if (user.passwordHash !== passwordHash) {
  //       throw new Error("passwords hashes dont match");
  //     }

  //     const opaqueToken = await generateRandomString(24);
  //     const opaqueTokenExpiry = new Date(new Date().getTime() + (1000 * 60 * 5));

  //     await UserService.updateUser(user.uuid, {
  //       opaqueToken,
  //       opaqueTokenExpiry,
  //     });

  //     reply.code(200);

  //     return {
  //       opaqueToken,
  //       opaqueTokenExpiry,
  //     };
  //   } catch (error) {
  //     reply.code(500);

  //     return {
  //       error: `error: ${error}`,
  //     };
  //   }
  // });

  // fastify.post("/login/oauth", async (request: FastifyRequest) => {
  //   const rawrxd = request;

  //   return {
  //     rawrxd,
  //   };
  // });
};
