import { FastifyInstance } from "fastify";

import { admin, user, visitor } from "./routes";
import { HttpResponseCodes, BandsyResponseCodes, IBandsyError } from "./types";

// temp
import old from "./index-old";

const { NODE_ENV } = process.env;

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(admin, { prefix: "admin" });
  fastify.register(user, { prefix: "user" });
  fastify.register(visitor, { prefix: "visitor" });

  // temp
  fastify.register(old);

  fastify.setErrorHandler(async (error: IBandsyError, request, reply) => {
    const errorReply = {
      bandsyCode: BandsyResponseCodes.ERROR_HANDLER_ERROR,
      message: "something got fucked in the error handler",

      ...(NODE_ENV === "dev" ? {
        error: error.message,
      } : {}),
    };

    if (error.validation != null) {
      errorReply.bandsyCode = BandsyResponseCodes.VALIDATION_ERROR;
      errorReply.message = "validation error";

      return errorReply;
    }

    switch (error.statusCode) {
      case HttpResponseCodes.CLIENT_ERROR: {
        reply.status(HttpResponseCodes.CLIENT_ERROR);

        errorReply.bandsyCode = error.bandsyCode ?? BandsyResponseCodes.CLIENT_ERROR;
        errorReply.message = "client error";

        break;
      }
      case HttpResponseCodes.SERVER_ERROR: {
        reply.status(HttpResponseCodes.SERVER_ERROR);

        errorReply.bandsyCode = error.bandsyCode ?? BandsyResponseCodes.SERVER_ERROR;
        errorReply.message = "server error";

        break;
      }
      default: {
        reply.status(HttpResponseCodes.SERVER_ERROR);

        errorReply.bandsyCode = error.bandsyCode ?? BandsyResponseCodes.UNKNOWN_ERROR;
        errorReply.message = "unknown error";

        break;
      }
    }

    return errorReply;
  });
};
