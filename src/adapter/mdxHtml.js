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
    tags: postTags,
    cover,
    user,
    description
    // public: published
  } = post;

  const { forceDownloadSecret } = repoConfig;

  const _tags = (postTags || []).map((item) => item.title);
  const tags = '[' + _tags.map((item) => `"${item}"`).join(',') + ']';
  const categories =
    '[' + (tocInfo[urlname] || []).map((item) => `"${item}"`).join(',') + ']';
  return `---
title: "${title.replace(/"/g, '') || 'title'}"
date: ${formatDate(created_at)}
image: "${cover || ''}"
authorName: "${user.name}"
authorImage: "${user.avatar_url}"
excerpt: "${description}"
tags: ${tags}
published: true
urlname: ${urlname}
updated: ${formatDate(updated_at)}
categories: ${categories}
word_count: ${word_count || 0}
secret: ${secret || 0}
belong_book: "${book.slug || ''}"
---

${
  Number(secret) === 0 && !forceDownloadSecret
    ? `<div class="yuque-hexo-lyrics-secret">这是加密文章！</div>`
    : tranPreLabel(body_html)
}

  `;
};

// 高亮块
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

  // return body.innerHTML;
  // return `<YuqueContentBlock>{String(${`${body.innerHTML}`})}<YuqueContentBlock/>`;
  // return `<YuqueContentBlock rawHtml={\`${body.innerHTML}\`} />`;
  return `<YuqueContentBlock rawHtml={\`${str.replaceAll('`', '\\`')}\`} />`;
};
