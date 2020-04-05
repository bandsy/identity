import buildFastify from "./buildFastify";

const config = {
  webServerSettings: {
    logger: true,
  },
  port: 3000,
  address: "0.0.0.0",
};

const start = async () => {
  const server = buildFastify(config.webServerSettings);

  try {
    await server.listen(config.port, config.address);
    server.log.info(`magic happens on port ${config.webServerSettings}`);
  } catch (error) {
    server.log.error(error);
    process.exit(-1);
  }
};

start();
