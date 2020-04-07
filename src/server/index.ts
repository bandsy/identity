import buildFastify from "./buildFastify";
import { parseBool } from "../utils";

const {
  WEBSERVER_LOGGER,
  WEBSERVER_PORT,
  WEBSERVER_ADDRESS,
} = process.env;

const startServer = async (): Promise<void> => {
  const server = buildFastify({
    logger: parseBool(WEBSERVER_LOGGER.trim()),
  });

  try {
    await server.listen(Number.parseInt(WEBSERVER_PORT.trim(), 10), WEBSERVER_ADDRESS.trim());
    server.log.info(`identity magic happens on port ${WEBSERVER_PORT.trim()}`);
  } catch (error) {
    server.log.error(error);
    process.exit(-1);
  }
};

export {
  // eslint-disable-next-line import/prefer-default-export
  startServer,
};
