import { Document } from "mongoose";

import { BaseService } from "./base";
import { Verification } from "../schemas";
import { VerificationModel } from "../models";

// workaround cos community made types are fine, until you try to get 2 libs working together...
type VerificationDoc = Verification & Document;

// TODO: redefine the other methods to use the proper option interfaces
// TODO: disable updating... somehow...
class VerificationService extends BaseService<VerificationDoc> {
  constructor() {
    super();

    // ye this is terrible, i know, but dependency injection shit is broke af
    this.model = VerificationModel;
  }
}

export {
  // eslint-disable-next-line import/prefer-default-export
  VerificationService,
};
