import { ServerResponse } from "http";

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import {
  generateSaltedPassword,
  createBandsyError,
} from "../../../../../helpers";
import {
  UserService,
  UserAccountType,
  IVerificationType,
  DatabaseError,
} from "../../../../../../db";
import { HttpResponseCodes, BandsyResponseCodes } from "../../../types";
import { verifyEmail } from "../../../../../helpers/email";

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

const userService = new UserService();

// TODO: validate password (minimum standards) and email (a@b.c)
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
      await verifyEmail(uuid, email, IVerificationType.VERIFICATION);

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
      await verifyEmail(uuid, email, IVerificationType.VERIFICATION);

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
