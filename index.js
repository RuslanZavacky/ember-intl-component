'use strict';

module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return true;
  },

  autoImport: {
    webpack: {
      resolve: {
        fallback: {
          fs: false,
          path: false,
        },
      },
    },
  },
};
