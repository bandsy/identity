import { FastifyInstance, FastifyRequest } from "fastify";
import Redis from "ioredis";
import NodeCache from "node-cache";

import { HttpResponseCodes, BandsyResponseCodes } from "../types";
import { createBandsyError } from "../../../helpers";

const MAX_ALLOWED_REQUESTS = 5;

// TODO: make these env vars
const redis = new Redis({
  name: "mymaster",
  sentinels: [
    {
      host: "rfs-redisfailover.redis.svc.cluster.local",
      port: 26379,
    },
  ],
});

const cache = new NodeCache();

// TODO: heres how we can do groups; make the group name included in the redis key!!!

// TODO: set ratelimit headers
// TODO: add support for user ratelimiting
// TODO: proper error handling
export default async (fastify: FastifyInstance): Promise<void> => {
  // let ratelimits: { ip: string; end: Date }[] = [];

  // TODO: make redis db an env var
  await redis.select(0);
  await redis.flushdb();

  fastify.decorateRequest("ratelimits", false);

  fastify.addHook("onRequest", async (request: FastifyRequest) => {
    // prevents multiple ratelimits to be registered on the same group of routes
    if (request.ratelimits === true) {
      throw createBandsyError(
        HttpResponseCodes.SERVER_ERROR,
        BandsyResponseCodes.SERVER_ERROR,
        "multiple ratelimit runs on a single route are not allowed",
      );
    }

    request.ratelimits = true;

    // refuse ratelimited hosts
    const cachedRatelimit = cache.get(request.ip);
    if (cachedRatelimit != null) {
      throw createBandsyError(
        HttpResponseCodes.TOO_MANY_REQUESTS,
        BandsyResponseCodes.RATELIMITED,
        "you are being ratelimited (cached)",
      );
    }

    const ratelimit = await redis.get(request.ip);
    if (Number.parseInt(ratelimit ?? "0", 10) > Date.now()) {
      // requires ttl in seconds
      cache.set(request.ip, ratelimit, (Number.parseInt(ratelimit ?? "0", 10) - Date.now()) / 1000);

      throw createBandsyError(
        HttpResponseCodes.TOO_MANY_REQUESTS,
        BandsyResponseCodes.RATELIMITED,
        "you are being ratelimited",
      );
    }

    // calculate rate
    // TODO: make sampling period config or env var
    // TODO: get date only once? - think about which is more accurate (accuracy + optimisation)
    const samplingPeriod = 30000;
    const currentPeriod = Math.floor(Date.now() / samplingPeriod);

    // TODO: remove excessive brackets
    // TODO: need to make this route and ratelimiter unique as well
    Promise.all([redis.incr(`${currentPeriod}:${request.ip}`), redis.get(`${currentPeriod - 1}:${request.ip}`)])
      .then(([fetchedCurrent, fetchedPrevious]) => {
        const timeSinceInterval = Date.now() - (currentPeriod * samplingPeriod);

        // TODO: make sure the set expires correctly even if theres errors along the way!!!
        if (fetchedCurrent != null) {
          redis.expire(`${currentPeriod}:${request.ip}`, Math.ceil(((samplingPeriod * 2) - timeSinceInterval) / 60));
        }
        if (fetchedPrevious != null) {
          redis.expire(`${currentPeriod - 1}:${request.ip}`, Math.ceil((samplingPeriod - timeSinceInterval) / 60));
        }

        const [current, previous] = [fetchedCurrent ?? 0, Number.parseInt(fetchedPrevious ?? "0", 10)];
        const rate = previous * (1 - timeSinceInterval / samplingPeriod) + current;

        if (rate > MAX_ALLOWED_REQUESTS) {
          // eslint-disable-next-line max-len
          const ratelimitMs = Math.max(samplingPeriod * (1 - Math.max(MAX_ALLOWED_REQUESTS - current, 0) / Math.max(MAX_ALLOWED_REQUESTS - current, previous)) - timeSinceInterval, 0)
            + samplingPeriod * (1 - MAX_ALLOWED_REQUESTS / Math.max(MAX_ALLOWED_REQUESTS, current));

          redis.set(request.ip, Date.now() + ratelimitMs, "PX", Math.ceil(ratelimitMs));
        }
      })
      .catch(fastify.log.error);
  });
};
