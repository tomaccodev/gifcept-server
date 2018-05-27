const ENVIRONMENTS = {
  development: 'development',
  production: 'production',
};

module.exports = {
  ENVIRONMENTS,
  /**
   * Environment setter
   * @param {string} env
   */
  setEnvironment: env => {
    // Check that provided env is supported otherwise use production
    process.env.NODE_ENV = Object.keys(ENVIRONMENTS)
      .map(key => ENVIRONMENTS[key])
      .includes(env)
      ? env
      : ENVIRONMENTS.production;
  },
  /**
   * Checker for development environment
   */
  isDevelopment: () => process.env.NODE_ENV === ENVIRONMENTS.development,
  /**
   * Checker for production environment
   */
  isProduction: () => process.env.NODE_ENV === ENVIRONMENTS.production,
};
