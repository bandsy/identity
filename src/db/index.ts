import path from "path";
import fs from "fs";

import mongoose from "mongoose";

// TODO: clean up these imports!
import { UserModel, VerificationModel } from "./models";
import { Base, User, Verification } from "./schemas";
import { UserService, IUserService, VerificationService } from "./services";
import {
  IDbUpdateInfo,
  IDbDeleteInfo,
  OauthServiceType,
  UserAccountType,
  IUser,
  IUserSearchInfo,
  IUserCreateInfo,
  IUserUpdateInfo,
  IVerificationType,
} from "./types";

const {
  NODE_ENV,
  NODE_PATH,
  MONGO_HOST,
  MONGO_DB,
  MONGO_CERT,
} = process.env;

// TODO: see if theres a way to pass the cert to mongoose directly
const connectDb = async (): Promise<void> => {
  let envOpts = {};

  try {
    fs.writeFileSync(path.join(NODE_PATH, "x509-full.pem"), MONGO_CERT);
  } catch (error) {
    console.error(`error starting mongo (1): ${error}`);
    process.exit(-1);
  }

  try {
    if (NODE_ENV === "dev") {
      envOpts = {
        tlsAllowInvalidCertificates: true,
      };
    }
    if (NODE_ENV === "prod") {
      envOpts = {
        tlsCAFile: "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt",
      };
    }
  } catch (error) {
    console.error(`error starting mongo (2): ${error}`);
    process.exit(-1);
  }

  try {
    await mongoose.connect(`mongodb://${MONGO_HOST}/`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: MONGO_DB,
      tls: true,
      tlsCertificateKeyFile: path.join(NODE_PATH, "x509-full.pem"),
      authMechanism: "MONGODB-X509",
      authSource: "$external",

      ...envOpts,
    });
  } catch (error) {
    console.error(`error starting mongo (3): ${error}`);
    process.exit(-1);
  }

  console.log("connected to mongo");
};

export {
  UserModel,
  UserService,
  IUserService,
  IDbUpdateInfo,
  IDbDeleteInfo,
  OauthServiceType,
  UserAccountType,
  IUser,
  IUserSearchInfo,
  IUserCreateInfo,
  IUserUpdateInfo,

  connectDb,

  Base,

  Verification,
  VerificationModel,
  User,
  VerificationService,
  IVerificationType,
};
