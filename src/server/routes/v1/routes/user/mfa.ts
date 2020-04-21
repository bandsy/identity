import { FastifyInstance } from "fastify";

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.get("/", async () => {
    const rawrxd = "rawrxd";

    return {
      rawrxd,
    };
  });
};
