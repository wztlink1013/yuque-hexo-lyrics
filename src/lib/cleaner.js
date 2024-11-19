const path = require('path');
const rimraf = require('rimraf');
const config = require('../config');
const out = require('./out');

const cwd = process.cwd();

module.exports = {
  cleanPosts() {
    const { globalRepos, globalCacheConfig } = config;
    // clear cache
    if (globalCacheConfig) {
      const cacheDist = path.join(cwd, `${globalCacheConfig.path}.json`);
      rimraf.sync(cacheDist);
      out.info(`remove local cache file: ${cacheDist}.`);
    }
    // clear posts
    globalRepos.forEach((repo) => {
      const { postPath } = repo;
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
