import { FastifyInstance, FastifyRequest } from "fastify";

// TODO: make this actually fetch claims, currently this does nothing
// ive just put this in so its easier to add it in properly in the future
export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.decorateRequest("claims", null);

  fastify.addHook("onRequest", async (request: FastifyRequest) => {
    request.claims = {
      admin: false,
    };
  });
};
