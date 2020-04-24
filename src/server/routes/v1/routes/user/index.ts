import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import base from "./base";
import links from "./links";
import mfa from "./mfa";
import payments from "./payments";
import { parseToken } from "../../plugins";

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(base, { prefix: "base" });
  fastify.register(links, { prefix: "links" });
  fastify.register(mfa, { prefix: "mfa" });
  fastify.register(payments, { prefix: "payments" });

  fastify.register(fp(parseToken));
};
