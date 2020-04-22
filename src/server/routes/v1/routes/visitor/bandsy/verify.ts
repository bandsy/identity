import { ServerResponse } from "http";

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { createBandsyError, IIdentityJwtContent, jwtSign } from "../../../../../helpers";
import { HttpResponseCodes, BandsyResponseCodes } from "../../../types";
import {
  UserService,
  VerificationService,
  IVerificationType,
  UserAccountType,
} from "../../../../../../db";

const {
  JWT_PRIVATE_KEY,

  TOKEN_VALIDITY_TIME,
} = process.env;

const baseSchema = {
  body: {
    type: "object",
    required: ["email", "verificationCode"],
    properties: {
      email: {
        type: "string",
      },
      verificationCode: {
        type: "string",
      },
    },
  },
};

const userService = new UserService();
const verificationService = new VerificationService();

// TODO: move to helpers
// TODO: add sorting and such functionality to db module

// type sortType = number | string | Date;

// enum SortDir {
//   ASCENDING,
//   DESCENDING
// }

// const stdSort = (a: sortType, b: sortType, sortDir: SortDir): number => {
//   if (a < b) {
//     return sortDir === SortDir.ASCENDING ? -1 : 1;
//   }
//   if (a > b) {
//     return sortDir === SortDir.ASCENDING ? 1 : -1;
//   }
//   return 0;
// };

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.post("/", { schema: baseSchema }, async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    const { email, verificationCode } = request.body;

    try {
      const { userUuid, validUntil } = (await verificationService.find({
        userEmail: email,
        code: verificationCode,
        type: IVerificationType.VERIFICATION,
      }))[0];

      if (userUuid == null || validUntil < new Date()) {
        throw createBandsyError(
          HttpResponseCodes.CLIENT_ERROR,
          BandsyResponseCodes.INVALID_VERIFICATION,
          "verification code not found or expired",
        );
      }

      const { uuid } = (await userService.find({
        uuid: userUuid,
        verified: false,
        accountType: UserAccountType.BANDSY,
      }))[0];

      if (uuid == null) {
        throw createBandsyError(
          HttpResponseCodes.CLIENT_ERROR,
          BandsyResponseCodes.INVALID_ACCOUNT,
          "user not found or already verified",
        );
      }

      await userService.update(userUuid, {
        verified: true,

        updatedAt: new Date(),
      });

      const signedJwt = await jwtSign<IIdentityJwtContent>({
        uuid,
        email,

        accountType: UserAccountType.BANDSY,
      }, JWT_PRIVATE_KEY, {
        expiresIn: Number.parseInt(TOKEN_VALIDITY_TIME, 10),
      });

      reply.code(HttpResponseCodes.OK);

      return {
        token: signedJwt,
        validMs: Number.parseInt(TOKEN_VALIDITY_TIME, 10),
      };
    } catch (error) {
      throw createBandsyError(
        error.statusCode ?? HttpResponseCodes.SERVER_ERROR,
        error.bandsyCode ?? BandsyResponseCodes.SERVER_ERROR,
        error.message ?? error.toString() ?? error,
      );
    }
  });
};
