import { IDatabaseError, DatabaseError } from "../types";

const createDatabaseError = (dbCode: DatabaseError, message: string): IDatabaseError => ({
  name: "db_error",

  dbCode,
  message,
});

export {
  // eslint-disable-next-line import/prefer-default-export
  createDatabaseError,
};
