import { FastifyInstance } from "fastify";

import base from "./base";
import links from "./links";
import mfa from "./mfa";
import payments from "./payments";

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(base, { prefix: "base" });
  fastify.register(links, { prefix: "links" });
  fastify.register(mfa, { prefix: "mfa" });
  fastify.register(payments, { prefix: "payments" });
};
