import path from "path";

import mongoose from "mongoose";

import { verifyEnvVars } from "./utils";
import { UserService } from "./db";

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

// temp
(async (): Promise<void> => {
  // const tlsKeyFile = fs.readFileSync(path.join(__dirname, "..", "x509-full.pem")).toString();

  await mongoose.connect("mongodb://mongo-main-0.mongo-service.mongodb.svc.cluster.local,mongo-main-1.mongo-service.mongodb.svc.cluster.local/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "rawrxd",
    tls: true,
    // tlsCAFile: "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt",
    tlsCertificateKeyFile: path.join(__dirname, "..", "x509-full.pem"),
    authMechanism: "MONGODB-X509",
    authSource: "$external",
    tlsAllowInvalidCertificates: true,
  }).catch(error => {
    console.error(`e1: ${error}`);
  });

  mongoose.Promise = global.Promise;

  const conn = mongoose.connection;

  conn.on("open", () => {
    console.log("mongo conn ok");
  });

  conn.on("error", error => {
    console.error(`e2: ${error}`);
  });

  console.log("here...");

  const aids = await UserService.findUsers({});
  console.log(aids.map(e => e.uuid));

  //
  // startServer();
})();
//
