const ejs = require('ejs');
const Entities = require('html-entities').AllHtmlEntities;
const FrontMatter = require('hexo-front-matter');
const { formatDate, formatRaw } = require('../util');

const entities = new Entities();

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
    const regex = /(title:|layout:|tags:|date:|categories:){1}(\S|\s)+?---/gi;
    body = body.replace(regex, (a) =>
      a.replace(/(<br \/>|<br>|<br\/>)/gi, '\n')
    );
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
const tranPreFun = (str) => {
  return str.replace(/<pre data-language="(([\s\S])*?)<\/pre>/g, (data) => {
    return `${data.slice(0, -6)}\n</code></pre>\n`.replace(
      /<.*?>/,
      () => `\n<pre><code>`
    );
  });
};
/**
 * hexoHtml 文章生产适配器
 *
 * @param {Object} post 文章
 * @return {String} text
 */
module.exports = function (param) {
  const { post, tocInfo } = param;
  const {
    title,
    slug: urlname,
    created_at,
    word_count,
    public: articlePublicStatus,
    book,
    body_html
  } = post;
  const cates = tocInfo[urlname] || '';
  const secret = articlePublicStatus;
  const belong_book = book.slug;
  // TODO: 待优化
  const parseRet = parseMatter(post.body_html);
  const { body, ...data } = parseRet;

  let raw = formatRaw(body);
  raw = body_html;
  raw = tranPreFun(raw);

  if (secret === 0) {
    raw = '<div class="yuque-hexo-lyrics-secret">这是加密文章！</div>';
  }
  const date = data.date || formatDate(created_at); // util工具里面的处理时间date函数
  const tags = data.tags || [];
  const categories = cates || data.categories || [];
  const props = {
    title: title.replace(/"/g, ''), // 临时去掉标题中的引号，至少保证文章页面是正常可访问的
    urlname,
    date,
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
