const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const lodash = require('lodash');
const Queue = require('queue');
const filenamify = require('filenamify');
const YuqueClient = require('./yuque');
const { isPost } = require('../util');
const out = require('./out');

const cwd = process.cwd();

// 需要提取的文章属性字段
const PICK_PROPERTY = [
  'title', // 标题
  'description', // 描述
  'created_at', // 文档创建日期
  'updated_at', // 文档更新日期
  'published_at', //文档发布日期
  'format', // 什么格式
  'slug', // slug
  'last_editor', //
  'public', //公开与否，不过hexo.js文件不能用，因为这里已经被处理了
  'word_count' //字数统计
];

/**
 * Constructor 下载器
 *
 * @prop {Object} client 语雀 client
 * @prop {Object} config 知识库配置
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
    // markdown目录
    this.postBasicPath = path.join(cwd, config.postPath);
    // 文章列表
    this._cachedArticles = [];
    this.fetchArticle = this.fetchArticle.bind(this);
    this.generatePost = this.generatePost.bind(this);
    // 知识库目录
    this.tocList = {};
    // 超时配置
    this.timeout = config.timeout ? config.timeout : '5s';
  }
  /**
   * 文章下载 => 全量生成 markdown 文章
   */
  async autoUpdate() {
    await this.fetchToc();
    await this.fetchArticles();
    this.generatePosts();
  }

  /**
   * 下载知识库目录
   */
  async fetchToc() {
    const { client } = this;
    const toc = await client.getToc();
    const data = toc.data;

    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.type === 'DOC') {
        let cates = [];
        const item_slug = item.slug;
        if (item.parent_uuid === '') {
          cates = [];
        } else {
          for (let j = i - 1; j >= 0; j--) {
            if (data[j].depth === item.depth - 1 && data[j].type === 'TITLE') {
              cates.unshift(data[j].title);
              item.depth--;
              continue;
            }
          }
        }
        this.tocList[item_slug] = cates;
      }
    }
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

    out.info(
      `total number of ${config.repo} repo articles: ${articles.data.length}`
    );
    const realArticles = articles.data
      .filter((article) =>
        config.onlyPublished ? !!article.published_at : true
      )
      .filter((article) => (config.onlyPublic ? !!article.public : true))
      .map((article) => lodash.pick(article, PICK_PROPERTY));

    const queue = new Queue({ concurrency: config.concurrency });

    let article;
    let cacheIndex;
    let cacheArticle;
    let cacheAvaliable;

    const findIndexFn = function (item) {
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
      queue.start(function (err) {
        if (err) return reject(err);
        out.success('download articles done!');
        resolve();
      });
    });
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
    return function () {
      out.info(`title of downloaded article: ${item.title}`);
      return client.getArticle(item.slug).then(({ data: article }) => {
        _cachedArticles[index] = article;
      });
    };
  }
  /**
   * 全量生成所有 markdown 文章
   */
  generatePosts() {
    const { _cachedArticles, postBasicPath } = this;
    mkdirp.sync(postBasicPath);
    out.info(`create repo folder (if it not exists): ${postBasicPath}`);
    _cachedArticles.forEach(this.generatePost);
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

    const { postBasicPath } = this;
    const { mdNameFormat, adapter } = this.config;
    const fileName = filenamify(post[mdNameFormat]);
    const postPath = path.join(postBasicPath, `${fileName}.md`);
    let transform;

    try {
      transform = require(path.join(__dirname, '../adapter', adapter));
    } catch (error) {
      out.error(`adpater (${adapter}) is invalid.`);
      process.exit(-1);
    }
    out.info(`generate post file: ${postPath}`);
    const mdContent = transform({
      post,
      tocInfo: this.tocList
    });
    fs.writeFileSync(postPath, mdContent, {
      encoding: 'UTF8'
    });
  }
}

module.exports = Downloader;
