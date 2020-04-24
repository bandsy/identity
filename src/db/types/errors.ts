// definitely incomplete
enum DatabaseError {
  DUPLICATE_KEY = 11000,
}

interface IDatabaseError extends Error {
  dbCode: DatabaseError;
}

export {
  // eslint-disable-next-line import/prefer-default-export
  DatabaseError,
  IDatabaseError,
};
