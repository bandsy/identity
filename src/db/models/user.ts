import { getModelForClass } from "@typegoose/typegoose";

import { User } from "../schemas";

const UserModel = getModelForClass(User);
export {
  // eslint-disable-next-line import/prefer-default-export
  UserModel,
};
