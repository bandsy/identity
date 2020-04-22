import { ServerResponse } from "http";

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { HttpResponseCodes, BandsyResponseCodes } from "../../../types";
import { createBandsyError, generateSaltedPassword } from "../../../../../helpers";
import { verifyEmail } from "../../../../../helpers/email";
import {
  UserService,
  UserAccountType,
  IVerificationType,
  VerificationService,
} from "../../../../../../db";

const baseSchema = {
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

const verifySchema = {
  body: {
    type: "object",
    required: ["email", "recoveryCode", "newPassword"],
    properties: {
      email: {
        type: "string",
      },
      recoveryCode: {
        type: "string",
      },
      newPassword: {
        type: "string",
      },
    },
  },
};

const userService = new UserService();
const verificationService = new VerificationService();

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.post("/", { schema: baseSchema }, async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    const { email } = request.body;

    try {
      const { uuid } = (await userService.find({
        email,
        verified: true,
        accountType: UserAccountType.BANDSY,
      }))[0];

      if (uuid == null) {
        throw createBandsyError(
          HttpResponseCodes.CLIENT_ERROR,
          BandsyResponseCodes.INVALID_ACCOUNT,
          "valid verified user with this email not found",
        );
      }

      await verifyEmail(uuid, email, IVerificationType.RECOVERY);

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

  fastify.post("/verify", { schema: verifySchema }, async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    const { email, recoveryCode, newPassword } = request.body;

    try {
      const { userUuid, validUntil } = (await verificationService.find({
        userEmail: email,
        code: recoveryCode,
        type: IVerificationType.RECOVERY,
      }))[0];

      if (userUuid == null || validUntil < new Date()) {
        throw createBandsyError(
          HttpResponseCodes.CLIENT_ERROR,
          BandsyResponseCodes.INVALID_VERIFICATION,
          "recovery code not found or expired",
        );
      }

      const { salt, passwordHash } = await generateSaltedPassword(newPassword);

      await userService.update(userUuid, {
        salt,
        passwordHash,

        updatedAt: new Date(),
      });

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
