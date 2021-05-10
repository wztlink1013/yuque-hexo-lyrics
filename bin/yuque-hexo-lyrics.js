#!/usr/bin/env node

'use strict';

/**
 * https://github.com/vercel/update-check
 */
const checkForUpdate = require('update-check');
const chalk = require('chalk');
const pkg = require('../package');
const out = require('../lib/out');
const Command = require('..');


(async function() {
  let update = null;

  // TODO: 版本相关信息
  try {
    update = await checkForUpdate(pkg, {
      interval: 3600000, // For how long to cache latest version (default: 1 day)
    });
  } catch (err) {
    out.error(`Failed to check for updates: ${err}`);
  }

  if (update) {
    out.info(`Current yuque-hexo-lyrics version is ${chalk.yellow(pkg.version)}, and the latest version is ${chalk.green(update.latest)}. Please update!`);
    out.info('View more detail: https://github.com/wztlink1013/yuque-hexo-lyrics#changelog');
  }

  new Command().start();
})();
