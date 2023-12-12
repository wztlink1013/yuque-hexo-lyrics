const ejs = require('ejs');
const FrontMatter = require('hexo-front-matter');
const { formatDate } = require('../util');

/**
 * hexoHtml
 * @param {Object} post 文章
 * @return {String} text
 */
module.exports = function (param) {
  const { post, tocInfo } = param;
  const {
    title,
    slug: urlname,
    created_at,
    updated_at,
    word_count,
    public: secret,
    book,
    body_html,
    tags: postTags
  } = post;

  return ejs.render(
    `---
<%- matter -%>

<%- content -%>`,
    {
      matter: FrontMatter.stringify({
        title: title.replace(/"/g, ''),
        urlname,
        date: formatDate(created_at),
        updated: formatDate(updated_at),
        tags: (postTags || []).map((item) => item.title),
        categories: tocInfo[urlname] || [],
        word_count,
        secret,
        belong_book: book.slug || ''
      }),
      content:
        Number(secret) === 0
          ? `<div class="yuque-hexo-lyrics-secret">这是加密文章！</div>`
          : tranPreLabel(body_html)
    }
  );
};

const tranPreLabel = (str) =>
  str.replace(/<pre data-language="(([\s\S])*?)<\/pre>/g, (data) =>
    `${data.slice(0, -6)}\n</code></pre>\n`.replace(
      /<.*?>/,
      () => `\n<pre><code>`
    )
  );
