/* eslint-disable @typescript-eslint/no-require-imports */
module.exports = function (options) {
  return {
    ...options,
    watchOptions: {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: /node_modules/,
    },
  };
};
