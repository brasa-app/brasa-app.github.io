// Permite cambiar la ruta base de la web: /brasa en GitHub Pages, vacía para otras pruebas.
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...config.experiments, baseUrl: process.env.BRASA_BASE_URL ?? '/brasa' },
});
