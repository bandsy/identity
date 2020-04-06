const parseBool = (string: string): boolean | undefined => {
  switch (string) {
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

export {
  // eslint-disable-next-line import/prefer-default-export
  parseBool,
};
