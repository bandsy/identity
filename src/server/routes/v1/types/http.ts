enum HttpResponseCodes {
  OK = 200,
  OK_NO_CONTENT = 204,
  CLIENT_ERROR = 400,
  UNAUTORISED = 401,
  FORBIDDEN = 403,
  TOO_MANY_REQUESTS = 429,
  SERVER_ERROR = 500,
}

export {
  // eslint-disable-next-line import/prefer-default-export
  HttpResponseCodes,
};
