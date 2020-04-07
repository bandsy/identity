import { verifyEnvVars } from "./utils";
import { startServer } from "./server";

const envVarsOk = verifyEnvVars([
  {
    envVar: "NODE_ENV",
  },
  {
    envVar: "WEBSERVER_LOGGER",
    requirements: {
      type: "boolean",
    },
  },
  {
    envVar: "WEBSERVER_PORT",
    requirements: {
      type: "number",
    },
  },
  {
    envVar: "WEBSERVER_ADDRESS",
  },

  {
    envVar: "TRANS_HOST",
  },
  {
    envVar: "TRANS_PORT",
    requirements: {
      type: "number",
    },
  },
  {
    envVar: "TRANS_SECURE",
    requirements: {
      type: "boolean",
    },
  },
  {
    envVar: "TRANS_EMAIL",
  },
  {
    envVar: "TRANS_EMAIL_PASS",
  },

  {
    envVar: "EMAIL_DISPLAY",
  },
  {
    envVar: "EMAIL_DISPLAY_NAME",
  },
]);

if (!envVarsOk) {
  console.error("one or more environment variables were set incorrectly");
  process.exit(-1);
}

startServer();
