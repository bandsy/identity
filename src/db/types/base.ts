import { FilterQuery, DocumentDefinition } from "mongoose";

interface IBase {
  _id: object;
  uuid: string;
  __v?: number;

  createdAt: Date;
  updatedAt: Date;
}

type IBaseSearchInfo<T extends IBase> = Omit<FilterQuery<T>, "_id" | "__v">;

type IBaseCreateInfo<T extends IBase> = Omit<DocumentDefinition<T>, "_id" | "uuid" | "__v">;

type IBaseUpdateInfo<T extends IBase> = Partial<Omit<T, "_id" | "uuid" | "__v" | "createdAt">> & { updatedAt: Date };

export {
  IBase,
  IBaseSearchInfo,
  IBaseCreateInfo,
  IBaseUpdateInfo,
};
