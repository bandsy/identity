/* eslint-disable @typescript-eslint/camelcase */
import querystring, { ParsedUrlQueryInput } from "querystring";

import fetch from "node-fetch";

import { OauthServiceType } from "../../db";

// typescript is just a pile of wank innit
interface IOauthOptions extends ParsedUrlQueryInput {
  clientId?: string;
  clientSecret?: string;
  grantType?: string;
  redirectUri?: string;
  scope?: string;

  code: string;
}

interface IOauthRefreshOptions extends ParsedUrlQueryInput {
  clientId?: string;
  clientSecret?: string;
  grantType?: string;
  redirectUri?: string;
  scope?: string;

  refreshToken: string;
}

interface IAccessTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  scope: string;
}

interface IUserResponse {
  email: string;
}

interface ITokenEndpoints {
  // number is OauthServiceType
  [key: number]: {
    endpoint: string;
    refreshEndpoint: string;
    userEndpoint: string;
    defaultOptions: Omit<IOauthOptions, "code">;
  };
}

// TODO: make these strings env vars
// TODO: split endpoints into base + route endings
const tokenEndpoints: ITokenEndpoints = {
  [OauthServiceType.DISCORD]: {
    endpoint: "https://discordapp.com/api/v6/oauth2/token",
    refreshEndpoint: "https://discordapp.com/api/v6/oauth2/token",
    userEndpoint: "https://discordapp.com/api/v6/users/@me",
    defaultOptions: {
      clientId: "372462428690055169",
      clientSecret: "-qdDFpZMIJM6YUWdkL_4f5WX-OjflcJv",
      grantType: "authorization_code",
      redirectUri: "https://dev.identity.bandsy.app/api/v1/oauth-test/redirect",
      scope: "guilds+identify+email",
    },
  },
};

const exchangeToken = async (oauthService: OauthServiceType, oauthOptions: IOauthOptions): Promise<IAccessTokenResponse> => {
  try {
    // i wanna keep the camelCase consistency, but we still need to convert
    // to snake case as thats what oauth wants

    // TODO: clean this up so it doesnt look as disgusting as it does rn
    const query = querystring.encode({
      client_id: oauthOptions.clientId ?? tokenEndpoints[oauthService].defaultOptions.clientId,
      client_secret: oauthOptions.clientSecret ?? tokenEndpoints[oauthService].defaultOptions.clientSecret,
      grant_type: oauthOptions.grantType ?? tokenEndpoints[oauthService].defaultOptions.grantType,
      redirect_uri: oauthOptions.redirectUri ?? tokenEndpoints[oauthService].defaultOptions.redirectUri,
      scope: oauthOptions.scope ?? tokenEndpoints[oauthService].defaultOptions.scope,

      // code cannot have a default
      code: oauthOptions.code,
    });

    const response = await fetch(tokenEndpoints[oauthService].endpoint, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: query,
    }).then(res => res.json());

    if (response.error != null) {
      throw new Error(response.error_description);
    }

    // ...and then we turn it back to camelCase
    return {
      accessToken: response.access_token,
      tokenType: response.token_type,
      expiresIn: response.expires_in,
      refreshToken: response.refresh_token,
      scope: response.scope,
    };
  } catch (error) {
    throw new Error(`failed to get oauth access token ( oauthService: ${oauthService} ): ${error}`);
  }
};

const refreshToken = async (oauthService: OauthServiceType, oauthOptions: IOauthRefreshOptions): Promise<IAccessTokenResponse> => {
  try {
    // i wanna keep the camelCase consistency, but we still need to convert
    // to snake case as thats what oauth wants

    // TODO: clean this up so it doesnt look as disgusting as it does rn
    const query = querystring.encode({
      client_id: oauthOptions.clientId ?? tokenEndpoints[oauthService].defaultOptions.clientId,
      client_secret: oauthOptions.clientSecret ?? tokenEndpoints[oauthService].defaultOptions.clientSecret,
      grant_type: oauthOptions.grantType ?? tokenEndpoints[oauthService].defaultOptions.grantType,
      redirect_uri: oauthOptions.redirectUri ?? tokenEndpoints[oauthService].defaultOptions.redirectUri,
      scope: oauthOptions.scope ?? tokenEndpoints[oauthService].defaultOptions.scope,

      // code cannot have a default
      refresh_token: oauthOptions.refreshToken,
    });

    const response = await fetch(tokenEndpoints[oauthService].endpoint, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: query,
    }).then(res => res.json());

    if (response.error != null) {
      throw new Error(response.error_description);
    }

    // ...and then we turn it back to camelCase
    return {
      accessToken: response.access_token,
      tokenType: response.token_type,
      expiresIn: response.expires_in,
      refreshToken: response.refresh_token,
      scope: response.scope,
    };
  } catch (error) {
    throw new Error(`failed to get oauth access token ( oauthService: ${oauthService} ): ${error}`);
  }
};

// TODO: format this a bit, make it work with all the services
// and make it return a concrete type if possible
const fetchUserData = async (oauthService: OauthServiceType, token: string): Promise<IUserResponse> => {
  try {
    const response = await fetch(tokenEndpoints[oauthService].userEndpoint, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then(res => res.json());

    // NOTE: temporary, will fix later (lmao)
    if (response.email == null) {
      throw new Error("oauth email not in response (might be an issue when adding more oauth services, ~~was~~ am a lazy shit)");
    }

    return {
      email: response.email,
    };
  } catch (error) {
    throw new Error(`failed to fetch oauth user data ( token: ${token} ): ${error}`);
  }
};

export {
  IOauthOptions,
  IAccessTokenResponse,
  IUserResponse,
  ITokenEndpoints,
  tokenEndpoints,
  exchangeToken,
  refreshToken,
  fetchUserData,
};
