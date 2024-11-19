const ejs = require('ejs');
const FrontMatter = require('hexo-front-matter');
const { formatDate } = require('../util');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

/**
 * hexoHtml
 * @param {Object} post 文章
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
    public: secret,
    book,
    body_html,
    tags: postTags
  } = post;
  const { forceDownloadSecret } = repoConfig;

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
        Number(secret) === 0 && !forceDownloadSecret
          ? `<div class="yuque-hexo-lyrics-secret">这是加密文章！</div>`
          : tranPreLabel(body_html)
    }
  );
};

const HIGHLIGHT_MAP = [
  {
    type: 'tips',
    str: `data-type="tips" class="ne-alert"`,
    color: `#EFF0F0`
  },
  {
    type: 'info',
    str: `data-type="info" class="ne-alert"`,
    color: `rgba(192,221,252,0.5)`
  },
  {
    type: 'success',
    str: `data-type="success" class="ne-alert"`,
    color: `rgba(219,241,183,0.5)`
  },
  {
    type: 'warning',
    str: `data-type="warning" class="ne-alert"`,
    color: `rgba(246,225,172,0.5)`
  },
  {
    type: 'danger',
    str: `data-type="danger" class="ne-alert"`,
    color: `rgba(248,206,211,0.5)`
  },

  {
    type: 'color1',
    str: `data-type="color1" class="ne-alert"`,
    color: `rgba(181,239,242,0.5)`
  },
  {
    type: 'color2',
    str: `data-type="color2" class="ne-alert"`,
    color: `rgba(199,240,223,0.5)`
  },
  {
    type: 'color3',
    str: `data-type="color3" class="ne-alert"`,
    color: `rgba(248,214,185,0.5)`
  },
  {
    type: 'color4',
    str: `data-type="color4" class="ne-alert"`,
    color: `rgba(247,196,226,0.5)`
  },
  {
    type: 'color5',
    str: `data-type="color5" class="ne-alert"`,
    color: `rgba(217,201,248,0.5)`
  }
];

const tranPreLabel = (str) => {
  const dom = new JSDOM(str);
  const document = dom.window.document;
  const body = document.querySelector('body');
  (Array.from(body.querySelectorAll('.ne-alert')) || []).forEach((alert) => {
    const alertType = alert.getAttribute('data-type');
    const obj = HIGHLIGHT_MAP.find((_) => _.type === alertType);
    const blockquoteElement = document.createElement('blockquote');
    blockquoteElement.setAttribute('data-type', alertType);
    blockquoteElement.classList.add('ne-alert');
    blockquoteElement.style = `background-color: ${obj.color};border: 1px solid transparent;margin: 4px 0px;padding: 10px;border-radius: 4px;`;
    while (alert.firstChild) blockquoteElement.appendChild(alert.firstChild);
    alert.parentNode.replaceChild(blockquoteElement, alert);
  });

  return `

{% raw %}

${body.innerHTML}

{% endraw %}
  `;
};
