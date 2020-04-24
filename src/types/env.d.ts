declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: "prod" | "dev" | "test";
    NODE_PATH: string;

    WEBSERVER_LOGGER: string;
    WEBSERVER_PORT: string;
    WEBSERVER_ADDRESS: string;

    TRANS_HOST: string;
    TRANS_PORT: string;
    TRANS_SECURE: string;
    TRANS_EMAIL: string;
    TRANS_EMAIL_PASS: string;

    EMAIL_DISPLAY: string;
    EMAIL_DISPLAY_NAME: string;

    MONGO_HOST: string;
    MONGO_DB: string;
    MONGO_CERT: string;

    JWT_PRIVATE_KEY: string;
    JWT_PUBLIC_KEY: string;

    ACCOUNT_VERIFICATION_TIME: string;
    TOKEN_VALIDITY_TIME: string;
  }
}
