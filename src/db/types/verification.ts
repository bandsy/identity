import { IBase, IBaseSearchInfo, IBaseCreateInfo } from "./base";

enum IVerificationType {
  VERIFICATION,
  RECOVERY,
}

interface IVerification extends IBase {
  userUuid: string;
  userEmail: string;

  code: string;
  type: IVerificationType;
  validUntil: Date;
}

interface IVerificationSearchInfo extends IBaseSearchInfo<IVerification> {
  userUuid?: string;
  userEmail?: string;

  code?: string;
  type?: IVerificationType;
}

interface IVerificationCreateInfo extends IBaseCreateInfo<IVerification> {
  userUuid: string;
  userEmail: string;

  code: string;
  type: IVerificationType;
  validUntil: Date;
}

export {
  IVerificationType,
  IVerification,
  IVerificationSearchInfo,
  IVerificationCreateInfo,
};
