enum RatelimitType {
  IP,
  USER,
}

interface IRatelimitOptions {
  type: RatelimitType;
  intervalMs: number;
  allowedCalls: number;
}

interface IRatelimitStore {
  id: string;
  route: string;
  method: string;
  currentCalls: number;
}

export {
  RatelimitType,
  IRatelimitOptions,
  IRatelimitStore,
};
