import { FastifyInstance, FastifyRequest } from "fastify";

import { IRatelimitOptions, IRatelimitStore, RatelimitType } from "../types";

// TODO: set ratelimit headers
export default async (fastify: FastifyInstance, options: IRatelimitOptions): Promise<void> => {
  // TODO: use redis for this *yeoooo redis*
  let ratelimits: IRatelimitStore[] = [];

  let interval = Math.floor(Date.now() / options.intervalMs);

  fastify.addHook("onRequest", async (request: FastifyRequest) => {
    // just in case lmao
    if (options.allowedCalls === 0) {
      // throw
      throw new Error("wip error");
    }

    // reset everything if interval
    const newInterval = Math.floor(Date.now() / options.intervalMs);

    if (interval < newInterval) {
      interval = newInterval;

      ratelimits = [];
    }

    let id: string;
    switch (options.type) {
      case RatelimitType.IP: {
        id = request.ip;

        break;
      }
      case RatelimitType.USER: {
        // throw (unimplemented)
        throw new Error("wip error - unimplemeted");

        break;
      }
      default: {
        // throw
        throw new Error("wip error");
      }
    }

    const ratelimit = ratelimits.find(e => e.route === request.req.url && e.method === request.req.method);

    if (ratelimit == null) {
      ratelimits.push({
        id,
        route: request.req.url as string,
        method: request.req.method as string,
        currentCalls: 1,
      });

      return;
    }

    if (ratelimit.currentCalls === options.allowedCalls) {
      // throw
      throw new Error("wip error");
    }

    ratelimit.currentCalls += 1;
  });
};
