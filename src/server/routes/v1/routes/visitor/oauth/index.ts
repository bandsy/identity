import { FastifyInstance } from "fastify";

import authenticate from "./authenticate";

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(authenticate, { prefix: "authenticate" });
};
