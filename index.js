'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));

// {'c': 'http://yoursite/c/'}
const _store = Object.create(null)

// {'c' : [fn, ...]}
const _watcher = Object.create(null)

var _flush = (name) => {
  var link = _store[name]
  var queue = _watcher[name]

  if (link && queue) {
    queue.forEach(fn => fn(link))
    delete _watcher[name]
  }
}

function wait(name, fn) {
  _watcher[name] || (_watcher[name] = []).push(fn)
}

function add(name, link) {
  _store[name] = link
  _flush(name)
}

function get(name) {
  return _store[name]
}

function getWatchingNames () {
  return Object.keys(_watcher)
}

// 本地文章文件名没有空格
const POST_LINK_REG = /(file:\/\/(.+?))((:?\s+)?[\s\)])/g

var processContent = (data) => {
  var link
  data.content = data.content.replace(POST_LINK_REG, function(match, str, name, tail) {
    link = get(name)
    if (link) {
      return (link + tail)
    }
    wait(name, (link) => {
      data.content = data.content.replace('file://' + name, link)
    })
    return match
  })
}

function process(data) {
  // 只对本地文章处理
  if (data.layout === 'post') {
    add(path.basename(data.full_source), data.permalink)
    processContent(data)
  }
}

function verifyComplete() {
  var names = getWatchingNames()
  if (names.length) {
    console.log('file:// 匹配不到下列文章：' + names.join(', '))
  }
}

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