const Command = require('common-bin');
const initConfig = require('../config');
const cleaner = require('../lib/cleaner');
const Downloader = require('../lib/Downloader');
const out = require('../lib/out');

class SyncCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo-lyrics sync';
  }

  async run() {
    for (let i in initConfig) {
      const repoInfo = initConfig[i];
      if (!repoInfo) process.exit(0);
      cleaner.cleanAssignPosts(repoInfo.postPath);
      const downloader = new Downloader(repoInfo);
      await downloader.autoUpdate();
      out.success(`All articles of ${repoInfo.repo} have been downloaded!`);
    }
  }
}

module.exports = SyncCommand;
