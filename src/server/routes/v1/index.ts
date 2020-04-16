import { ServerResponse } from "http";

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { parseBool } from "../../../utils";
import {
  generateSaltedPassword,
  generateRandomToken,
  IEmailTransportOptions,
  VerificationEmail,
  RecoveryEmail,
  saltPassword,
  jwtSign,
  IIdentityJwtContent,
} from "../../helpers";
import {
  UserAccountType,
  UserService,
  VerificationService,
  OauthServiceType,
} from "../../../db";

// TODO: split this up a bit, maybe make a wrapper class (with decorator shit ofc)
// and pass deps via dependency injection

// NOTE: the fact that these are typed as possibly null doesnt mean theyre not required,
// it means that we dont know if were gonna get them from the user - should be checked at runtime!!!
interface IRegisterRouteBody {
  accountType?: UserAccountType;

  email?: string;
  password?: string;

  oauthService?: OauthServiceType;
  accessToken?: string;
}

interface IVerifyRouteBody {
  email?: string;
  verificationCode?: string;
}

interface IVerifyResendRouteBody {
  email?: string;
}

interface ILoginRouteBody {
  accountType?: UserAccountType;

  email?: string;
  password?: string;

  oauthService?: OauthServiceType;
  accessToken?: string;
}

interface IRecoverRouteBody {
  email?: string;
}

interface IRecoverVerifyRouteBody {
  email?: string;
  recoveryCode?: string;
  newPassword?: string;
}

// yes i realise this can be done in a better way
const {
  TRANS_HOST,
  TRANS_PORT,
  TRANS_SECURE,
  TRANS_EMAIL,
  TRANS_EMAIL_PASS,

  JWT_PRIVATE_KEY,
} = process.env;

const userService = new UserService();
const verificationService = new VerificationService();

// TODO: the boolean cast wont be needed when i write that runtime type checker
const transportOptions: IEmailTransportOptions = {
  host: TRANS_HOST.trim(),
  port: parseInt(TRANS_PORT.trim(), 10),
  secure: parseBool(TRANS_SECURE.trim()) as boolean,
  auth: {
    user: TRANS_EMAIL.trim(),
    pass: TRANS_EMAIL_PASS.trim(),
  },
};

// TODO: verification code timeout
// TODO: salt pass
// TODO: make email field unique
// TODO: log the user in at verification
// TODO: make opaque token unique

// TODO: runtime type validation, could be used for env vars as well!!!
// TODO: obfuscate error messages in production
// TODO: bandsy identity error codes to go along with messages
// TODO: ratelimiting and blacklists!!!
export default async (fastify: FastifyInstance): Promise<void> => {
  // // admin routes
  // fastify.get("/", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // fastify.post("/", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // fastify.patch("/", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // fastify.delete("/", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // // main user routes
  // fastify.get("/@me", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // fastify.patch("/@me", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // fastify.delete("/@me", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // // main user routes - activity
  // fastify.get("/@me/activity", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // // main user routes - 2fa
  // fastify.post("/@me/2fa", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // fastify.delete("/@me/2fa", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // fastify.get("/@me/2fa/codes", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // // main user routes - links
  // fastify.get("/@me/links", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // fastify.post("/@me/links", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // fastify.delete("/@me/links", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // // main user routes - payments
  // fastify.get("/@me/payments", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // fastify.post("/@me/payments", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // fastify.patch("/@me/payments", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // fastify.delete("/@me/payments", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {

  // });

  // main visitor routes
  fastify.post("/register", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    // bandsy and oauth acc type route

    const { accountType }: IRegisterRouteBody = request.body;

    if (accountType === UserAccountType.BANDSY) {
      const { email, password }: IRegisterRouteBody = request.body;

      if (email == null || password == null) {
        reply.code(400);

        return {
          error: "email or password not specified",
        };
      }

      try {
        const { salt, passwordHash } = await generateSaltedPassword(password);

        // TODO: maybe do something so createdAt and updatedAt get set automatically
        // TODO: also maybe make it so those fields cant be tampered with?
        const { uuid } = await userService.create({
          accountType,

          email,
          verified: false,

          salt,
          passwordHash,

          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const verificationCode = await generateRandomToken(24);

        await verificationService.create({
          userUuid: uuid,
          userEmail: email,

          code: verificationCode,
          // TODO: set this to a constant and make it longer than 5 mins lmao
          validUntil: new Date(new Date().getTime() + (1000 * 60 * 5)),

          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // TODO: put an actual username there?
        const verificationEmail = new VerificationEmail(transportOptions);
        await verificationEmail.send(email, {
          username: "cunty mcjim",
          verificationCode,
        });
      } catch (error) {
        reply.code(500);

        return {
          error: `error processing your request: ${process.env.NODE_ENV === "dev" ? error : "()"}`,
        };
      }

      reply.code(204);

      return null;
    }

    if (accountType === UserAccountType.OAUTH) {
      reply.code(501);

      return {
        error: "not implemented yet",
      };
    }

    reply.code(400);

    return {
      error: "invalid account type",
    };
  });

  // NOTE: we dont have to check account type here as the POST /register route does that
  // already and will not create a verification code for non 'bandsy' account types
  fastify.post("/verify", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    // bandsy acc type only route

    const { email, verificationCode }: IVerifyRouteBody = request.body;

    if (email == null || verificationCode == null) {
      reply.code(400);

      return {
        error: "email or verification code not specified",
      };
    }

    try {
      // NOTE: there cannot be more than one; the code field is marked as unique in mongo
      const verification = (await verificationService.find({
        userEmail: email,
        code: verificationCode,
      }))[0];

      if (verification == null) {
        reply.code(400);

        return {
          error: "verification code for this email not found",
        };
      }

      if (verification.validUntil < new Date()) {
        reply.code(400);

        return {
          error: "verification code expired",
        };
      }

      await userService.update(verification.userUuid, {
        verified: true,

        updatedAt: new Date(),
      });
    } catch (error) {
      reply.code(500);

      return {
        error: `error processing your request: ${process.env.NODE_ENV === "dev" ? error : "()"}`,
      };
    }

    reply.code(204);

    return null;
  });

  // TODO (IMPORTANT): remove other verification codes when you request a new one
  fastify.post("/verify/resend", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    const { email }: IVerifyResendRouteBody = request.body;

    if (email == null) {
      reply.code(400);

      return {
        error: "email not specified",
      };
    }

    try {
      const user = await userService.findByEmail(email);

      if (user == null) {
        reply.code(400);

        return {
          error: "account with this email not found",
        };
      }

      if (user.accountType !== UserAccountType.BANDSY) {
        reply.code(400);

        return {
          error: "account verification not supported for non 'bandsy' type accounts (3rd party)",
        };
      }

      if (user.verified) {
        reply.code(400);

        return {
          error: "account already verified",
        };
      }

      // NOTE: we just create a new verification code rather than resending the old one
      // this requires less effort and is less complex - less change of bugs!

      // TODO: this is duped code (same as register), maybe refactor it at some point soon:tm:
      const verificationCode = await generateRandomToken(24);

      await verificationService.create({
        userUuid: user.uuid,
        userEmail: email,

        code: verificationCode,
        // TODO: set this to a constant and make it longer than 5 mins lmao
        validUntil: new Date(new Date().getTime() + (1000 * 60 * 5)),

        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // TODO: put an actual username there?
      const verificationEmail = new VerificationEmail(transportOptions);
      await verificationEmail.send(email, {
        username: "cunty mcjim",
        verificationCode,
      });
    } catch (error) {
      reply.code(500);

      return {
        error: `error processing your request: ${process.env.NODE_ENV === "dev" ? error : "()"}`,
      };
    }

    reply.code(204);

    return null;
  });

  // TODO: take 2fa into account, no 2fa for non 'bandsy' type accounts (already handled by 3rd party)
  fastify.post("/login", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    const { accountType }: ILoginRouteBody = request.body;

    if (accountType === UserAccountType.BANDSY) {
      const { email, password }: IRegisterRouteBody = request.body;

      if (email == null || password == null) {
        reply.code(400);

        return {
          error: "email or password not specified",
        };
      }

      try {
        const user = await userService.findByEmail(email);

        if (user == null) {
          reply.code(400);

          return {
            error: "user with this email not found",
          };
        }

        // salt should be a string if account type is bandsy
        // the worst that can happen otherwise is the passwords not matching
        const { passwordHash } = await saltPassword(password, user.salt as string);

        // dont want to make account checking easier
        // idk if this would actually help but ye, ill put it in just in case lol
        if (passwordHash !== user.passwordHash) {
          reply.code(400);

          return {
            error: `incorrect email or password ${process.env.NODE_ENV === "dev" ? "(password)" : ""}`,
          };
        }

        const signedJwt = await jwtSign<IIdentityJwtContent>({
          uuid: user.uuid,
          email: user.email,
        }, JWT_PRIVATE_KEY, {
          // TODO: set this to a constant and make it longer than 15 mins lmao
          expiresIn: 1000 * 60 * 15,
        });

        reply.code(200);

        return {
          token: signedJwt,
        };
      } catch (error) {
        reply.code(500);

        return {
          error: `error processing your request: ${process.env.NODE_ENV === "dev" ? error : "()"}`,
        };
      }
    }

    if (accountType === UserAccountType.OAUTH) {
      reply.code(501);

      return {
        error: "not implemented yet",
      };
    }

    reply.code(400);

    return {
      error: "invalid account type",
    };
  });

  // TODO (IMPORTANT): remove other recovery codes when you request a new one
  fastify.post("/recover", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    const { email }: IRecoverRouteBody = request.body;

    if (email == null) {
      reply.code(400);

      return {
        error: "email not specified",
      };
    }

    try {
      const user = await userService.findByEmail(email);

      if (user == null) {
        reply.code(400);

        return {
          error: "account with this email not found",
        };
      }

      if (user.accountType !== UserAccountType.BANDSY) {
        reply.code(400);

        return {
          error: "account recovery not supported for non 'bandsy' type accounts (3rd party)",
        };
      }

      // NOTE: we can just reuse the verification code system here

      // TODO: this is duped code (same as register), maybe refactor it at some point soon:tm:
      const recoveryCode = await generateRandomToken(24);

      await verificationService.create({
        userUuid: user.uuid,
        userEmail: email,

        code: recoveryCode,
        // TODO: set this to a constant and make it longer than 5 mins lmao
        validUntil: new Date(new Date().getTime() + (1000 * 60 * 5)),

        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // TODO: put an actual username there?
      const recoveryEmail = new RecoveryEmail(transportOptions);
      await recoveryEmail.send(email, {
        username: "cunty mcjim",
        recoveryCode,
      });
    } catch (error) {
      reply.code(500);

      return {
        error: `error processing your request: ${process.env.NODE_ENV === "dev" ? error : "()"}`,
      };
    }

    reply.code(204);

    return null;
  });

  // NOTE: we dont have to check account type here as the POST /register route does that
  // already and will not create a recovery code for non 'bandsy' account types
  fastify.post("/recover/verify", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    // NOTE: a lot of the code here will be duplicated from PORT /verify,
    // try to refactor it asap!

    const { email, recoveryCode, newPassword }: IRecoverVerifyRouteBody = request.body;

    if (email == null || recoveryCode == null || newPassword == null) {
      reply.code(400);

      return {
        error: "email, recovery code, or new password not specified",
      };
    }

    try {
      // NOTE: there cannot be more than one; the code field is marked as unique in mongo
      // TODO: expand on VerificationService to handle this shit (cos its duplicated in quite a few places!)
      const verification = (await verificationService.find({
        userEmail: email,
        code: recoveryCode,
      }))[0];

      if (verification == null) {
        reply.code(400);

        return {
          error: "recovery code for this email not found",
        };
      }

      if (verification.validUntil < new Date()) {
        reply.code(400);

        return {
          error: "recovery code expired",
        };
      }

      const { salt, passwordHash } = await generateSaltedPassword(newPassword);

      await userService.update(verification.userUuid, {
        salt,
        passwordHash,

        updatedAt: new Date(),
      });
    } catch (error) {
      reply.code(500);

      return {
        error: `error processing your request: ${process.env.NODE_ENV === "dev" ? error : "()"}`,
      };
    }

    reply.code(204);

    return null;
  });
};
