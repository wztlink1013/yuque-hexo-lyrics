const path = require('path');
const out = require('./lib/out');

const cwd = process.cwd();
const token = process.env.YUQUE_TOKEN;

const defaultCacheConfig = {
  path: 'yuque-hexo-lyrics'
};
const defaultRepoConfig = {
  postPath: 'source/yuque',
  mdNameFormat: 'title', // title / slug
  baseUrl: 'https://www.yuque.com/api/v2/',
  login: '',
  repo: '',
  adapter: 'hexoMarkdown', // hexoMarkdown / hexoHtml / markdown
  concurrency: 5, // 下载文章并发数
  onlyPublished: false, // 发布的文章
  onlyPublic: false, // 公开的文章
  timeout: '200s', //YuqueClientSDK 超时时间
  token
};

function loadConfig() {
  const pkg = loadJson() || loadYaml();
  if (!pkg) {
    out.error('current directory should have a package.json');
    return null;
  }
  const { yuqueConfig } = pkg;
  const cache = Object.assign({}, defaultCacheConfig, yuqueConfig?.cache);
  const repos = (yuqueConfig?.repos || []).map((item) =>
    Object.assign({}, defaultRepoConfig, item)
  );
  return {
    cache,
    repos
  };
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
  // TODO:
}

module.exports = loadConfig();
