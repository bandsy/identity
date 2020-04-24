import { FastifyInstance } from "fastify";

import { admin, user, visitor } from "./routes";
import { HttpResponseCodes, BandsyResponseCodes, IBandsyError } from "./types";

// temp
// TODO: remove
import old from "./index-old";

const { NODE_ENV } = process.env;

// TODO: ratelimiting (redis required)
// TODO: blacklists
// DONE: basic authorisation (token, admin)
// TODO: mfa routes
// TODO: figure out how to do user account links
// TODO: figure out how to do user payment links
// TODO: figure out what were doing with usernames
// TODO: update docs and make them look nicer

// TODO: account activity
// TODO: password change if the user is logged in
// TODO: admin disable accounts
// TODO: admin routes
// TODO: user fetch data routes
// TODO: account deletion (how we do handle it?)
// TODO: request ALL account data
// TODO: update docs and make them look nicer

// TODO: look into load shedding
export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(admin, { prefix: "admin" });
  fastify.register(user, { prefix: "user" });
  fastify.register(visitor, { prefix: "visitor" });

  // temp
  // TODO: remove
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
