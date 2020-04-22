import path from "path";
import fs from "fs";

import mongoose from "mongoose";

// TODO: clean up these imports!
import { UserModel, VerificationModel } from "./models";
import { Base, User, Verification } from "./schemas";
import { UserService, IUserService, VerificationService } from "./services";
import { createDatabaseError } from "./helpers";
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

  DatabaseError,
  IDatabaseError,
} from "./types";

const {
  NODE_ENV,
  NODE_PATH,
  MONGO_HOST,
  MONGO_DB,
  MONGO_CERT,
} = process.env;

// TODO: see if theres a way to pass the cert to mongoose directly
// TODO: IMPORTANT: im using normal .finds a lot which are probably less performant than findOne()s,
// add a findOne() fn to all the services
const connectDb = async (): Promise<void> => {
  try {
    const certPath = path.join(NODE_PATH, "mongo-cert.pem");

    fs.writeFileSync(certPath, MONGO_CERT);

    let envOpts = {};
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

    await mongoose.connect(`mongodb://${MONGO_HOST}/`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: MONGO_DB,
      tls: true,
      tlsCertificateKeyFile: certPath,
      authMechanism: "MONGODB-X509",
      authSource: "$external",

      ...envOpts,
    });

    console.log("connected to mongo");
  } catch (error) {
    console.error(`error starting mongo: ${error}`);
    throw new Error(`error starting mongo: ${error}`);
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

  Verification,
  VerificationModel,
  User,
  VerificationService,
  IVerificationType,

  DatabaseError,
  IDatabaseError,

  createDatabaseError,
};
