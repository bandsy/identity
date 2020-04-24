import Fastify, { FastifyInstance } from "fastify";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";

import routes from "./routes";

const buildFastify = (settings = {}): FastifyInstance => {
  const fastify = Fastify(settings);

  // + ratelimiting for public and private routes
  // + default user/admin claims and individual account claims
  // + view activity (all api route calls tracked)
  fastify.get("/", async () => ({
    service: "identity",
    serviceVersion: "0.2.0",
    apiPrefix: "/api",
    nonce: "cunty mcjim",
  }));

  // TODO make secret an env var
  fastify.register(fastifyCookie, {
    secret: "rawrxd",
  });

  // TODO: show matt how to use telepresence so i can set this properly!!!
  fastify.register(fastifyCors, {
    origin: true,
  });

  fastify.register(routes, { prefix: "/api" });

  return fastify;
};

export default buildFastify;
