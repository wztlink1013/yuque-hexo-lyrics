const path = require('path');
const out = require('./lib/out');

const cwd = process.cwd();
const token = process.env.YUQUE_TOKEN;

// 默认的配置
const defaultConfig = {
  postPath: 'source/yuque', //文档同步后生成的路径
  mdNameFormat: 'title', //文件名命名方式 (title / slug)
  baseUrl: 'https://www.yuque.com/api/v2/', //语雀 API 地址
  login: '', //语雀 login (group), 也称为个人路径
  repo: '', //语雀仓库短名称，也称为语雀知识库路径
  adapter: 'hexoMarkdown', //文档生成格式 (hexoMarkdown/hexoHtml/markdown)
  concurrency: 5, //下载文章并发数
  onlyPublished: false, //只展示已经发布的文章
  onlyPublic: false, //只展示公开文章
  timeout: '200s', //YuqueClientSDK 超时时间
  token
};

function loadConfig() {
  const pkg = loadJson() || loadYaml();
  if (!pkg) {
    out.error('current directory should have a package.json');
    return null;
  }

  let result = [];
  let yuqueConfig = pkg.yuqueConfig || [];
  yuqueConfig.forEach((item) => {
    result.push(Object.assign({}, defaultConfig, item));
  });
  return result;
}

function loadJson() {
  const pkgPath = path.join(cwd, 'package.json');
  // out.info(`loading config: ${pkgPath}`);
  try {
    const pkg = require(pkgPath);
    return pkg;
  } catch (error) {
    // do nothing
  }
}

function loadYaml() {
  // TODO
}

module.exports = loadConfig();
