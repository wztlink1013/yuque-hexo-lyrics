const path = require('path');
const fs = require('fs');
const Command = require('common-bin');
const initConfig = require('../config');
// const cleaner = require('../lib/cleaner');
const Downloader = require('../lib/Downloader');
const out = require('../lib/out');

const cwd = process.cwd();

class SyncCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo-lyrics sync';
    this.cacheContents = {};
  }

  async run() {
    const { repos, cache } = initConfig;
    for (let i in repos) {
      const repoConfig = repos[i];
      if (!repoConfig) process.exit(0);
      const downloader = new Downloader(repoConfig, cache);
      await downloader.autoUpdate();
      this.cacheContents[repoConfig.repo] =
        downloader.cacheObj[repoConfig.repo];
      out.success(`All articles of ${repoConfig.repo} have been downloaded!`);
    }
    this.generateCacheFile(
      path.join(cwd, `${cache.path}.json`),
      this.cacheContents
    );
  }

  /**
   * 多个知识库生成一份缓存文件
   * @param {String} path 缓存路径
   * @param {Object} content 缓存内容
   */
  generateCacheFile(path, content) {
    fs.writeFileSync(path, JSON.stringify(content), {
      encoding: 'UTF8'
    });
    out.success(`cache file generated successfully: ${path}`);
  }
}

module.exports = SyncCommand;
