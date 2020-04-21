import { FastifyInstance } from "fastify";

import login from "./login";
import recover from "./recover";
import register from "./register";
import verify from "./verify";

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(login, { prefix: "login" });
  fastify.register(recover, { prefix: "recover" });
  fastify.register(register, { prefix: "register" });
  fastify.register(verify, { prefix: "verify" });
};
