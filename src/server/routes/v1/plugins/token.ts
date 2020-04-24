import { FastifyInstance, FastifyRequest } from "fastify";

import { IIdentityJwtContent, jwtVerify, createBandsyError } from "../../../helpers";
import { HttpResponseCodes, BandsyResponseCodes } from "../types";

const {
  JWT_PUBLIC_KEY,
} = process.env;

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.decorateRequest("jwt", null);

  fastify.addHook("onRequest", async (request: FastifyRequest) => {
    const { token } = request.cookies;

    try {
      if (token == null) {
        throw new Error("token not specified");
      }

      request.jwt = await jwtVerify<IIdentityJwtContent>(token, JWT_PUBLIC_KEY);
    } catch (error) {
      throw createBandsyError(
        error.statusCode ?? HttpResponseCodes.FORBIDDEN,
        error.bandsyCode ?? BandsyResponseCodes.FORBIDDEN,
        error.message ?? error.toString() ?? error,
      );
    }
  });
};
