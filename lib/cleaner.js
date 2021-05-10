'use strict';

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const config = require('../config');
const out = require('./out');

const cwd = process.cwd();

module.exports = {
  // clear directory of generated posts
  cleanPosts() {
    for(let i in config) {
      const config_item = config[i];
      const { postPath } = config_item;
      const dist = path.join(cwd, postPath);
      out.info(`remove yuque posts: ${dist}`);
      rimraf.sync(dist);
    }
  },

  // clear cache of posts' data
  clearCache() {
    const cachePath = path.join(cwd, 'yuque.json');
    try {
      out.info(`remove yuque.json: ${cachePath}`);
      fs.unlinkSync(cachePath);
    } catch (error) {
      out.warn(`remove empty yuque.json: ${error.message}`);
    }
  },

  // clear last generated timestamp file
  clearLastGenerate() {
    for(let i in config) {
      const config_item = config[i];
      const { lastGeneratePath } = config_item;
      if (!lastGeneratePath) {
        return;
      }
      const dist = path.join(cwd, lastGeneratePath);
      out.info(`remove last generated timestamp: ${dist}`);
      rimraf.sync(dist);
    }
  },
};
