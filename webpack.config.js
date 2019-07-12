const createExpoWebpackConfig = require('@expo/webpack-config');

module.exports = (env, argv) => {
  const config = createExpoWebpackConfig(env, argv);
  return config.then(c => {
    c.plugins = c.plugins.filter(x => x.constructor.name !== 'WebpackDeepScopeAnalysisPlugin');
    return c;
  });
};
