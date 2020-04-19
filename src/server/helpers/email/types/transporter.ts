// TODO: make transport a class, provide it as a dep using dependency injection
interface IEmailTransportOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export {
  // eslint-disable-next-line import/prefer-default-export
  IEmailTransportOptions,
};
