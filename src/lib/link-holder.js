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

export function wait(name, fn) {
  _watcher[name] || (_watcher[name] = []).push(fn)
}

export function add(name, link) {
  _store[name] = link
  _flush(name)
}

export function get(name) {
  return _store[name]
}

export function getWatchingNames () {
  return Object.keys(_watcher)
}
