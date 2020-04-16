import muuid from "uuid-mongodb";
import {
  Model,
  DocumentDefinition,
  Document,
  FilterQuery,
} from "mongoose";

import { Base } from "../schemas";
import { IBaseSearchInfo, IBaseCreateInfo, IBaseUpdateInfo } from "../types";

interface IBaseService<T extends Base> {
  findById(uuid: string): Promise<DocumentDefinition<T> | null>;
  find(searchInfo: IBaseSearchInfo<T>): Promise<DocumentDefinition<T>[]>;
  create(createInfo: IBaseCreateInfo<T>): Promise<DocumentDefinition<T>>;
  update(uuid: string, updateInfo: IBaseUpdateInfo<T>): Promise<DocumentDefinition<T> | null>;
  delete(uuid: string): Promise<DocumentDefinition<T> | null>;
}

// workaround cos community made types are fine, until you try to get 2 libs working together...
type BaseDoc = Base & Document;

abstract class BaseService<T extends BaseDoc> implements IBaseService<T> {
  protected model!: Model<T>;

  public async findById(uuid: string): Promise<DocumentDefinition<T> | null> {
    try {
      const bsonUuid = muuid.from(uuid);

      return (await this.model.findById(bsonUuid))?.toObject();
    } catch (error) {
      throw new Error(`error running BaseService.findById (uuid: ${uuid}): ${error}`);
    }
  }

  // TODO: pagination and sort
  // TODO: convert 'uuid' param to _id - currently cant search by id here
  public async find(searchInfo: IBaseSearchInfo<T>): Promise<DocumentDefinition<T>[]> {
    try {
      // this is safe to do as _id and __v arent required params
      return (await this.model.find(searchInfo as FilterQuery<T>)).map((e: T) => e.toObject());
    } catch (error) {
      throw new Error(`error running BaseService.find ( searchInfo: ${searchInfo} ): ${error}`);
    }
  }

  public async create(createInfo: IBaseCreateInfo<T>): Promise<DocumentDefinition<T>> {
    try {
      return (await this.model.create(createInfo)).toObject();
    } catch (error) {
      throw new Error(`error running BaseService.create ( createInfo: ${createInfo} ): ${error}`);
    }
  }

  public async update(uuid: string, updateInfo: IBaseUpdateInfo<T>): Promise<DocumentDefinition<T> | null> {
    try {
      const bsonUuid = muuid.from(uuid);

      return (await this.model.findByIdAndUpdate(bsonUuid, updateInfo))?.toObject();
    } catch (error) {
      throw new Error(`error running BaseService.update ( uuid: ${uuid}, updateInfo: ${updateInfo} ): ${error}`);
    }
  }

  public async delete(uuid: string): Promise<DocumentDefinition<T> | null> {
    try {
      const bsonUuid = muuid.from(uuid);

      return (await this.model.findByIdAndDelete(bsonUuid))?.toObject();
    } catch (error) {
      throw new Error(`error running BaseService.delete ( uuid: ${uuid} ): ${error}`);
    }
  }
}

export {
  // eslint-disable-next-line import/prefer-default-export
  BaseService,
  IBaseService,
};
