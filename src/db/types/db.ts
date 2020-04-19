interface IDbUpdateInfo {
  success: boolean;
  matchedCount: number;
  updatedCount: number;
}

interface IDbDeleteInfo {
  success: boolean;
  matchedCount: number;
  deletedCount: number;
}

export {
  IDbUpdateInfo,
  IDbDeleteInfo,
};
