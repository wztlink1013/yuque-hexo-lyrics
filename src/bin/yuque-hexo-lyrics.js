#!/usr/bin/env node

'use strict';

const checkForUpdate = require('update-check');
const chalk = require('chalk');
const pkg = require('../../package.json');
const out = require('../lib/out');
const Command = require('../index.js');

(async function () {
  let update = null;

  try {
    update = await checkForUpdate(pkg, {
      interval: 3600000
    });
  } catch (err) {
    out.error(`Failed to check for updates: ${err}`);
  }

  if (update) {
    out.info(
      `Current yuque-hexo-lyrics version is ${chalk.yellow(
        pkg.version
      )}, and the latest version is ${chalk.green(
        update.latest
      )}. Please update!`
    );
    out.info(
      'View more detail: https://github.com/wztlink1013/yuque-hexo-lyrics#changelog'
    );
  }

  new Command().start();
})();
