const path = require('path');
const Command = require('common-bin');
const out = require('./util/index');

class MainCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo-lyrics <command>';
    // load sub command
    this.load(path.join(__dirname, 'command'));
  }
  async run() {
    out.info('yuque-hexo-lyrics clean done!');
  }
}

module.exports = MainCommand;
