import { ServerResponse } from "http";

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { HttpResponseCodes, BandsyResponseCodes } from "../../../types";
import {
  OauthServiceType,
  UserService,
  UserAccountType,
  DatabaseError,
} from "../../../../../../db";
import {
  createBandsyError,
  exchangeToken,
  fetchUserData,
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
    required: ["oauthService", "accessCode"],
    properties: {
      oauthService: {
        type: "number",
        enum: Object.values(OauthServiceType),
      },
      accessToken: {
        type: "string",
      },
    },
  },
};

const userService = new UserService();

// TODO: think about making jwt valid until oauth token expires, also can we make it more smooth using refresh tokens?
export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.post("/", { schema: baseSchema }, async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
    const { oauthService, accessCode } = request.body;

    try {
      // need it for later (when sending jwt)
      let newUserUuid = null;

      const {
        accessToken,
        tokenType,
        expiresIn,
        refreshToken,
        scope,
      } = await exchangeToken(oauthService, {
        code: accessCode,
      });

      const { email } = await fetchUserData(oauthService, accessToken);

      const user = (await userService.find({
        email,
        accountType: UserAccountType.OAUTH,
      }))[0];

      if (user == null) {
        const newUser = await userService.create({
          accountType: UserAccountType.OAUTH,

          email,
          verified: true,

          oauthService,
          accessToken,
          accessTokenType: tokenType,
          // expires in thats returned from oauth is in seconds (at least it should be)
          accessTokenExpiresAt: new Date(new Date().getTime() + (expiresIn * 1000)),
          refreshToken,
          oauthScope: scope,

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

        newUserUuid = newUser.uuid;
      } else {
        await userService.update(user.uuid, {
          accessToken,
          accessTokenType: tokenType,
          // expires in thats returned from oauth is in seconds (at least it should be)
          accessTokenExpiresAt: new Date(new Date().getTime() + (expiresIn * 1000)),
          refreshToken,
          oauthScope: scope,

          updatedAt: new Date(),
        });
      }

      // send jwt
      const signedJwt = await jwtSign<IIdentityJwtContent>({
        // user can be null, optional chaining required here to prevent bad shit (even tho ts doesnt think so)
        uuid: user?.uuid ?? newUserUuid,
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
