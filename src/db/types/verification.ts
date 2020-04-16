import { IBase, IBaseSearchInfo, IBaseCreateInfo } from "./base";

interface IVerification extends IBase {
  userUuid: string;
  userEmail: string;

  code: string;
  validUntil: Date;
}

interface IVerificationSearchInfo extends IBaseSearchInfo<IVerification> {
  userUuid?: string;
  userEmail?: string;

  code?: string;
}

interface IVerificationCreateInfo extends IBaseCreateInfo<IVerification> {
  userUuid: string;
  userEmail: string;

  code: string;
  validUntil: Date;
}

export {
  IVerification,
  IVerificationSearchInfo,
  IVerificationCreateInfo,
};
