import { parseBool } from "./misc";

interface EnvVarRequirements {
  type?: "string" | "number" | "boolean";
}

interface EnvVarList {
  envVar: string;
  requirements?: EnvVarRequirements;
}

const defaultRequirements: EnvVarRequirements = {
  type: "string",
};

const verifyEnvVar = (envVarKey: string, requirements: EnvVarRequirements = defaultRequirements): boolean => {
  const envVar = process.env[envVarKey];
  const { type } = requirements;

  if (envVar == null) {
    return false;
  }

  switch (type) {
    case "string": {
      return true;
    }
    case "number": {
      return !Number.isNaN(Number.parseInt(envVar, 10));
    }
    case "boolean": {
      return parseBool(envVar) != null;
    }
    default: {
      return true;
    }
  }
};

const verifyEnvVars = (toVerify: Array<EnvVarList>): boolean => (
  toVerify.map(e => verifyEnvVar(e.envVar, e.requirements)).reduce((p, c) => p && c, true));

export { verifyEnvVar, verifyEnvVars };
