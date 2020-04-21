import { FastifyInstance } from "fastify";

import bandsy from "./bandsy";
import oauth from "./oauth";

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(bandsy, { prefix: "bandsy" });
  fastify.register(oauth, { prefix: "oauth" });
};
