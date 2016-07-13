import {
  process,
  verifyComplete
} from './lib/api'

/*
假设 a.md 和 b.md 都有中有 对 c.md 的引用

// a.md
- [page-c](file://c)

在 渲染前（before_post_render）对文章中的 `file://xx` 替换为发布后链接

`before_post_render` 事件中，a.md 如果先于 c.md，那么处理 a.md
时，c.md 的链接是拿不到的，所以把待替换的 `data` 放到异步队列，
在 c.md 的 `before_post_render` 触发时 flush 异步队列
 */

hexo.extend.filter.register('before_post_render', process)

hexo.extend.filter.register('after_generate', verifyComplete)
