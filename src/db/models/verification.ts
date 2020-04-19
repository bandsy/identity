import { getModelForClass } from "@typegoose/typegoose";

import { Verification } from "../schemas";

const VerificationModel = getModelForClass(Verification);
export {
  // eslint-disable-next-line import/prefer-default-export
  VerificationModel,
};
