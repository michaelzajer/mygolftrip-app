module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": "off", // Turns off enforcement of quote style
    "no-restricted-globals": "off", // Turns off restricted globals
    "prefer-arrow-callback": "error", // Keeps arrow functions preference
    "require-jsdoc": "off", // Turns off requirement for JSDoc comments
    "max-len": "off", // Turns off maximum line length enforcement
    "indent": "off", // Turns off indentation enforcement
    // You can add more rule adjustments here as needed
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
