'use strict';

const path = require('path');
/**
 * 文件系统模块
 * 负责读写等操作
 */
const fs = require('fs');
/**
 * mkdirp这是一款在node.js中像mkdir -p一样递归创建目录及其子目录。
 * https://www.cnblogs.com/jiaoshou/p/12187136.html
 */
const mkdirp = require('mkdirp');
/**
 * Lodash 是一个一致性、模块化、高性能的 JavaScript 实用工具库。
 * https://www.lodashjs.com/
 */
const lodash = require('lodash');
/**
 * Node.js 中的队列
 * https://www.npmjs.com/package/queue
 */
const Queue = require('queue');
/**
 * filenamify - 将一个字符串转换为一个有效的安全的文件名
 * https://github.com/sindresorhus/filenamify#readme
 */
const filenamify = require('filenamify');
const YuqueClient = require('./yuque');
const { isPost } = require('../util');
const out = require('./out');

const cwd = process.cwd();

// 存放各个slug对应的分类
const toc_list = {};

// 需要提取的文章属性字段
const PICK_PROPERTY = [
  'title', // 标题
  'description',// 描述
  'created_at', // 文档创建日期
  'updated_at', // 文档更新日期
  'published_at', //文档发布日期
  'format', // 什么格式
  'slug', // slug
  'last_editor', //
  'public', //公开与否，不过hexo.js文件不能用，因为这里已经被处理了
  'word_count', //字数统计
];

/**
 * Constructor 下载器
 *
 * @prop {Object} client 语雀 client
 * @prop {Object} config 知识库配置
 * @prop {String} cachePath 下载的文章缓存的 JSON 文件
 * @prop {String} postBasicPath 下载的文章最终生成 markdown 的目录
 * @prop {Array} _cachedArticles 文章列表
 *
 */
class Downloader {
  constructor(config) {
    // 语雀client
    this.client = new YuqueClient(config);
    // 加载配置
    this.config = config;
    // 缓存json文件
    this.cachePath = path.join(cwd, config.cachePath);
    // markdown目录
    this.postBasicPath = path.join(cwd, config.postPath);
    this.lastGeneratePath = config.lastGeneratePath ? path.join(cwd, config.lastGeneratePath) : '';
    // 文章列表
    this._cachedArticles = [];
    this.fetchArticle = this.fetchArticle.bind(this);
    this.generatePost = this.generatePost.bind(this);
    this.lastGenerate = 0;
    // 超时配置
    this.timeout = config.timeout ? config.timeout : '5s';
    if (this.lastGeneratePath !== '') {
      try {
        this.lastGenerate = Number(
          fs.readFileSync(this.lastGenerate).toString()
        );
      } catch (error) {
        out.warn(`get last generate time err: ${error}`);
      }
    }

  }

  /**
   * 下载文章详情
   *
   * @param {Object} item 文章概要
   * @param {Number} index 所在缓存数组的下标
   *
   * @return {Promise} data
   */
  fetchArticle(item, index) {
    const { client, _cachedArticles } = this;
    return function() {
      out.info(`download article body: ${item.title}`);
      return client.getArticle(item.slug).then(({ data: article }) => {
        _cachedArticles[index] = article;
      });
    };
  }

  /**
   * 下载所有文章
   * 并根据文章是否有更新来决定是否需要重新下载文章详情
   *
   * @return {Promise} queue
   */
  async fetchArticles() {
    const { client, config, _cachedArticles } = this;
    const articles = await client.getArticles();
    if (!Array.isArray(articles.data)) {
      throw new Error(
        `fail to fetch article list, response: ${JSON.stringify(articles)}`
      );
    }
    out.info(`article amount: ${articles.data.length}`);
    // 对拉取到的articles的data数组进行筛选
    const realArticles = articles.data
      .filter(article => (config.onlyPublished ? !!article.published_at : true))
      .filter(article => (config.onlyPublic ? !!article.public : true))
      .map(article => lodash.pick(article, PICK_PROPERTY));


    const queue = new Queue({ concurrency: config.concurrency });

    let article;
    let cacheIndex;
    let cacheArticle;
    let cacheAvaliable;

    const findIndexFn = function(item) {
      return item.slug === article.slug;
    };

    for (let i = 0; i < realArticles.length; i++) {
      article = realArticles[i];
      cacheIndex = _cachedArticles.findIndex(findIndexFn);
      if (cacheIndex < 0) {
        // 未命中缓存，新增一条
        cacheIndex = _cachedArticles.length;
        _cachedArticles.push(article);
        queue.push(this.fetchArticle(article, cacheIndex));
      } else {
        cacheArticle = _cachedArticles[cacheIndex];
        cacheAvaliable =
          +new Date(article.updated_at) === +new Date(cacheArticle.updated_at);
        // 文章有变更，更新缓存
        if (!cacheAvaliable) {
          queue.push(this.fetchArticle(article, cacheIndex));
        }
      }
    }

    return new Promise((resolve, reject) => {
      queue.start(function(err) {
        if (err) return reject(err);
        out.info('download articles done!');
        resolve();
      });
    });
  }

  /**
   * 下载知识库目录
   */
   async fetchToc() {
    const { client } = this;
    const toc = await client.getToc();
    out.info(`download toc!!!!!!!!!`);
    const data = toc.data;
    // // 存放各个slug对应的分类
    // const toc_list = {};

    for (let i = 0;i<data.length;i++) {
      let item = data[i];
      let item_info = {};
      // 如果数组元素是文档
      if(item.type === "DOC") {
        let cates = [];
        const item_slug = item.slug;
        if (item.parent_uuid === "") {
          // 没有目录的文档
          cates = [];
        } else {
          // 该文档有其父级
          // 向前找这篇文档的父级目录
          // 写一个递归！
          for (let j = i-1;j>=0;j--) {
            if(data[j].depth === item.depth-1 && data[j].type === "TITLE") {
              cates.unshift(data[j].title);
              item.depth--;
              continue;
            }
          }
        }
        // 将这个对象：cates数组添加到item_info对象里面
        toc_list[item_slug] = cates;
        // 将item_info对象添加到数组toc_list里面
        // toc_list.push(item_info);
      }
    }
  }


  /**
   * 读取语雀的文章缓存 json 文件
   */
  readYuqueCache() {
    const { cachePath } = this;
    out.info(`reading from yuque.json: ${cachePath}`);
    try {
      const articles = require(cachePath);
      if (Array.isArray(articles)) {
        this._cachedArticles = articles;
        return;
      }
    } catch (error) {
      out.warn(error.message);
      // Do noting
    }
    this._cachedArticles = [];
  }

  /**
   * 写入语雀的文章缓存 json 文件
   */
  writeYuqueCache() {
    const { cachePath, _cachedArticles } = this;
    out.info(`writing to local file: ${cachePath}`);
    fs.writeFileSync(cachePath, JSON.stringify(_cachedArticles, null, 2), {
      encoding: 'UTF8',
    });
  }

  /**
   * 生成一篇 markdown 文章
   *
   * @param {Object} post 文章详情
   */
  generatePost(post) {
    if (!isPost(post)) {
      out.error(`invalid post: ${post}`);
      return;
    }

    if (new Date(post.published_at).getTime() < this.lastGenerate) {
      out.info(`post not updated skip: ${post.title}`);
      return;
    }

    const { postBasicPath } = this;
    const { mdNameFormat, adapter } = this.config;
    const fileName = filenamify(post[mdNameFormat]);
    const postPath = path.join(postBasicPath, `${fileName}.md`);
    let transform; //引入hexo.js文件执行变量
    let cates; //目录数组参数
    let secret; // 文章是否加密参数
    let belong_book; //文章属于哪个知识库（slug）
    try {
      // 引入了hexo.js文件
      transform = require(path.join(__dirname, '../adapter', adapter));
      // console.log(toc_list);
      // console.log(post.book.slug);
      // console.log(post.public);
      // 写一串代码，生成一个参数，放
      secret = post.public;
      belong_book = post.book.slug
      const search_slug = post.slug;
      if (toc_list[search_slug]) {
        cates = toc_list[search_slug];
      } else {
        cates = "";
      }
      // console.log(cates);
    } catch (error) {
      out.error(`adpater (${adapter}) is invalid.`);
      process.exit(-1);
    }
    out.info(`generate post file: ${postPath}`);
    const text = transform(post,cates,secret,belong_book);
    fs.writeFileSync(postPath, text, {
      encoding: 'UTF8',
    });
  }

  /**
   * 全量生成所有 markdown 文章
   */
  generatePosts() {
    const { _cachedArticles, postBasicPath } = this;
    mkdirp.sync(postBasicPath);
    out.info(`create posts directory (if it not exists): ${postBasicPath}`);
    _cachedArticles.forEach(this.generatePost);
  }

  // 文章下载 => 增量更新文章到缓存 json 文件 => 全量生成 markdown 文章
  async autoUpdate() {
    this.readYuqueCache();
    // 下载知识库目录
    await this.fetchToc();
    await this.fetchArticles();
    // 调试中，不需要下面的写入缓存
    // this.writeYuqueCache();
    this.generatePosts();
    if (this.lastGeneratePath) {
      fs.writeFileSync(this.lastGeneratePath, new Date().getTime());
    }
  }
}

module.exports = Downloader;
