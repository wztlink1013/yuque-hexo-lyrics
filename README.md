## 一、插件初衷

- A downloader for articles from yuque（语雀知识库同步工具）
- 原项目地址为[https://github.com/x-cold/yuque-hexo](https://github.com/x-cold/yuque-hexo)，因需求不同，故在原项目基础上改进从而服务于本人个人网站

相比原插件增加的功能：
- 解决下载多文档知识库超时的bug
- 支持多知识库共同下载
- hexo博客无需手写categories字段
- 优化加密文章的优化展示效果、支持字数统计……
- ……

## 二、使用
- 建议使用 Node.js >= 12 
- 事先拥有一个 [hexo](https://github.com/hexojs/hexo) 项目，并在 `package.json` 中配置相关信息，可参考 [例子](#Example)。

## 三、配置
### 配置TOKEN
出于对知识库安全性的调整，使用第三方 API 访问知识库，需要传入环境变量 YUQUE_TOKEN，在语雀上点击 个人头像 -> 设置 -> Token 即可获取。传入 YUQUE_TOKEN 到 yuque-hexo 的进程有两种方式：

- 设置全局的环境变量 YUQUE_TOKEN
- 命令执行时传入环境变量
  - mac / linux: `YUQUE_TOKEN=xxx yuque-hexo sync`
  - windows: `set YUQUE_TOKEN=xxx && yuque-hexo sync`

### 配置Hexo

> package.json

```json
{
  "yuqueConfig_dsal": {
    "baseUrl": "https://www.yuque.com/api/v2",
    "login": "nicaibandishuqing",
    "repo": "dsal",
    "postPath": "src/_posts/dsal",
    "cachePath": "yuque_dsal.json",
    "mdNameFormat": "slug",
    "onlyPublished": false,
    "onlyPublic": true,
    "adapter": "hexo",
    "timeout": "100s"
  }
}
```

| 参数名        | 含义                                 | 默认值               |
| ------------- | ------------------------------------ | -------------------- |
| postPath      | 文档同步后生成的路径                 | source/\_posts/yuque |
| cachePath     | 文档下载缓存文件                     | yuque.json           |
| lastGeneratePath | 上一次同步结束的时间戳             |                       |
| mdNameFormat  | 文件名命名方式 (title / slug)        | title                |
| adapter       | 文档生成格式 (hexo/markdown)         | hexo                 |
| concurrency   | 下载文章并发数                       | 5                    |
| baseUrl       | 语雀 API 地址                        | -                    |
| login         | 语雀 login (group), 也称为个人路径   | -                    |
| repo          | 语雀仓库短名称，也称为语雀知识库路径 | -                    |
| onlyPublished | 只展示已经发布的文章                 | false                |
| onlyPublic    | 只展示公开文章                       | false                |
| timeout       | YuqueClientSDK超时时间                       | 5s                |

> slug 是语雀的永久链接名，一般是几个随机字母。

## 四、使用

```bash
npm i -g yuque-hexo-lyrics
# or
npm i --save-dev yuque-hexo-lyrics
```

### Sync

```
yuque-hexo-lyrics sync
```

### Clean

```
yuque-hexo-lyrics clean
```

### Npm Scripts

```json
{
  "sync": "yuque-hexo-lyrics sync",
  "clean:yuque": "yuque-hexo-lyrics clean"
}
```

### Debug

```
DEBUG=yuque-hexo-lyrics.* yuque-hexo-lyrics sync
```


## 五、注意
### 生成文章
语雀同步过来的文章会生成两部分文件；
- yuque_dsal.json: 从语雀 API 拉取的数据
- source/\_posts/dsal/\*.md: 生成的 md 文件
### front-matter配置
- 支持配置 front-matter, 语雀编辑器编写示例如下:
- 语雀编辑器示例

```markdown
---
tags: [hexo, node]
categories: [fe]

---

article description

<!-- more -->

article detail
```
### 图片无法加载
- 如果遇到上传到语雀的图片无法加载的问题，可以参考这个处理方式 [#41](https://github.com/x-cold/yuque-hexo/issues/41)


## 六、更新日志

### v1.0.8
- 🧙‍♂️ 单独下载dsal知识库的所有markdown文章

> v1.8.0

- 🔥 支持配置timeout，解决文章过多sync可能导致的超时问题

> v1.7.0

- 🔥 支持配置 lastGeneratePath，同步文章后会记录一个时间戳，下一次同步文档时不再清空全部文档，只同步修改时间大于这个时间戳的文档
- 🔥 支持语雀提示区块语法
- 🐸 修复 front-matter 中 “:” 等特殊字符会导致文章无法正常生成
- 🐸 由于 [prettier 不再支持 Node 8](https://github.com/prettier/eslint-config-prettier/issues/140)，markdown 格式化仅在 node 版本 >= 10 生效
- 🐸 现在必须配置 YUQUE_TOKEN 工具才能正常工作

> v1.6.5

- 🔥 支持过滤 public 文章
- 🔥 生成的 markdown 自动格式化
- 🔥 移除去除语雀的锚点

> v1.6.4

- 🐸 修复多行 <br /> 的[问题](https://github.com/x-cold/yuque-hexo/pull/59)

> v1.6.3

- 🔥 支持嵌套的 categories 解析 #56
- 🐸 使用 [filenamify](https://github.com/sindresorhus/filenamify) 修复因为特殊字符的标题，生成非法的文件名导致的程序错误

> v1.6.2

- 🔥 使用 slug 自定义 [urlname](https://github.com/x-cold/yuque-hexo/pull/37)

> v1.6.1

- 🐸 修复 tags 格式化[问题](https://github.com/x-cold/yuque-hexo/issues/31)

> v1.6.0

- 🐸 修复 descrption 导致的 front-matter 解析错误[问题](https://github.com/x-cold/yuque-hexo/issues/27#issuecomment-490138318)
- 🔥 支持私有仓库同步
- 🔥 使用语雀官方的 SDK，支持 YUQUE_TOKEN，可以解除 API 调用次数限制

> v1.5.0

- 支持自定义 front-matter

> v1.4.3

- 支持过滤未发布文章 `onlyPublished`

> v1.4.2

- 支持纯 markdown 导出
- 支持请求并发数量参数 `concurrency`

> v1.4.0

- 升级项目架构，增强扩展性，支持自定义 adpter

> v1.3.1

- 修复 front-matter 处理格式问题

> v1.2.1

- 修复 windows 环境下命令行报错的问题
- 支持自定义文件夹和博客文件命名

> v1.1.1

- 支持 hexo-front-matter，可以在文章中编辑 tags / date 等属性
