module.exports = {
  env: {
    es6: true,
    jest: true,
  },
  extends: [
    "airbnb-base",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/extensions": "off",
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".ts"],
      },
    },
  },
};
