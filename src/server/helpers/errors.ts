import { IBandsyError, HttpResponseCodes, BandsyResponseCodes } from "../routes/v1/types";

const createBandsyError = (statusCode: HttpResponseCodes, bandsyCode: BandsyResponseCodes, message: string): IBandsyError => ({
  name: "bandsy_error",

  statusCode,
  bandsyCode,
  message,
});

export {
  // eslint-disable-next-line import/prefer-default-export
  createBandsyError,
};
