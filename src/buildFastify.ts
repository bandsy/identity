import Fastify from "fastify";

const buildFastify = (settings = {}) => {
  const fastify = Fastify(settings);

  fastify.get("/", async () => ({
    service: "identity",
    nonce: "cunty mcjim",
  }));

  return fastify;
};

export default buildFastify;
