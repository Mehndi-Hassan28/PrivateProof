module.exports = {
  devServer: (devServerConfig) => {
    // Remove all deprecated webpack-dev-server v4 options that are invalid in v5
    const deprecated = [
      'onAfterSetupMiddleware',
      'onBeforeSetupMiddleware',
      'https',
      'transportMode',
    ];
    deprecated.forEach((key) => {
      delete devServerConfig[key];
    });

    // If https was set, migrate to the new 'server' option
    devServerConfig.server = 'http';

    return devServerConfig;
  },
};
