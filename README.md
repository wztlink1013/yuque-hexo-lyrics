# yuque-hexo-lyrics

[![](https://img.shields.io/github/package-json/v/wztlink1013/yuque-hexo-lyrics)](https://img.shields.io/github/package-json/v/wztlink1013/yuque-hexo-lyrics) [![](https://github.com/wztlink1013/yuque-hexo-lyrics/actions/workflows/ci.yml/badge.svg)](https://github.com/wztlink1013/yuque-hexo-lyrics/actions/workflows/ci.yml/badge.svg) [![](https://img.shields.io/npm/dt/yuque-hexo-lyrics)](https://www.npmjs.com/package/yuque-hexo-lyrics) [![](https://img.shields.io/badge/powered%20by-wztlink1013-orange)](https://github.com/wztlink1013/yuque-hexo-lyrics) [![](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

该项目为 [语雀](https://www.yuque.com/) 知识库同步工具，根据指定配置将语雀知识库文档下载到本地。该插件属于二次开发项目，因个人有较高定制化需求，故在原项目( [x-cold/yuque-hexo](https://github.com/x-cold/yuque-hexo) )的 [`1.7.0`](https://www.npmjs.com/package/yuque-hexo/v/1.7.0) 版本基础上重构代码以及需求上的二次开发。

## 目录

- [目录](#目录)
- [特性](#特性)
- [命令指南](#命令指南)
  - [Install](#install)
  - [Clean](#clean)
  - [Sync](#sync)
- [配置指南](#配置指南)
  - [TOKEN](#token)
  - [package.json](#package)
- [使用指南](#使用指南)
  - [front-matter 配置](#front-matter配置)
  - [语雀图片存在防盗链问题](#语雀图片存在防盗链问题)
  - [缓存逻辑](#缓存逻辑)
- [贡献者列表](#贡献者列表)
- [更新日志](#更新日志)
- [计划列表](#计划列表)
- [相关链接](#相关链接)

## 特性

相比原插件增加的功能：

- **支持语雀多个知识库的下载至指定文件夹**
- 支持加密文章的特殊化处理
- 无需对语雀文档内容头部添加 `front-matter` 字段，插件已做常用字段的自动映射，如下
  - 基本字段：`title`、`date`、`updated`
  - 根据语雀系统自动拉取：`urlname`、`word_count`、`secret`、`belong_book`
  - 支持语雀系统上文档的目录至 `hexo` 中的 `categories` 字段
  - 自定义（eg：`tags` 语雀文档暂无相关标签字段接口）
- 支持 `hexoMarkdown`、`hexoHtml`、`markdown` 三种 `format` 格式
- 支持缓存配置
- 支持多种过滤文章字段配置，详见下面配置表

## 命令指南

### Install

```bash
npm i yuque-hexo-lyrics -g
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

### package

`package.json`

```json
{
  "yuqueConfig": {
    "repos": [
      {
        "login": "wztlink1013",
        "repo": "blog",
        "postPath": "source/blob/",
        "mdNameFormat": "slug",
        "adapter": "hexoHtml",
        "filterLastTimeAfter": "2021-05-01",
        "filterSlugs": ["c47f3d9a749fd0229277f9e9604e69a2"],
        "filterSlugPrefix": "temp_",
        "filterCates": ["Node"],
        "forceDownloadSecret": true,
        "assignSlugs": ["fasdfasdfasfsf"]
      }
    ]
  }
}
```

| 一级字段 | 二级字段 | 默认值 | 描述 |
| --- | --- | --- | --- |
| cache | path | 无 | 缓存文件名，默认不开启缓存（缓存依据是根据文章的标题和更新时间是否一致来做的） |
| repos | baseUrl | https://www.yuque.com/api/v2/ | 语雀 API 地址 |
|  | login | - | 语雀 login (group), 也称为个人路径 |
|  | repo | - | 语雀仓库短名称，也称为语雀知识库路径 |
|  | postPath | source/yuque | 文档同步后生成的路径 |
|  | mdNameFormat | title | 文件名命名方式 (title / slug) |
|  | onlyPublished | false | 只展示已经发布的文章 |
|  | onlyPublic | false | 只展示公开文章 |
|  | adapter | hexoMarkdown | 文档生成格式 (hexoMarkdown/hexoHtml/markdown) |
|  | timeout | 200s | 超时时间 |
|  | concurrency | 5 | 下载文章并发数 |
|  | filterLastTimeAfter | '' | 指定日期后创建的文章不下载(YYYY-MM-DD) |
|  | filterSlugs | [] | 过滤文章指定 slug |
|  | filterSlugPrefix | '' | 按照文章 slug 前缀过滤 |
|  | filterCates | [] | 过滤指定分类下的文章 |
|  | forceDownloadSecret | false | 强制下载加密文章 |
|  | assignSlugs | [] | 指定 slug 不被过滤 优先级高于过滤相关(filter 开头/only 开头)的配置字段 |

> slug 是语雀的永久链接名，是几个随机字母和数字的混合字符串。

## 使用指南

### front-matter 配置

- 插件会自动拉取[大多数 Hexo 字段](#特性)，使得在语雀中写文章不用每次在头部都需要手动写 `front-matter`，部分字段后续还会扩充

### 语雀图片存在防盗链问题

[https://github.com/wztlink1013/yuque-hexo-lyrics/discussions/10](https://github.com/wztlink1013/yuque-hexo-lyrics/discussions/10)

### 缓存逻辑

去除原插件的本地缓存文件相关配置，因为当知识库文档数过大，本地缓存 json 文件过大。故改用新一种缓存策略，通过对文件判断更新日期、标题、本地存在与否在进行是否重新下载操作

## 贡献者列表

[contributors](https://github.com/wztlink1013/yuque-hexo-lyrics/graphs/contributors)

## 更新日志

[CHANGELOG.md](./CHANGELOG.md)

## 计划列表

[https://github.com/wztlink1013/yuque-hexo-lyrics/projects/1](https://github.com/wztlink1013/yuque-hexo-lyrics/projects/1)

## 相关链接

- [https://github.com/x-cold/yuque-hexo](https://github.com/x-cold/yuque-hexo)
- [同站点防盗链图片和百度统计 Referer 不一致的解决方案 | 尼采般地抒情](https://www.wztlink1013.com/blog/ugwagn/)
