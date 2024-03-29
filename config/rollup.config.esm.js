// rollup.config.js
// ES moudle
var common = require('./rollup.js');

module.exports = {
  input: 'src/bin/yuque-hexo-lyrics.js',
  output: {
    file: 'dist/index.esm.js',
    format: 'es',
    // When export and export default are not used at the same time, set legacy to true.
    // legacy: true,
    banner: common.banner
  },
  plugins: [common.getCompiler()]
};
