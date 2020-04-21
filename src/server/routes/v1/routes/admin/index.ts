import { FastifyInstance } from "fastify";

import users from "./users";

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(users, { prefix: "users" });
};
