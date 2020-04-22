import { ServerResponse } from "http";

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { BandsyResponseCodes, HttpResponseCodes } from "../../../types";
import { UserAccountType, UserService } from "../../../../../../db";
import { verifyTOTP } from "../../../../../helpers/2fa";
import {
  createBandsyError,
  saltPassword,
  IIdentityJwtContent,
  jwtSign,
} from "../../../../../helpers";

const {
  JWT_PRIVATE_KEY,

  TOKEN_VALIDITY_TIME,
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
      mfaCode: {
        type: "number",
      },
    },
  },
};

const userService = new UserService();

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.post("/", { schema: baseSchema }, async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    const { email, password, mfaCode } = request.body;

    try {
      const {
        uuid,
        salt,
        passwordHash,
        mfaEnabled,
        mfaSecret,
      } = (await userService.find({
        email,
        verified: true,
        accountType: UserAccountType.BANDSY,
      }))[0];

      // peace of mind check on the salt and mfaSecret so i dont have to cast it as string later (should be set anyway)
      if (uuid == null || salt == null || mfaSecret == null) {
        throw createBandsyError(
          HttpResponseCodes.CLIENT_ERROR,
          BandsyResponseCodes.INVALID_ACCOUNT,
          "user not found with this email or was missing some vital fields",
        );
      }

      const { passwordHash: calculatedPasswordhash } = await saltPassword(password, salt);

      if (passwordHash !== calculatedPasswordhash) {
        throw createBandsyError(
          HttpResponseCodes.CLIENT_ERROR,
          BandsyResponseCodes.INVALID_CREDENTIALS,
          "incorrect email + pass combo",
        );
      }

      // TODO: check mfa recovery codes
      if (mfaEnabled && (mfaCode == null || !verifyTOTP(Number.parseInt(mfaCode, 10), mfaSecret))) {
        throw createBandsyError(
          HttpResponseCodes.CLIENT_ERROR,
          BandsyResponseCodes.INVALID_MFA,
          "mfa required but either incorrect or not specified",
        );
      }

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
        validUntil: new Date(new Date().getTime() + Number.parseInt(TOKEN_VALIDITY_TIME, 10)).toISOString(),
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
