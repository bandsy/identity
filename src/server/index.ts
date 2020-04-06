import buildFastify from "./buildFastify";

const {
  WEBSERVER_LOGGER,
  WEBSERVER_PORT,
  WEBSERVER_ADDRESS,
} = process.env;

const startServer = async (): Promise<void> => {
  const server = buildFastify({
    logger: WEBSERVER_LOGGER,
  });

  try {
    await server.listen(Number.parseInt(WEBSERVER_PORT, 10), WEBSERVER_ADDRESS);
    server.log.info(`identity magic happens on port ${WEBSERVER_PORT}`);
  } catch (error) {
    server.log.error(error);
    process.exit(-1);
  }
};

export {
  // eslint-disable-next-line import/prefer-default-export
  startServer,
};
