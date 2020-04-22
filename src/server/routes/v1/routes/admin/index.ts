import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

import users from "./users";
import { ratelimit } from "../../plugins";
import { RatelimitType } from "../../types";
// import { parseToken, fetchClaims, requireAdmin } from "../../plugins";

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(users, { prefix: "users" });

  // fastify.register(fp(parseToken));
  // fastify.register(fp(fetchClaims));
  // fastify.register(fp(requireAdmin));

  fastify.register(fp(ratelimit), {
    type: RatelimitType.IP,
    intervalMs: 5000,
    allowedCalls: 2,
  });
};
