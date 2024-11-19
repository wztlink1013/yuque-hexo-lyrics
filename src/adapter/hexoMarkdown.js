const ejs = require('ejs');
const Entities = require('html-entities').AllHtmlEntities;
const FrontMatter = require('hexo-front-matter');
const { formatDate, formatRaw } = require('../util');

const entities = new Entities();
// 高亮块
const colorBlocks = {
  ':::tips\n':
    '<div style="background: #FFFBE6;padding:10px;border: 1px solid #C3C3C3;border-radius:5px;margin-bottom:5px;">',
  ':::danger\n':
    '<div style="background: #FFF3F3;padding:10px;border: 1px solid #DEB8BE;border-radius:5px;margin-bottom:5px;">',
  ':::info\n':
    '<div style="background: #E8F7FF;padding:10px;border: 1px solid #ABD2DA;border-radius:5px;margin-bottom:5px;">',
  ':::warning\n':
    '<div style="background: #fffbe6;padding:10px;border: 1px solid #e0d1b1;border-radius:5px;margin-bottom:5px;">',
  ':::success\n':
    '<div style="background: #edf9e8;padding:10px;border: 1px solid #c2d2b5;border-radius:5px;margin-bottom:5px;">',
  '\\s+:::': '</div>'
};

// 文章模板
const template = `---
<%- matter -%>

<%- raw -%>`;

/**
 * front matter 反序列化
 * @description
 * @param {String} body md 文档
 * @return {String} result
 */
function parseMatter(body) {
  body = entities.decode(body);
  try {
    // front matter信息的<br/>换成 \n
    const regex = /(title:|layout:|tags:|date:|categories:){1}(\S|\s)+?---/gi;
    body = body.replace(regex, (a) =>
      // eslint-disable-next-line prettier/prettier
      a.replace(/(<br \/>|<br>|<br\/>)/gi, '\n')
    );
    // 支持提示区块语法
    for (const key in colorBlocks) {
      body = body.replace(new RegExp(key, 'igm'), colorBlocks[key]);
    }
    const result = FrontMatter.parse(body);
    result.body = result._content;
    if (result.date) {
      result.date = formatDate(result.date);
    }
    delete result._content;
    return result;
  } catch (error) {
    return {
      body
    };
  }
}

/**
 * hexo 文章生产适配器
 *
 * @param {Object} 参数
 * @return {String} text
 */
module.exports = function (param) {
  const { post, tocInfo, repoConfig } = param;
  const {
    title,
    slug: urlname,
    created_at,
    updated_at,
    word_count,
    public: articlePublicStatus,
    book
  } = post;
  const { forceDownloadSecret } = repoConfig;
  const cates = tocInfo[urlname] || '';
  const secret = articlePublicStatus;
  const belong_book = book.slug;
  // matter 解析
  const parseRet = parseMatter(post.body);
  const { body, ...data } = parseRet;

  let raw = formatRaw(body);
  if (secret === 0 && !forceDownloadSecret) {
    raw = '<div class="yuque-hexo-lyrics-secret">这是加密文章！</div>';
  }
  // FIXME: 时间格式化结果受代码运行宿主环境影响
  const date = data.date || formatDate(created_at);
  const updated = data.updated || formatDate(updated_at);
  const tags = data.tags || [];
  const categories = cates || data.categories || [];

  const props = {
    title: title.replace(/"/g, ''), // 临时去掉标题中的引号
    urlname,
    date,
    updated,
    ...data,
    tags,
    categories,
    word_count,
    secret,
    belong_book
  };
  const text = ejs.render(template, {
    raw,
    matter: FrontMatter.stringify(props)
  });
  return text;
};
