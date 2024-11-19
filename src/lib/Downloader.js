const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const lodash = require('lodash');
const Queue = require('queue');
const filenamify = require('filenamify');
const YuqueClient = require('./yuque');
const { isPost, formatDate } = require('../util');
const out = require('./out');

const cwd = process.cwd();

// 需要提取的文章属性字段
const PICK_PROPERTY = [
  'title',
  'description',
  'created_at',
  'updated_at',
  'published_at',
  'format',
  'slug',
  'last_editor',
  'public',
  'word_count'
];

/**
 * Constructor 下载器
 *
 * @prop {Object} client 语雀 client
 * @prop {Object} repoConfig 知识库配置
 * @prop {String} postBasicPath 下载的文章最终生成 markdown 的目录
 * @prop {Array} cachedArticles 文章列表
 *
 */
class Downloader {
  constructor(repoConfig, globalCacheConfig) {
    // 语雀SDK实例
    this.client = new YuqueClient(repoConfig);
    // 仓库配置
    this.repoConfig = repoConfig;
    // 缓存配置
    this.globalCacheConfig = globalCacheConfig;
    this.cacheContent = '';
    // 知识库目录
    this.postBasicPath = path.join(cwd, repoConfig.postPath);
    // 文章列表
    this.cachedArticles = [];
    this.fetchArticle = this.fetchArticle.bind(this);
    this.generatePost = this.generatePost.bind(this);
    // 知识库目录
    this.tocList = {};
    // 超时配置
    this.timeout = repoConfig.timeout ? repoConfig.timeout : '5s';
    // 缓存文件
    this.cacheObj = {};
  }
  /**
   * 文章下载 => 全量生成 markdown 文章
   */
  async autoUpdate() {
    if (this.globalCacheConfig) {
      await this.readCache();
    }
    await this.fetchToc();
    await this.fetchArticles();
    this.generatePosts();
  }
  async readCache() {
    try {
      this.cacheContent = fs
        .readFileSync(path.join(cwd, `${this.globalCacheConfig.path}.json`))
        .toString();
    } catch (error) {
      out.warn('no cache file!');
      this.cacheContent = '{}';
    }
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
    const { client, repoConfig, cachedArticles } = this;
    const {
      filterLastTimeAfter,
      onlyPublished,
      onlyPublic,
      filterSlugs,
      filterSlugPrefix,
      assignSlugs
    } = repoConfig;
    const articles = await client.getArticles();

    if (!Array.isArray(articles))
      throw new Error(`fail to fetch article list, response...`);
    let realArticles = articles
      .filter((_) => {
        if (assignSlugs.length && assignSlugs.includes(_.slug)) return true;
        if (
          // published
          (onlyPublished && !_.published_at) ||
          // public
          (onlyPublic && !_.public) ||
          // filter by filterSlugPrefix
          (filterSlugPrefix && _.slug.startsWith(filterSlugPrefix)) ||
          // filter by filterSlugs
          (filterSlugs.length && filterSlugs.includes(_.slug)) ||
          // filter by filterLastTimeAfter
          (filterLastTimeAfter &&
            new Date(_.created_at) > new Date(filterLastTimeAfter))
        )
          return false;
        return true;
      })
      .map((article) => {
        this.generateCacheContent(article);
        return lodash.pick(article, PICK_PROPERTY);
      });

    if (this.globalCacheConfig) {
      const asyncFilter = async (arr, predicate) => {
        const results = await Promise.all(arr.map(predicate));

        return arr.filter((_v, index) => results[index]);
      };
      realArticles = await asyncFilter(realArticles, async (article) => {
        return this.checkCacheArticle(article);
      });
    }

    out.info(
      `total number of ${repoConfig.repo} repo articles: ${
        articles.length
      }, hit cache articles: ${articles.length - realArticles.length}`
    );
    if (!realArticles.length) return;
    const queue = new Queue({ concurrency: repoConfig.concurrency });

    let article;
    let cacheIndex;
    let cacheArticle;
    let cacheAvaliable;

    const findIndexFn = function (item) {
      return item.slug === article.slug;
    };

    for (let i = 0; i < realArticles.length; i++) {
      article = realArticles[i];
      cacheIndex = cachedArticles.findIndex(findIndexFn);
      if (cacheIndex < 0) {
        // 未命中缓存，新增一条
        cacheIndex = cachedArticles.length;
        cachedArticles.push(article);
        queue.push(this.fetchArticle(article, cacheIndex));
      } else {
        cacheArticle = cachedArticles[cacheIndex];
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
   * 缓存规则
   * @param {Object} article
   * @returns 根据缓存规则判断是否需要下载当前文章
   */
  async checkCacheArticle(article) {
    if (this.cacheContent === '{}') return true;
    const { repoConfig } = this;
    const { slug, title, updated_at } = article;
    const updated = formatDate(updated_at);
    const currentArticle = JSON.parse(this.cacheContent)[repoConfig.repo][slug];
    const fileExist = await this.checkPostExist(article);
    // 命中缓存：标题 更新时间 存在该文件
    return currentArticle.title === title &&
      currentArticle.updated === updated &&
      fileExist
      ? false
      : true;
  }
  async checkPostExist(article) {
    const { repoConfig } = this;
    const { slug, title } = article;
    const filePath = path.join(
      cwd,
      `${repoConfig.postPath}${
        repoConfig.mdNameFormat === 'title' ? title : slug
      }.md`
    );
    try {
      if (fs.existsSync(filePath)) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      out.error('cache exist, but file not exist');
      return false;
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
    const { client, cachedArticles } = this;
    return function () {
      out.info(`title of downloaded article: ${item.title}`);
      return client.getArticle(item.slug).then(({ data: article }) => {
        cachedArticles[index] = article;
      });
    };
  }
  /**
   * 全量生成所有 markdown 文章
   */
  generatePosts() {
    const { cachedArticles, postBasicPath } = this;
    if (!cachedArticles.length) return;
    mkdirp.sync(postBasicPath);
    out.info(`create repo folder (if it not exists): ${postBasicPath}`);
    cachedArticles.forEach(this.generatePost);
  }
  /**
   * 生成一篇 markdown 文章
   *
   * @param {Object} post 文章详情
   */
  generatePost(post) {
    if (!isPost(post)) {
      return;
    }
    const { postBasicPath, repoConfig } = this;
    const { mdNameFormat, adapter } = this.repoConfig;
    const fileName = filenamify(post[mdNameFormat]);
    const postPath = path.join(postBasicPath, `${fileName}.md`);
    let transform;

    try {
      transform = require(path.join(__dirname, '../adapter', adapter));
    } catch (error) {
      out.error(`adpater (${adapter}) is invalid.`, error);
      process.exit(-1);
    }
    out.info(`generate post file: ${postPath}`);
    const mdContent = transform({
      post,
      tocInfo: this.tocList,
      repoConfig
    });
    if (repoConfig?.filterCates?.length) {
      const existFilterCate = (this.tocList?.[post?.slug] || []).find((c) =>
        repoConfig.filterCates.includes(c)
      );
      if (existFilterCate) {
        out.info(
          `Article filtered by specified category: ${post.title}. `,
          existFilterCate
        );
        return;
      }
    }
    fs.writeFileSync(postPath, mdContent, {
      encoding: 'UTF8'
    });
  }
  /**
   * 生成缓存文件内容
   * @param {Object} article 文章基本信息
   */
  generateCacheContent(article) {
    const { repoConfig } = this;
    const { slug, title, updated_at } = article;

    if (this.cacheObj[repoConfig.repo]) {
      this.cacheObj[repoConfig.repo][slug] = {
        title: title,
        updated: formatDate(updated_at)
      };
    } else {
      this.cacheObj[repoConfig.repo] = {
        [slug]: {
          title: title,
          updated: formatDate(updated_at)
        }
      };
    }
  }
}

module.exports = Downloader;
