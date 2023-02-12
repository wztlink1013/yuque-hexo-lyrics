const { formatRaw } = require('../util');

/**
 * markdown 文章生产适配器
 *
 * @param {Object} 参数
 * @return {String} text
 */
module.exports = function (param) {
  const { post } = param;
  const { body } = post;
  const raw = formatRaw(body);
  return raw;
};
