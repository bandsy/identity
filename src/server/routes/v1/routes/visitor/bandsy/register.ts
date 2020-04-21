import { ServerResponse } from "http";

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { parseBool } from "../../../../../../utils";
import {
  generateSaltedPassword,
  generateRandomToken,
  VerificationEmail,
  IEmailTransportOptions,
  createBandsyError,
} from "../../../../../helpers";
import {
  UserService,
  UserAccountType,
  VerificationService,
  IVerificationType,
  DatabaseError,
} from "../../../../../../db";
import { HttpResponseCodes, BandsyResponseCodes } from "../../../types";

// TODO: use enums for http response codes

// TODO: yes i realise this can be done in a better way (runtime type checker!)
const {
  TRANS_HOST,
  TRANS_PORT,
  TRANS_SECURE,
  TRANS_EMAIL,
  TRANS_EMAIL_PASS,

  ACCOUNT_VERIFICATION_TIME,
} = process.env;

const baseSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
      },
      password: {
        type: "string",
      },
    },
  },
};

const resendSchema = {
  body: {
    type: "object",
    required: ["email"],
    properties: {
      email: {
        type: "string",
      },
    },
  },
};

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

const userService = new UserService();
const verificationService = new VerificationService();

const verifyEmail = async (userUuid: string, userEmail: string): Promise<void> => {
  const verificationCode = await generateRandomToken(24);

  await verificationService.create({
    userUuid,
    userEmail,

    code: verificationCode,
    type: IVerificationType.VERIFICATION,
    validUntil: new Date(new Date().getTime() + parseInt(ACCOUNT_VERIFICATION_TIME.trim(), 10)),

    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const verificationEmail = new VerificationEmail(transportOptions);
  await verificationEmail.send(userEmail, {
    username: "cunty mcjim",
    verificationCode,
  });
};

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.post("/", { schema: baseSchema }, async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    const { email, password } = request.body;

    try {
      const { salt, passwordHash } = await generateSaltedPassword(password);

      // create new user
      const { uuid } = await userService.create({
        accountType: UserAccountType.BANDSY,

        email,
        verified: false,

        salt,
        passwordHash,

        mfaEnabled: false,

        createdAt: new Date(),
        updatedAt: new Date(),
      }).catch(error => {
        switch (error.dbCode) {
          case DatabaseError.DUPLICATE_KEY: {
            throw createBandsyError(
              HttpResponseCodes.CLIENT_ERROR,
              BandsyResponseCodes.DUPLICATE_EMAIL,
              error.message,
            );
          }
          default: {
            throw error;
          }
        }
      });

      // generate verification code and send email
      await verifyEmail(uuid, email);

      reply.code(HttpResponseCodes.OK_NO_CONTENT);

      return null;
    } catch (error) {
      throw createBandsyError(
        error.statusCode ?? HttpResponseCodes.SERVER_ERROR,
        error.bandsyCode ?? BandsyResponseCodes.SERVER_ERROR,
        error.message ?? error.toString() ?? error,
      );
    }
  });

  fastify.post("/resend", { schema: resendSchema }, async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    const { email } = request.body;

    try {
      // only for bansy type (email + pass) accounts
      const { uuid } = (await userService.find({
        email,
        verified: false,
        accountType: UserAccountType.BANDSY,
      }))[0];

      if (uuid == null) {
        throw createBandsyError(
          HttpResponseCodes.CLIENT_ERROR,
          BandsyResponseCodes.INVALID_ACCOUNT,
          "an unverified bandsy (email + pass) account with this email does not exist",
        );
      }

      // generate verification code and send email
      await verifyEmail(uuid, email);

      reply.code(HttpResponseCodes.OK_NO_CONTENT);

      return null;
    } catch (error) {
      throw createBandsyError(
        error.statusCode ?? HttpResponseCodes.SERVER_ERROR,
        error.bandsyCode ?? BandsyResponseCodes.SERVER_ERROR,
        error.message ?? error.toString() ?? error,
      );
    }
  });
};
