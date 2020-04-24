import { FastifyInstance, FastifyRequest } from "fastify";

import { createBandsyError } from "../../../helpers";
import { HttpResponseCodes, BandsyResponseCodes } from "../types";

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.addHook("onRequest", async (request: FastifyRequest) => {
    if (request.claims?.admin !== true) {
      throw createBandsyError(
        HttpResponseCodes.UNAUTORISED,
        BandsyResponseCodes.UNAUTHORISED,
        "admin required but user is not admin",
      );
    }
  });
};
