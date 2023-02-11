# yuque-hexo-lyrics

[![](https://img.shields.io/github/package-json/v/wztlink1013/yuque-hexo-lyrics)](https://img.shields.io/github/package-json/v/wztlink1013/yuque-hexo-lyrics) [![](https://github.com/wztlink1013/yuque-hexo-lyrics/actions/workflows/ci.yml/badge.svg)](https://github.com/wztlink1013/yuque-hexo-lyrics/actions/workflows/ci.yml/badge.svg) [![](https://img.shields.io/npm/dt/yuque-hexo-lyrics)](https://www.npmjs.com/package/yuque-hexo-lyrics) [![](https://img.shields.io/badge/powered%20by-wztlink1013-orange)](https://github.com/wztlink1013/yuque-hexo-lyrics) [![](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

该项目为 [语雀](https://www.yuque.com/) 知识库同步工具，根据指定配置将语雀知识库文档下载到本地。该插件属于二次开发项目，因个人有较高定制化需求，故在原项目( [x-cold/yuque-hexo](https://github.com/x-cold/yuque-hexo) )的 [`1.7.0`](https://www.npmjs.com/package/yuque-hexo/v/1.7.0) 版本基础上重构代码以及需求上的二次开发。

## <a name=''></a>目录

<!-- vscode-markdown-toc -->

- [目录](#)
- [特性](#-1)
- [命令指南](#-1)
  - [Install](#Install)
  - [Clean](#Clean)
  - [Sync](#Sync)
  - [Npm Scripts](#NpmScripts)
- [配置指南](#-1)
  - [配置 TOKEN](#TOKEN)
  - [配置 package.json](#package.json)
- [使用指南](#-1)
  - [从语雀所拉取的文章](#-1)
  - [front-matter 配置](#front-matter)
  - [图片无法加载](#-1)
- [贡献者列表](#-1)
- [更新日志](#-1)
- [计划列表](#-1)
- [相关链接](#-1)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='-1'></a>特性

相比原插件增加的功能：

- 支持语雀多个知识库的下载至指定文件夹
- 支持自动将语雀文档所在的目录写至每篇 `markdown` 文档的 `categories` 字段，Hexo 博客无需手写 `categories` 字段
- 优化加密文章的优化展示效果、支持字数统计

## <a name='-1'></a>命令指南

### <a name='Install'></a>Install

```bash
npm i -g yuque-hexo-lyrics
```

### <a name='Clean'></a>Clean

```
yuque-hexo-lyrics clean
```

### <a name='Sync'></a>Sync

```
yuque-hexo-lyrics sync
```

### <a name='NpmScripts'></a>Npm Scripts

```json
{
  "sync": "yuque-hexo-lyrics sync",
  "clean:yuque": "yuque-hexo-lyrics clean"
}
```

## <a name='-1'></a>配置指南

### <a name='TOKEN'></a>配置 TOKEN

拉取语雀上的知识库需要传入环境变量 `YUQUE_TOKEN`，传入 `YUQUE_TOKEN` 至本地有以下步骤：

- 语雀 Token 获取方式：https://www.yuque.com/settings/tokens
- 设置全局的环境变量 YUQUE_TOKEN
  - 方式一：命令执行时传入环境变量
    - mac / linux: `YUQUE_TOKEN=xxx yuque-hexo sync`
    - windows: `set YUQUE_TOKEN=xxx && yuque-hexo sync`
  - 方式二：直接在系统环境变量中设置

### <a name='package.json'></a>配置 package.json

- 插件可同时配置多个知识库下载至本地位置
- 前缀必须由 `yuqueConfig_` 开头

```json
{
  ···
  "yuqueConfig_dsal": {
    "baseUrl": "https://www.yuque.com/api/v2",
    "login": "username_url",
    "repo": "repo_1",
    "postPath": "source/repo_1",
    "cachePath": "yuque_repo_1.json",
    "mdNameFormat": "slug",
    "onlyPublished": false,
    "onlyPublic": true,
    "adapter": "hexo",
    "timeout": "100s"
  },
  "yuqueConfig_essay": {
    "baseUrl": "https://www.yuque.com/api/v2",
    "login": "username_url",
    "repo": "repo_2",
    "postPath": "source/repo_2/",
    "cachePath": "yuque_repo_2.json",
    "mdNameFormat": "slug",
    "onlyPublished": false,
    "onlyPublic": false,
    "adapter": "html",
    "timeout": "200s"
  }
}
```

| 参数名           | 含义                                 | 默认值            |
| ---------------- | ------------------------------------ | ----------------- |
| baseUrl          | 语雀 API 地址                        | -                 |
| login            | 语雀 login (group), 也称为个人路径   | -                 |
| repo             | 语雀仓库短名称，也称为语雀知识库路径 | -                 |
| postPath         | 文档同步后生成的路径                 | source/repo_1     |
| cachePath        | 文档下载缓存文件                     | yuque_repo_1.json |
| mdNameFormat     | 文件名命名方式 (title / slug)        | title             |
| onlyPublished    | 只展示已经发布的文章                 | false             |
| onlyPublic       | 只展示公开文章                       | false             |
| adapter          | 文档生成格式 (hexo/markdown)         | hexo              |
| timeout          | YuqueClientSDK 超时时间              | 5s                |
| lastGeneratePath | 上一次同步结束的时间戳               | -                 |
| concurrency      | 下载文章并发数                       | 5                 |

> slug 是语雀的永久链接名，一般是几个随机字母。

## <a name='-1'></a>使用指南

### <a name='-1'></a>从语雀所拉取的文章

语雀同步过来的文章会生成两部分文件；

- yuque_repo_1.json: 从语雀 API 拉取的数据，供缓存使用(不建议使用，影响 git 仓库大小)
- source/\_posts/repo_1/\*.md: 语雀知识库文章对应生成的 `markdown` 文件

### <a name='front-matter'></a>front-matter 配置

- 支持配置 `hexo` 博客系统的 `front-matter`, 语雀编辑器编写示例如下:
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

### <a name='-1'></a>图片无法加载

[https://github.com/wztlink1013/yuque-hexo-lyrics/discussions/10](https://github.com/wztlink1013/yuque-hexo-lyrics/discussions/10)

## <a name='-1'></a>贡献者列表

[contributors](https://github.com/wztlink1013/yuque-hexo-lyrics/graphs/contributors)

## <a name='-1'></a>更新日志

[CHANGELOG.md](./CHANGELOG.md)

## <a name='-1'></a>计划列表

[TODO.md](./TODO.md)

## <a name='-1'></a>相关链接

- [https://github.com/x-cold/yuque-hexo](https://github.com/x-cold/yuque-hexo)
- [同站点防盗链图片和百度统计 Referer 不一致的解决方案 | 尼采般地抒情](https://www.wztlink1013.com/blog/ugwagn/)
