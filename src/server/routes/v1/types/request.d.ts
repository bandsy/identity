import { IncomingMessage } from "http";

import { IIdentityJwtContent } from "../../../helpers";
import { IClaims } from "./claims";

declare module "fastify" {
  export interface FastifyRequest<
    HttpRequest = IncomingMessage,
    Query = DefaultQuery,
    Params = DefaultQuery,
    Headers = DefaultHeaders,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Body = any,
  > {
    jwt?: IIdentityJwtContent;
    claims?: IClaims;
  }
}
