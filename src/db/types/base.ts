enum BaseSearchComparison {
  EQUAL,
  GREATER,
  LESS,
}

enum BaseSortOrder {
  STABLE,
  INCREASING,
  DECREASING,
}

interface IBase {
  _id: object;
  uuid: string;
  __v?: number;

  createdAt: Date;
  updatedAt: Date;
}

interface IBaseSearchOptions<T> {
  value: T;
  comparison: BaseSearchComparison;
}

interface IBaseSortOptions<T> {
  value: T;
  order: BaseSortOrder;
}

interface IBaseSearchInfo {
  uuid?: string;

  createdAt?: IBaseSearchOptions<Date>;
  updatedAt?: IBaseSearchOptions<Date>;
}

interface IBaseCreateInfo {
  createdAt: Date;
  updatedAt: Date;
}

interface IBaseUpdateInfo {
  updatedAt: Date;
}

export {
  BaseSearchComparison,
  BaseSortOrder,
  IBase,
  IBaseSearchOptions,
  IBaseSortOptions,
  IBaseSearchInfo,
  IBaseCreateInfo,
  IBaseUpdateInfo,
};
