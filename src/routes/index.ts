import { FastifyInstance } from "fastify";

import v1 from "./v1";

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.get("/", async () => ({
    service: "identity",
    apiVersions: [
      {
        prefix: "/v1",
        routes: [
          "POST /register",
          "POST /register/oauth",
          "POST /login",
          "POST /login/oauth",
          "POST /delete",
          "POST /data",
          "POST /password/recover",
          "POST /password/change",
          "POST /link/oauth",
        ],
      },
    ],
    nonce: "cunty mcjim",
  }));

  fastify.register(v1, { prefix: "v1" });
};
