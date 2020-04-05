import type { FastifyInstance } from "fastify";

export default async (fastify: FastifyInstance): Promise<void> => {
  // acount creation (email + pass):
  // - send email + pass to server
  // - receive email confirmation link
  // - click confirmation link (to bandsy website)
  // - bandsy website makes api request with confirmation token
  // - on ok, finishes account creation and logs in user
  fastify.post("/register", async () => {
    const rawrxd = "rawrxd";

    return {
      rawrxd,
    };
  });

  // acount creation (3rd party):
  // - click the button
  // - redirect to 3rd party login
  // - /redirect link and grab info
  // - send token to identity
  // - identity grabs info and verifies, logs user in
  fastify.post("/register/oauth", async () => {
    const rawrxd = "rawrxd";

    return {
      rawrxd,
    };
  });

  // account login (email + pass):
  // - send email + pass
  // - if ok, send token
  fastify.post("/login", async () => {
    const rawrxd = "rawrxd";

    return {
      rawrxd,
    };
  });

  // account login (3rd party):
  // - click the button
  // - redirect to 3rd party login
  // - /redirect link and grab info
  // - send token to identity
  // - identity grabs info, if ok, send token
  fastify.post("/login/oauth", async () => {
    const rawrxd = "rawrxd";

    return {
      rawrxd,
    };
  });

  // delete account:
  // - query all other services for user data
  // - delete all user data
  // - delete identity
  fastify.post("/delete", async () => {
    const rawrxd = "rawrxd";

    return {
      rawrxd,
    };
  });

  // request account data:
  // - query all other services for user data
  // - return data
  fastify.post("/data", async () => {
    const rawrxd = "rawrxd";

    return {
      rawrxd,
    };
  });

  // recover password (email + pass only):
  // - send user email
  // - send pass reset link via email
  // - redirect to site
  // - send token + new pass to ident
  // - login user
  fastify.post("/password/recover", async () => {
    const rawrxd = "rawrxd";

    return {
      rawrxd,
    };
  });

  // reset password (email + pass only):
  // - send email + old pass + new pass
  fastify.post("/password/change", async () => {
    const rawrxd = "rawrxd";

    return {
      rawrxd,
    };
  });

  // link 3rd party:
  // oauth shite with extra steps
  fastify.post("/link/oauth", async () => {
    const rawrxd = "rawrxd";

    return {
      rawrxd,
    };
  });
};
