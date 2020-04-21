import "reflect-metadata";

import { verifyEnvVars } from "./utils";
import { startServer } from "./server";
import { connectDb } from "./db";

// TODO: add a fn to verify these where needed
const envVarsOk = verifyEnvVars([
  {
    envVar: "NODE_ENV",
  },
  {
    envVar: "NODE_PATH",
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
  {
    envVar: "MONGO_HOST",
  },
  {
    envVar: "MONGO_DB",
  },
  {
    envVar: "MONGO_CERT",
  },
  {
    envVar: "JWT_PRIVATE_KEY",
  },
  {
    envVar: "JWT_PUBLIC_KEY",
  },
  {
    envVar: "ACCOUNT_VERIFICATION_TIME",
    requirements: {
      type: "number",
    },
  },
]);

if (!envVarsOk) {
  console.error("one or more environment variables were set incorrectly");
  process.exit(-1);
}

// TODO: always use NODE_PATH instead of __dirname

// TODO: propagate any errors from connectDb and startServer instead
// TODO: better/separate way to handle env vars

(async (): Promise<void> => {
  try {
    await connectDb();
    await startServer();
  } catch (error) {
    console.error(`startup error: ${error}`);
    process.exit(-1);
  }
})();
