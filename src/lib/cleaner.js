const path = require('path');
const rimraf = require('rimraf');
const config = require('../config');
const out = require('./out');

const cwd = process.cwd();

module.exports = {
  cleanPosts() {
    config.forEach((configItem) => {
      const { postPath } = configItem;
      const dist = path.join(cwd, postPath);
      out.info(`remove everything in the ${dist} folder.`);
      rimraf.sync(dist);
    });
  },

  cleanAssignPosts(postPath) {
    const dist = path.join(cwd, postPath);
    out.info(`remove everything in the ${dist} folder.`);
    rimraf.sync(dist);
  }
};
