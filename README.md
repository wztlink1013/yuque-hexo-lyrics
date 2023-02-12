# yuque-hexo-lyrics

[![](https://img.shields.io/github/package-json/v/wztlink1013/yuque-hexo-lyrics)](https://img.shields.io/github/package-json/v/wztlink1013/yuque-hexo-lyrics) [![](https://github.com/wztlink1013/yuque-hexo-lyrics/actions/workflows/ci.yml/badge.svg)](https://github.com/wztlink1013/yuque-hexo-lyrics/actions/workflows/ci.yml/badge.svg) [![](https://img.shields.io/npm/dt/yuque-hexo-lyrics)](https://www.npmjs.com/package/yuque-hexo-lyrics) [![](https://img.shields.io/badge/powered%20by-wztlink1013-orange)](https://github.com/wztlink1013/yuque-hexo-lyrics) [![](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

该项目为 [语雀](https://www.yuque.com/) 知识库同步工具，根据指定配置将语雀知识库文档下载到本地。该插件属于二次开发项目，因个人有较高定制化需求，故在原项目( [x-cold/yuque-hexo](https://github.com/x-cold/yuque-hexo) )的 [`1.7.0`](https://www.npmjs.com/package/yuque-hexo/v/1.7.0) 版本基础上重构代码以及需求上的二次开发。

## 目录

- [目录](#目录)
- [特性](#特性)
- [命令指南](#命令指南)
  - [Install](#Install)
  - [Clean](#Clean)
  - [Sync](#Sync)
  - [Scripts](#Scripts)
- [配置指南](#配置指南)
  - [TOKEN](#TOKEN)
  - [package.json](#package.json)
- [使用指南](#使用指南)
  - [从语雀所拉取的文章](#从语雀所拉取的文章)
  - [front-matter 配置](#front-matter配置)
  - [图片无法加载](#图片无法加载)
- [贡献者列表](#贡献者列表)
- [更新日志](#更新日志)
- [计划列表](#计划列表)
- [相关链接](#相关链接)

## 特性

相比原插件增加的功能：

- 支持语雀多个知识库的下载至指定文件夹
- 支持语雀系统上文档的目录至 `hexo` 中的 `categories` 字段
- 支持加密文章的特殊化处理
- 支持自定义`front-matter`：`urlname`、`word_count`、`secret`、`belong_book` 等
- 支持 `hexoMarkdown` `hexoHtml` `markdown` 三种 `format` 格式

## 命令指南

### Install

```bash
npm i -g yuque-hexo-lyrics
```

### Clean

```bash
yuque-hexo-lyrics clean
```

### Sync

```bash
yuque-hexo-lyrics sync
```

## 配置指南

### TOKEN

拉取语雀上的知识库需要传入环境变量 `YUQUE_TOKEN`，传入 `YUQUE_TOKEN` 至本地有以下步骤：

- 语雀 Token 获取方式：https://www.yuque.com/settings/tokens
- 设置全局的环境变量 YUQUE_TOKEN
  - 方式一：命令执行时传入环境变量
    - mac / linux: `YUQUE_TOKEN=xxx yuque-hexo-lyrics sync`
    - windows: `set YUQUE_TOKEN=xxx && yuque-hexo-lyrics sync`
  - 方式二：直接在系统环境变量中设置

### package.json

```json
{
  ···
  "yuqueConfig":[
    {
      "login": "wztlink1013",
      "repo": "qg9o6s",
      "postPath": "source/qg9o6s/",
      "mdNameFormat": "slug",
      "adapter": "hexoMarkdown"
    },
    {
      "login": "wztlink1013",
      "repo": "mr43k6",
      "postPath": "source/mr43k6/",
      "mdNameFormat": "title",
      "adapter": "markdown"
    }
  ]

}
```

| 参数名 | 含义 | 默认值 |
| --- | --- | --- |
| baseUrl | 语雀 API 地址 | https://www.yuque.com/api/v2/ |
| login | 语雀 login (group), 也称为个人路径 | - |
| repo | 语雀仓库短名称，也称为语雀知识库路径 | - |
| postPath | 文档同步后生成的路径 | source/yuque |
| mdNameFormat | 文件名命名方式 (title / slug) | title |
| onlyPublished | 只展示已经发布的文章 | false |
| onlyPublic | 只展示公开文章 | false |
| adapter | 文档生成格式 (hexoMarkdown/hexoHtml/markdown) | hexoMarkdown |
| timeout | 超时时间 | 200s |
| concurrency | 下载文章并发数 | 5 |

> - slug 是语雀的永久链接名，是几个随机字母和数字的混合字符串。
> - **去除原插件的本地缓存文件相关配置，因为当知识库文档数过大，本地缓存 json 文件过大。**

## 使用指南

### front-matter 配置

- 支持配置 `Hexo` 博客系统的 `front-matter`，语雀编辑器编写示例如下:
- 语雀编辑器内容示例

```
---
tags: [hexo, blog]
categories: [nodejs]
---

article description

<!-- more -->

article detail
```

### 语雀图片存在防盗链问题

[https://github.com/wztlink1013/yuque-hexo-lyrics/discussions/10](https://github.com/wztlink1013/yuque-hexo-lyrics/discussions/10)

## 贡献者列表

[contributors](https://github.com/wztlink1013/yuque-hexo-lyrics/graphs/contributors)

## 更新日志

[CHANGELOG.md](./CHANGELOG.md)

## 计划列表

[TODO.md](./TODO.md)

## 相关链接

- [https://github.com/x-cold/yuque-hexo](https://github.com/x-cold/yuque-hexo)
- [同站点防盗链图片和百度统计 Referer 不一致的解决方案 | 尼采般地抒情](https://www.wztlink1013.com/blog/ugwagn/)
