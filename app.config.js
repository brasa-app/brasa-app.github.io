// Permite cambiar la ruta base de la web: vacía para brasa-app.github.io.
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...config.experiments, baseUrl: process.env.BRASA_BASE_URL ?? '' },
});
