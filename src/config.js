const path = require('path');
const out = require('./lib/out');

const cwd = process.cwd();
const token = process.env.YUQUE_TOKEN;

// 默认的配置
const defaultConfig_essay = {
  postPath: 'source/_posts/yuque',
  cachePath: 'yuque.json',
  lastGeneratePath: '',
  mdNameFormat: 'title',
  baseUrl: 'https://www.yuque.com/api/v2/', //sdk
  token, //sdk
  login: '', //sdk
  repo: '', //sdk
  adapter: 'hexo',
  concurrency: 5,
  onlyPublished: false,
  onlyPublic: false,
  timeout: '60s' //sdk
};
// 实际配置
// "yuqueConfig_dsal": {
//   "baseUrl": "https://www.yuque.com/api/v2",
//   "login": "nicaibandishuqing",
//   "repo": "dsal",
//   "postPath": "source/_posts/dsal",
//   "cachePath": "yuque_dsal.json",
//   "mdNameFormat": "slug",
//   "onlyPublished": false,
//   "onlyPublic": true,
//   "adapter": "hexo",
//   "timeout": "100s"
// }

/**
 * 加载package.json里面的配置
 * TODO: 将package加载进来后，找出多个知识库的配置字段，然后将他们，遍历，导出一个对象数组
 * @return 目前只导出一个对象，就是默认的知识库
 */
function loadConfig() {
  // 加载package.json里面的配置
  const pkg = loadJson() || loadYaml();
  if (!pkg) {
    out.error('current directory should have a package.json');
    return null;
  }
  // 提取package里面的yuqueConfig_dsal属性对象
  // TODO: 想办法提取多个知识库的配置字段，用正则表达式找出yuqueConfig开头的属性
  // 找出package.json中yuqueConfig单词开头的字段
  let config_array = [];
  for (let i = 0; i < Object.keys(pkg).length; i++) {
    const item = Object.keys(pkg)[i];
    // 正则表达式匹配属性的前几个字母字段，不用正则，用indexOf把
    if (item.indexOf('yuqueConfig') !== -1) {
      config_array.push(item);
    }
  }
  // const { yuqueConfig_dsal,yuqueConfig_essay } = pkg;
  // if (!lodash.isObject(yuqueConfig_dsal)) {
  //   out.error('package.yueConfig should be an object.');
  //   return null;
  // }

  // Object.assign() 方法用于将所有可枚举属性的值从一个或多个源对象分配到目标对象。它将返回目标对象
  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

  let config = {};
  for (let i = 0; i < config_array.length; i++) {
    // let config_array_item = config_array[i];
    config[config_array[i]] = Object.assign(
      {},
      defaultConfig_essay,
      pkg[config_array[i]]
    );
  }
  // const config_dsal = Object.assign({}, defaultConfig_essay, yuqueConfig_dsal);
  // const config_essay = Object.assign({}, defaultConfig_essay, yuqueConfig_essay);
  // TODO: 这里返回的应该是对象数组
  // let config = {config_dsal,config_essay};
  return config;
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
