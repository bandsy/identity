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
  exchangeToken,
  fetchUserData,
  jwtVerify,
} from "../../helpers";
import {
  UserAccountType,
  UserService,
  VerificationService,
  OauthServiceType,
  IVerificationType,
} from "../../../db";
import { generateSecret, verifyTOTP } from "../../helpers/2fa";

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

  mfaCode?: string;
}

interface IRecoverRouteBody {
  email?: string;
}

interface IRecoverVerifyRouteBody {
  email?: string;
  recoveryCode?: string;
  newPassword?: string;
}

// NOTE: the code that we want here, we need as a number but all stuff may
// be strings so this is safer
interface IMfaRouteCreateBody {
  secret: string;
  mfaCode: string;
}

interface IMfaRouteBody {
  mfaCode: string;
}

// yes i realise this can be done in a better way
const {
  TRANS_HOST,
  TRANS_PORT,
  TRANS_SECURE,
  TRANS_EMAIL,
  TRANS_EMAIL_PASS,

  JWT_PRIVATE_KEY,
  JWT_PUBLIC_KEY,
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
  // temp for testing
  fastify.get("/oauth-test/redirect", async (request: FastifyRequest) => {
    console.log(request.query);

    return {
      query: request.query,
    };
  });

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

  // main user routes - 2fa

  // check: token, account activated
  // TODO: maybe make a hook that checks for the token
  // TODO: auto handle thing for all catches would be nice (theyre all lit the same!)
  fastify.get("/2fa/secret", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    // need: 2fa disabled, bandsy acc type
    const { token } = request.cookies;

    if (token == null) {
      reply.code(400);

      return {
        error: "token not found but required",
      };
    }

    try {
      const jwt = await jwtVerify<IIdentityJwtContent>(token, JWT_PUBLIC_KEY);

      const user = await userService.findById(jwt.uuid);

      if (user == null) {
        reply.code(400);

        return {
          error: "user not found",
        };
      }

      if (user.mfaEnabled) {
        reply.code(400);

        return {
          error: "2fa already enabled on this account (you dont need these codes)",
        };
      }

      if (jwt.accountType !== UserAccountType.BANDSY) {
        reply.code(400);

        return {
          error: "2fa not supported for non 'bandsy' type accounts (3rd party)",
        };
      }

      const secret = generateSecret();

      reply.code(200);

      return {
        secret,
      };
    } catch (error) {
      reply.code(500);

      return {
        error: `error processing your request: ${process.env.NODE_ENV === "dev" ? error : "()"}`,
      };
    }
  });

  fastify.post("/@me/2fa", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    // need: 2fa disabled, bandsy acc type, 2fa secret, 2fa code
    const { token } = request.cookies;

    if (token == null) {
      reply.code(400);

      return {
        error: "token not found but required",
      };
    }

    try {
      const jwt = await jwtVerify<IIdentityJwtContent>(token, JWT_PUBLIC_KEY);

      if (jwt.accountType !== UserAccountType.BANDSY) {
        reply.code(400);

        return {
          error: "2fa not supported for non 'bandsy' type accounts (3rd party)",
        };
      }

      const user = await userService.findById(jwt.uuid);

      if (user == null) {
        reply.code(400);

        return {
          error: "incorrect user id in token",
        };
      }

      if (user.mfaEnabled) {
        reply.code(400);

        return {
          error: "2fa already enabled for this user",
        };
      }

      const { secret, mfaCode }: IMfaRouteCreateBody = request.body;

      if (secret == null || mfaCode == null || Number.isNaN(parseInt(mfaCode, 10))) {
        reply.code(400);

        return {
          error: "secret or code not specified or incorrectly formatted",
        };
      }

      if (!verifyTOTP(parseInt(mfaCode, 10), secret)) {
        reply.code(400);

        return {
          error: "incorrect secret and code combo",
        };
      }

      // TODO: make the number of recovery codes constant, maybe enforced in schema?
      const mfaRecoveryCodes = (await Promise.all(new Array(12).map(() => generateRandomToken(6)))).map(e => ({
        code: e,
        valid: true,
      }));

      await userService.update(jwt.uuid, {
        mfaEnabled: true,
        mfaSecret: secret,
        mfaRecoveryCodes,

        updatedAt: new Date(),
      });

      reply.code(200);

      return {
        recoveryCodes: mfaRecoveryCodes,
      };
    } catch (error) {
      reply.code(500);

      return {
        error: `error processing your request: ${process.env.NODE_ENV === "dev" ? error : "()"}`,
      };
    }
  });

  fastify.delete("/@me/2fa", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    // need: 2fa enabled, bandsy acc type, 2fa code
    const { token } = request.cookies;

    if (token == null) {
      reply.code(400);

      return {
        error: "token not found but required",
      };
    }

    try {
      const jwt = await jwtVerify<IIdentityJwtContent>(token, JWT_PUBLIC_KEY);

      if (jwt.accountType !== UserAccountType.BANDSY) {
        reply.code(400);

        return {
          error: "2fa not supported for non 'bandsy' type accounts (3rd party)",
        };
      }

      const user = await userService.findById(jwt.uuid);

      if (user == null || user.mfaSecret == null) {
        reply.code(400);

        return {
          error: "incorrect user id in token (or mfaSecret null for some bizzare reason)",
        };
      }

      if (!user.mfaEnabled) {
        reply.code(400);

        return {
          error: "2fa not enabled for this user (cant remove it lol)",
        };
      }

      const { mfaCode }: IMfaRouteBody = request.body;

      if (!verifyTOTP(parseInt(mfaCode, 10), user.mfaSecret)) {
        reply.code(400);

        return {
          error: "incorrect secret and code combo",
        };
      }

      await userService.update(jwt.uuid, {
        mfaEnabled: false,
        mfaSecret: undefined,
        mfaRecoveryCodes: [],

        updatedAt: new Date(),
      });

      reply.code(204);

      return null;
    } catch (error) {
      reply.code(500);

      return {
        error: `error processing your request: ${process.env.NODE_ENV === "dev" ? error : "()"}`,
      };
    }
  });

  fastify.post("/@me/2fa/codes", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    // need: 2fa enabled, bandsy acc type, 2fa code
    const { token } = request.cookies;

    if (token == null) {
      reply.code(400);

      return {
        error: "token not found but required",
      };
    }

    try {
      const jwt = await jwtVerify<IIdentityJwtContent>(token, JWT_PUBLIC_KEY);

      if (jwt.accountType !== UserAccountType.BANDSY) {
        reply.code(400);

        return {
          error: "2fa not supported for non 'bandsy' type accounts (3rd party)",
        };
      }

      const user = await userService.findById(jwt.uuid);

      if (user == null || user.mfaSecret == null) {
        reply.code(400);

        return {
          error: "incorrect user id in token (or mfaSecret null for some bizzare reason)",
        };
      }

      if (!user.mfaEnabled) {
        reply.code(400);

        return {
          error: "2fa not enabled for this user (youve got no recovery codes lel)",
        };
      }

      const { mfaCode }: IMfaRouteBody = request.body;

      if (!verifyTOTP(parseInt(mfaCode, 10), user.mfaSecret)) {
        reply.code(400);

        return {
          error: "incorrect secret and code combo",
        };
      }

      reply.code(200);

      return {
        recoveryCodes: user.mfaRecoveryCodes,
      };
    } catch (error) {
      reply.code(500);

      return {
        error: `error processing your request: ${process.env.NODE_ENV === "dev" ? error : "()"}`,
      };
    }
  });

  fastify.post("/@me/2fa/codes/refresh", async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    // need: 2fa enabled, bandsy acc type, 2fa code
    const { token } = request.cookies;

    if (token == null) {
      reply.code(400);

      return {
        error: "token not found but required",
      };
    }

    try {
      const jwt = await jwtVerify<IIdentityJwtContent>(token, JWT_PUBLIC_KEY);

      if (jwt.accountType !== UserAccountType.BANDSY) {
        reply.code(400);

        return {
          error: "2fa not supported for non 'bandsy' type accounts (3rd party)",
        };
      }

      const user = await userService.findById(jwt.uuid);

      if (user == null || user.mfaSecret == null) {
        reply.code(400);

        return {
          error: "incorrect user id in token (or mfaSecret null for some bizzare reason)",
        };
      }

      if (!user.mfaEnabled) {
        reply.code(400);

        return {
          error: "2fa not enabled for this user (youve got no recovery codes lel)",
        };
      }

      const { mfaCode }: IMfaRouteBody = request.body;

      if (!verifyTOTP(parseInt(mfaCode, 10), user.mfaSecret)) {
        reply.code(400);

        return {
          error: "incorrect secret and code combo",
        };
      }

      // TODO: make the number of recovery codes constant, maybe enforced in schema?
      const mfaRecoveryCodes = (await Promise.all(new Array(12).map(() => generateRandomToken(6)))).map(e => ({
        code: e,
        valid: true,
      }));

      await userService.update(jwt.uuid, {
        mfaRecoveryCodes,

        updatedAt: new Date(),
      });

      reply.code(200);

      return {
        recoveryCodes: mfaRecoveryCodes,
      };
    } catch (error) {
      reply.code(500);

      return {
        error: `error processing your request: ${process.env.NODE_ENV === "dev" ? error : "()"}`,
      };
    }
  });

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

  // TODO: better error message for dupe email during account creation
  // TODO: remove verification/recovery codes after verification/recovery process
  // TODO: error codes

  // TODO: oauth verify route
  // TODO: mfa recovery code gen fix
  // TODO: mfa recovery code checking on login

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

          mfaEnabled: false,

          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // yeet old verification codes first (scenario: someone makes an acc, deletes in, makes a new one in an instant,
        // now they have 2 verification codes!)
        await verificationService.deleteMany({
          userEmail: email,

          type: IVerificationType.VERIFICATION,
        });

        const verificationCode = await generateRandomToken(24);

        await verificationService.create({
          userUuid: uuid,
          userEmail: email,

          code: verificationCode,
          type: IVerificationType.VERIFICATION,
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
      const { oauthService, accessToken }: IRegisterRouteBody = request.body;

      if (oauthService == null || accessToken == null) {
        reply.code(400);

        return {
          error: "oauth service type or access token not specified",
        };
      }

      // check this as exchangeToken expects an enum value, which cant be checked at compile
      // time cos user input and such, passing an incorrect value wont break anything, it just
      // wont throw a pretty looking error like the one below ^^
      if (!Object.values(OauthServiceType).includes(oauthService)) {
        reply.code(400);

        return {
          error: "invalid oauth service type specified",
        };
      }

      try {
        const tokenResponse = await exchangeToken(oauthService, {
          code: accessToken,
        });

        const userResponse = await fetchUserData(oauthService, tokenResponse.accessToken);

        const { uuid } = await userService.create({
          accountType,

          email: userResponse.email,
          verified: true,

          oauthService,
          accessToken: tokenResponse.accessToken,
          accessTokenType: tokenResponse.tokenType,
          // expires in thats returned from oauth is in seconds (at least it should be)
          accessTokenExpiresAt: new Date(new Date().getTime() + (tokenResponse.expiresIn * 1000)),
          refreshToken: tokenResponse.refreshToken,
          oauthScope: tokenResponse.scope,

          mfaEnabled: false,

          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // oauth registrations complete at this point so log them in
        const signedJwt = await jwtSign<IIdentityJwtContent>({
          uuid,
          email: userResponse.email,

          accountType,
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
        type: IVerificationType.VERIFICATION,
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

      const user = await userService.findById(verification.userUuid);

      if (user == null) {
        reply.code(400);

        return {
          error: "failed to find user",
        };
      }

      if (user.verified) {
        reply.code(400);

        return {
          error: "account already verified",
        };
      }

      await userService.update(verification.userUuid, {
        verified: true,

        updatedAt: new Date(),
      });

      // now log them in while were at it
      // we can grab the uuid from verification so we dont have do make an extra db call
      const signedJwt = await jwtSign<IIdentityJwtContent>({
        uuid: verification.userUuid,
        email,

        accountType: UserAccountType.BANDSY,
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
  });

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

      // remove any old verification codes... just in case
      await verificationService.deleteMany({
        userEmail: email,

        type: IVerificationType.VERIFICATION,
      });

      // NOTE: we just create a new verification code rather than resending the old one
      // this requires less effort and is less complex - less change of bugs!

      // TODO: this is duped code (same as register), maybe refactor it at some point soon:tm:
      const verificationCode = await generateRandomToken(24);

      await verificationService.create({
        userUuid: user.uuid,
        userEmail: email,

        code: verificationCode,
        type: IVerificationType.VERIFICATION,
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
      const { email, password, mfaCode }: ILoginRouteBody = request.body;

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

        if (!user.verified) {
          reply.code(400);

          return {
            error: "cannot log into a non-verified account",
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

        if (user.mfaEnabled && user.mfaSecret == null) {
          reply.code(400);

          return {
            error: "mfaSecret not set for some reason...",
          };
        }

        // this cast is retarded (the need for it that is)... just read the last few lines
        if (user.mfaEnabled && (mfaCode == null || !verifyTOTP(parseInt(mfaCode, 10), user.mfaSecret as string))) {
          reply.code(400);

          return {
            error: "2fa validation failed",
          };
        }

        const signedJwt = await jwtSign<IIdentityJwtContent>({
          uuid: user.uuid,
          email: user.email,

          accountType,
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
      const { oauthService, accessToken }: ILoginRouteBody = request.body;

      if (oauthService == null || accessToken == null) {
        reply.code(400);

        return {
          error: "oauth service type or access token not specified",
        };
      }

      // check this as exchangeToken expects an enum value, which cant be checked at compile
      // time cos user input and such, passing an incorrect value wont break anything, it just
      // wont throw a pretty looking error like the one below ^^
      if (!Object.values(OauthServiceType).includes(oauthService)) {
        reply.code(400);

        return {
          error: "invalid oauth service type specified",
        };
      }

      try {
        const tokenResponse = await exchangeToken(oauthService, {
          code: accessToken,
        });

        const userResponse = await fetchUserData(oauthService, tokenResponse.accessToken);

        const user = await userService.findByEmail(userResponse.email);

        if (user == null) {
          reply.code(400);

          return {
            error: "user not found",
          };
        }

        // update token shit
        await userService.update(user.uuid, {
          accessToken: tokenResponse.accessToken,
          accessTokenType: tokenResponse.tokenType,
          // expires in thats returned from oauth is in seconds (at least it should be)
          accessTokenExpiresAt: new Date(new Date().getTime() + (tokenResponse.expiresIn * 1000)),
          refreshToken: tokenResponse.refreshToken,
          oauthScope: tokenResponse.scope,

          updatedAt: new Date(),
        });

        // oauth registrations complete at this point so log them in
        const signedJwt = await jwtSign<IIdentityJwtContent>({
          uuid: user.uuid,
          email: userResponse.email,

          accountType,
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

    reply.code(400);

    return {
      error: "invalid account type",
    };
  });

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

      // fixing a non-issue but whatevs
      if (!user.verified) {
        reply.code(400);

        return {
          error: "why tf are you trying to recover an acc which hasnt been verified yet...",
        };
      }

      if (user.accountType !== UserAccountType.BANDSY) {
        reply.code(400);

        return {
          error: "account recovery not supported for non 'bandsy' type accounts (3rd party)",
        };
      }

      // remove any old recovery codes for this email, just in case
      await verificationService.deleteMany({
        userEmail: email,

        type: IVerificationType.RECOVERY,
      });

      // NOTE: we can just reuse the verification code system here

      // TODO: this is duped code (same as register), maybe refactor it at some point soon:tm:
      const recoveryCode = await generateRandomToken(24);

      await verificationService.create({
        userUuid: user.uuid,
        userEmail: email,

        code: recoveryCode,
        type: IVerificationType.RECOVERY,
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
        type: IVerificationType.RECOVERY,
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
