const parseBool = (str: string): boolean | undefined => {
  switch (str) {
    case "true": {
      return true;
    }
    case "false": {
      return false;
    }
    default: {
      return undefined;
    }
  }
};

// turns a pascal or camel case string into snek boii case
const snekify = (str: string): string => {
  // SnakeCase
  // snakeCase
  // UserID
  // userID
  // OAuthThing
  throw new Error(`not implemented (yet!) ${str} ${str} ${str}`);
};

export {
  parseBool,
  snekify,
};
