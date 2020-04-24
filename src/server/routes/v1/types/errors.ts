import { FastifyError } from "fastify";
import { BandsyResponseCodes } from "./codes";

interface IBandsyError extends FastifyError {
  bandsyCode: BandsyResponseCodes;
}

export {
  // eslint-disable-next-line import/prefer-default-export
  IBandsyError,
};
