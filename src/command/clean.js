const Command = require('common-bin');
const initConfig = require('../config');
const cleaner = require('../lib/cleaner');
const out = require('../lib/out');

class CleanCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = '[Usage] yuque-hexo-lyrics clean';
  }

  async run() {
    if (!initConfig) {
      process.exit(0);
    }
    cleaner.cleanPosts();
    out.success('yuque-hexo-lyrics clean done!');
  }
}

module.exports = CleanCommand;
