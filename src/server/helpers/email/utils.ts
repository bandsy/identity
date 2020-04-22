import { VerificationService, IVerificationType } from "../../../db";
import { IEmailTransportOptions, VerificationEmail } from ".";
import { parseBool } from "../../../utils";
import { generateRandomToken } from "..";

// TODO: yes i realise this can be done in a better way (runtime type checker!)
const {
  TRANS_HOST,
  TRANS_PORT,
  TRANS_SECURE,
  TRANS_EMAIL,
  TRANS_EMAIL_PASS,

  ACCOUNT_VERIFICATION_TIME,
} = process.env;

const verificationService = new VerificationService();

// TODO: the boolean cast wont be needed when i write that runtime type checker
const transportOptions: IEmailTransportOptions = {
  host: TRANS_HOST.trim(),
  port: parseInt(TRANS_PORT.trim(), 10),
  secure: parseBool(TRANS_SECURE.trim()) as boolean,
  auth: {
    user: TRANS_EMAIL.trim(),
    pass: TRANS_EMAIL_PASS.trim(),
  },
};

// TODO: IVerificationType should not be prefixed with an I (not an interface)
// TODO: what do we do with the username?
const verifyEmail = async (userUuid: string, userEmail: string, verificationType: IVerificationType): Promise<void> => {
  const verificationCode = await generateRandomToken(24);

  await verificationService.create({
    userUuid,
    userEmail,

    code: verificationCode,
    type: verificationType,
    validUntil: new Date(new Date().getTime() + parseInt(ACCOUNT_VERIFICATION_TIME.trim(), 10)),

    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const verificationEmail = new VerificationEmail(transportOptions);
  await verificationEmail.send(userEmail, {
    username: "cunty mcjim",
    verificationCode,
  });
};

export {
  // eslint-disable-next-line import/prefer-default-export
  verifyEmail,
};
