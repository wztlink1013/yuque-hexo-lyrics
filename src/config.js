const path = require('path');
const out = require('./lib/out');

const cwd = process.cwd();
const token = process.env.YUQUE_TOKEN;

// NOTE: 默认缓存配置数据结构
// const defaultCacheConfig = {
//   path: 'yuque-hexo-lyrics' // 文件名
// };

const defaultRepoConfig = {
  postPath: 'source/yuque', // 知识库文章下载文件夹
  timeout: '200s', // YuqueClientSDK 超时时间
  baseUrl: 'https://www.yuque.com/api/v2/',
  token,
  login: '',
  repo: '',
  concurrency: 5, // 下载文章并发数
  // 文章内容格式配置
  mdNameFormat: 'title', // title / slug
  adapter: 'hexoMarkdown', // hexoMarkdown / hexoHtml / markdown
  // 过滤文章相关配置
  assignSlugs: [], // 指定slug不被过滤 优先级高于过滤相关(filter开头/only开头)的配置字段
  fileSuffix: 'md',
  onlyPublished: false, // 发布的文章
  onlyPublic: false, // 公开的文章
  filterLastTimeAfter: '', // 下载文章的最后时间
  filterSlugs: [], // 过滤文章指定slug
  filterSlugPrefix: '', // 过滤文章slug前缀
  filterCates: [], // 过滤文章分类
  forceDownloadSecret: false // 强制下载加密文章
};

function loadConfig() {
  const pkg = loadJson() || loadYaml();
  if (!pkg) {
    out.error('current directory should have a package.json');
    return null;
  }
  const { yuqueConfig } = pkg;

  !yuqueConfig?.cache?.path &&
    out.warn('cache path does not exist, caching is disabled');

  return {
    // repos config
    globalRepos: (yuqueConfig?.repos || []).map((item) =>
      Object.assign({}, defaultRepoConfig, item)
    ),
    // cache config
    globalCacheConfig: yuqueConfig?.cache?.path ? yuqueConfig.cache : null
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
