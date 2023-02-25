const Command = require('common-bin');
const initConfig = require('../config');
// const cleaner = require('../lib/cleaner');
const Downloader = require('../lib/Downloader');
const out = require('../lib/out');

class SyncCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo-lyrics sync';
  }

  async run() {
    const { repos, cache } = initConfig;
    for (let i in repos) {
      const repoConfig = repos[i];
      if (!repoConfig) process.exit(0);
      // cleaner.cleanAssignPosts(repoConfig.postPath);
      const downloader = new Downloader(repoConfig, cache);
      await downloader.autoUpdate();
      out.success(`All articles of ${repoConfig.repo} have been downloaded!`);
    }
  }
}

module.exports = SyncCommand;
