'use strict';

/**
 * https://github.com/yuque/sdk
 * 补充yuque的node的sdk，比如说配置
 */
const SDK = require('@yuque/sdk');

function handler(res) {
  // should handler error yourself
  if (res.status !== 200) {
    const err = new Error(res.data.message);
    /* istanbul ignore next */
    err.status = res.data.status || res.status;
    err.code = res.data.code;
    err.data = res;
    throw err;
  }
  // return whatever you want
  return res.data;
}

class YuqueClient extends SDK {
  constructor(config) {
    const { baseUrl, login, repo, token, timeout } = config;
    const endpoint = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const requestOpts = { timeout, };
    const superConfig = {
      endpoint,
      token,
      handler,
      requestOpts,
    };
    super(superConfig);
    this.namespace = `${login}/${repo}`;
  }

  // 获取文档列表
  async getArticles() {
    const { namespace } = this;
    const result = await this.docs.list({ namespace });
    return result;
  }

  // 获取指定slug文档
  async getArticle(slug) {
    const { namespace } = this;
    const result = await this.docs.get({ namespace, slug, data: { raw: 1 } });
    return result;
  }

  // 获取知识库的toc目录文件
  async getToc() {
    const { namespace } = this;
    const result = await this.repos.getTOC({ namespace });
    return result;
  }
}

module.exports = YuqueClient;
