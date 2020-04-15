import path from "path";
import fs from "fs";

import mongoose from "mongoose";

import { UserModel } from "./models";
import { Base } from "./schemas";
import { UserService, IUserService } from "./services";
import {
  IDbUpdateInfo,
  IDbDeleteInfo,
  OauthServiceType,
  UserAccountType,
  IUser,
  IUserSearchInfo,
  IUserCreateInfo,
  IUserUpdateInfo,
} from "./types";

const {
  NODE_PATH,
  MONGO_HOST,
  MONGO_DB,
  MONGO_CERT,
} = process.env;

// TODO: see if theres a way to pass the cert to mongoose directly
const connectDb = async (): Promise<void> => {
  try {
    fs.writeFileSync(path.join(NODE_PATH, "x509-full.pem"), MONGO_CERT);

    await mongoose.connect(`mongodb://${MONGO_HOST}/`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: MONGO_DB,
      tls: true,
      // tlsCAFile: "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt",
      tlsCertificateKeyFile: path.join(NODE_PATH, "x509-full.pem"),
      authMechanism: "MONGODB-X509",
      authSource: "$external",
      tlsAllowInvalidCertificates: true,
    });

    mongoose.connection.on("error", error => {
      throw error;
    });
  } catch (error) {
    console.error(error);
    process.exit(-1);
  }
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
};
