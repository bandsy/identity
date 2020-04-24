import { FastifyInstance } from "fastify";

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.post("/", async () => {
    const rawrxd = "rawrxd";

    return {
      rawrxd,
    };
  });
};
