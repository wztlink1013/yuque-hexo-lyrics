'use strict';

const Command = require('common-bin');
/**
 * 加载配置
 * TODO: 这里只有一个对象，就是默认只能下载一个知识库，如果要下载多个，想办法导出对象按数组
 */
const initConfig = require('../config'); // 初始化 config
const cleaner = require('../lib/cleaner');
const Downloader = require('../lib/Downloader');
const out = require('../lib/out');


class SyncCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: yuque-hexo-lyrics sync';
  }
  
  async run() {

      // TODO: 先删除所有文件夹下的文档
      for(let i in initConfig) {
        const initConfig_item = initConfig[i];
        // for initConfig in config { }
        if (!initConfig_item) {
          process.exit(0);
        }
        // clear previous directory.
        if (initConfig_item.lastGeneratePath === '') {
          out.info('clear previous directory.');
          cleaner.cleanPosts();
        }
        // get articles from yuque or cache
        // const downloader = new Downloader(initConfig_item);
        // await downloader.autoUpdate();
        // out.info('yuque-hexo-lyrics sync done! test local download!');
      }
      // TODO: 在这里用for循环对initConfig对象数组进行遍历
      for(let i in initConfig) {
        const initConfig_item = initConfig[i];
        // for initConfig in config { }
        if (!initConfig_item) {
          process.exit(0);
        }
        // clear previous directory.
        // if (initConfig_item.lastGeneratePath === '') {
        //   out.info('clear previous directory.');
        //   cleaner.cleanPosts();
        // }
        // get articles from yuque or cache
        const downloader = new Downloader(initConfig_item);
        await downloader.autoUpdate();
        out.info('yuque-hexo-lyrics sync done! test local download!');
      }
  }
}

module.exports = SyncCommand;
