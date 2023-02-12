const chalk = require('chalk');

module.exports = {
  info(...args) {
    const prefix = chalk.blue('[INFO]');
    args.unshift(prefix);
    console.log.apply(console, args);
  },
  success(...args) {
    const prefix = chalk.green('[SUCCESS]');
    args.unshift(prefix);
    console.log.apply(console, args);
  },
  warn(...args) {
    const prefix = chalk.yellow('[WARNING]');
    args.unshift(prefix);
    console.log.apply(console, args);
  },
  error(...args) {
    const prefix = chalk.red('[ERROR]');
    args.unshift(prefix);
    console.log.apply(console, args);
  }
};
