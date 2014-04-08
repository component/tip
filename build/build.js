
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-bind/index.js", Function("exports, require, module",
"/**\n\
 * Slice reference.\n\
 */\n\
\n\
var slice = [].slice;\n\
\n\
/**\n\
 * Bind `obj` to `fn`.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function|String} fn or string\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn){\n\
  if ('string' == typeof fn) fn = obj[fn];\n\
  if ('function' != typeof fn) throw new Error('bind() requires a function');\n\
  var args = slice.call(arguments, 2);\n\
  return function(){\n\
    return fn.apply(obj, args.concat(slice.call(arguments)));\n\
  }\n\
};\n\
//@ sourceURL=component-bind/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"\n\
function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
};\n\
//@ sourceURL=component-query/index.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var query = require('query');\n\
\n\
/**\n\
 * Element prototype.\n\
 */\n\
\n\
var proto = Element.prototype;\n\
\n\
/**\n\
 * Vendor function.\n\
 */\n\
\n\
var vendor = proto.matches\n\
  || proto.webkitMatchesSelector\n\
  || proto.mozMatchesSelector\n\
  || proto.msMatchesSelector\n\
  || proto.oMatchesSelector;\n\
\n\
/**\n\
 * Expose `match()`.\n\
 */\n\
\n\
module.exports = match;\n\
\n\
/**\n\
 * Match `el` to `selector`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function match(el, selector) {\n\
  if (vendor) return vendor.call(el, selector);\n\
  var nodes = query.all(selector, el.parentNode);\n\
  for (var i = 0; i < nodes.length; ++i) {\n\
    if (nodes[i] == el) return true;\n\
  }\n\
  return false;\n\
}\n\
//@ sourceURL=component-matches-selector/index.js"
));
require.register("discore-closest/index.js", Function("exports, require, module",
"var matches = require('matches-selector')\n\
\n\
module.exports = function (element, selector, checkYoSelf, root) {\n\
  element = checkYoSelf ? {parentNode: element} : element\n\
\n\
  root = root || document\n\
\n\
  // Make sure `element !== document` and `element != null`\n\
  // otherwise we get an illegal invocation\n\
  while ((element = element.parentNode) && element !== document) {\n\
    if (matches(element, selector))\n\
      return element\n\
    // After `matches` on the edge case that\n\
    // the selector matches the root\n\
    // (when the root is not the document)\n\
    if (element === root)\n\
      return  \n\
  }\n\
}//@ sourceURL=discore-closest/index.js"
));
require.register("component-delegate/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var closest = require('closest')\n\
  , event = require('event');\n\
\n\
/**\n\
 * Delegate event `type` to `selector`\n\
 * and invoke `fn(e)`. A callback function\n\
 * is returned which may be passed to `.unbind()`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, selector, type, fn, capture){\n\
  return event.bind(el, type, function(e){\n\
    var target = e.target || e.srcElement;\n\
    e.delegateTarget = closest(target, selector, true, el);\n\
    if (e.delegateTarget) fn.call(el, e);\n\
  }, capture);\n\
};\n\
\n\
/**\n\
 * Unbind event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  event.unbind(el, type, fn, capture);\n\
};\n\
//@ sourceURL=component-delegate/index.js"
));
require.register("component-events/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var events = require('event');\n\
var delegate = require('delegate');\n\
\n\
/**\n\
 * Expose `Events`.\n\
 */\n\
\n\
module.exports = Events;\n\
\n\
/**\n\
 * Initialize an `Events` with the given\n\
 * `el` object which events will be bound to,\n\
 * and the `obj` which will receive method calls.\n\
 *\n\
 * @param {Object} el\n\
 * @param {Object} obj\n\
 * @api public\n\
 */\n\
\n\
function Events(el, obj) {\n\
  if (!(this instanceof Events)) return new Events(el, obj);\n\
  if (!el) throw new Error('element required');\n\
  if (!obj) throw new Error('object required');\n\
  this.el = el;\n\
  this.obj = obj;\n\
  this._events = {};\n\
}\n\
\n\
/**\n\
 * Subscription helper.\n\
 */\n\
\n\
Events.prototype.sub = function(event, method, cb){\n\
  this._events[event] = this._events[event] || {};\n\
  this._events[event][method] = cb;\n\
};\n\
\n\
/**\n\
 * Bind to `event` with optional `method` name.\n\
 * When `method` is undefined it becomes `event`\n\
 * with the \"on\" prefix.\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Direct event handling:\n\
 *\n\
 *    events.bind('click') // implies \"onclick\"\n\
 *    events.bind('click', 'remove')\n\
 *    events.bind('click', 'sort', 'asc')\n\
 *\n\
 *  Delegated event handling:\n\
 *\n\
 *    events.bind('click li > a')\n\
 *    events.bind('click li > a', 'remove')\n\
 *    events.bind('click a.sort-ascending', 'sort', 'asc')\n\
 *    events.bind('click a.sort-descending', 'sort', 'desc')\n\
 *\n\
 * @param {String} event\n\
 * @param {String|function} [method]\n\
 * @return {Function} callback\n\
 * @api public\n\
 */\n\
\n\
Events.prototype.bind = function(event, method){\n\
  var e = parse(event);\n\
  var el = this.el;\n\
  var obj = this.obj;\n\
  var name = e.name;\n\
  var method = method || 'on' + name;\n\
  var args = [].slice.call(arguments, 2);\n\
\n\
  // callback\n\
  function cb(){\n\
    var a = [].slice.call(arguments).concat(args);\n\
    obj[method].apply(obj, a);\n\
  }\n\
\n\
  // bind\n\
  if (e.selector) {\n\
    cb = delegate.bind(el, e.selector, name, cb);\n\
  } else {\n\
    events.bind(el, name, cb);\n\
  }\n\
\n\
  // subscription for unbinding\n\
  this.sub(name, method, cb);\n\
\n\
  return cb;\n\
};\n\
\n\
/**\n\
 * Unbind a single binding, all bindings for `event`,\n\
 * or all bindings within the manager.\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Unbind direct handlers:\n\
 *\n\
 *     events.unbind('click', 'remove')\n\
 *     events.unbind('click')\n\
 *     events.unbind()\n\
 *\n\
 * Unbind delegate handlers:\n\
 *\n\
 *     events.unbind('click', 'remove')\n\
 *     events.unbind('click')\n\
 *     events.unbind()\n\
 *\n\
 * @param {String|Function} [event]\n\
 * @param {String|Function} [method]\n\
 * @api public\n\
 */\n\
\n\
Events.prototype.unbind = function(event, method){\n\
  if (0 == arguments.length) return this.unbindAll();\n\
  if (1 == arguments.length) return this.unbindAllOf(event);\n\
\n\
  // no bindings for this event\n\
  var bindings = this._events[event];\n\
  if (!bindings) return;\n\
\n\
  // no bindings for this method\n\
  var cb = bindings[method];\n\
  if (!cb) return;\n\
\n\
  events.unbind(this.el, event, cb);\n\
};\n\
\n\
/**\n\
 * Unbind all events.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Events.prototype.unbindAll = function(){\n\
  for (var event in this._events) {\n\
    this.unbindAllOf(event);\n\
  }\n\
};\n\
\n\
/**\n\
 * Unbind all events for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @api private\n\
 */\n\
\n\
Events.prototype.unbindAllOf = function(event){\n\
  var bindings = this._events[event];\n\
  if (!bindings) return;\n\
\n\
  for (var method in bindings) {\n\
    this.unbind(event, method);\n\
  }\n\
};\n\
\n\
/**\n\
 * Parse `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function parse(event) {\n\
  var parts = event.split(/ +/);\n\
  return {\n\
    name: parts.shift(),\n\
    selector: parts.join(' ')\n\
  }\n\
}\n\
//@ sourceURL=component-events/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  option: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  thead: [1, '<table>', '</table>'],\n\
  tbody: [1, '<table>', '</table>'],\n\
  tfoot: [1, '<table>', '</table>'],\n\
  colgroup: [1, '<table>', '</table>'],\n\
  caption: [1, '<table>', '</table>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) throw new Error('No elements were generated.');\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  var els = el.children;\n\
  if (1 == els.length) {\n\
    return el.removeChild(els[0]);\n\
  }\n\
\n\
  var fragment = document.createDocumentFragment();\n\
  while (els.length) {\n\
    fragment.appendChild(el.removeChild(els[0]));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("component-props/index.js", Function("exports, require, module",
"/**\n\
 * Global Names\n\
 */\n\
\n\
var globals = /\\b(this|Array|Date|Object|Math|JSON)\\b/g;\n\
\n\
/**\n\
 * Return immediate identifiers parsed from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @param {String|Function} map function or prefix\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(str, fn){\n\
  var p = unique(props(str));\n\
  if (fn && 'string' == typeof fn) fn = prefixed(fn);\n\
  if (fn) return map(str, p, fn);\n\
  return p;\n\
};\n\
\n\
/**\n\
 * Return immediate identifiers in `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function props(str) {\n\
  return str\n\
    .replace(/\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\//g, '')\n\
    .replace(globals, '')\n\
    .match(/[$a-zA-Z_]\\w*/g)\n\
    || [];\n\
}\n\
\n\
/**\n\
 * Return `str` with `props` mapped with `fn`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Array} props\n\
 * @param {Function} fn\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function map(str, props, fn) {\n\
  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n\
  return str.replace(re, function(_){\n\
    if ('(' == _[_.length - 1]) return fn(_);\n\
    if (!~props.indexOf(_)) return _;\n\
    return fn(_);\n\
  });\n\
}\n\
\n\
/**\n\
 * Return unique array.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function unique(arr) {\n\
  var ret = [];\n\
\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (~ret.indexOf(arr[i])) continue;\n\
    ret.push(arr[i]);\n\
  }\n\
\n\
  return ret;\n\
}\n\
\n\
/**\n\
 * Map with prefix `str`.\n\
 */\n\
\n\
function prefixed(str) {\n\
  return function(_){\n\
    return str + _;\n\
  };\n\
}\n\
//@ sourceURL=component-props/index.js"
));
require.register("component-to-function/index.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var expr = require('props');\n\
\n\
/**\n\
 * Expose `toFunction()`.\n\
 */\n\
\n\
module.exports = toFunction;\n\
\n\
/**\n\
 * Convert `obj` to a `Function`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function toFunction(obj) {\n\
  switch ({}.toString.call(obj)) {\n\
    case '[object Object]':\n\
      return objectToFunction(obj);\n\
    case '[object Function]':\n\
      return obj;\n\
    case '[object String]':\n\
      return stringToFunction(obj);\n\
    case '[object RegExp]':\n\
      return regexpToFunction(obj);\n\
    default:\n\
      return defaultToFunction(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Default to strict equality.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function defaultToFunction(val) {\n\
  return function(obj){\n\
    return val === obj;\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert `re` to a function.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function regexpToFunction(re) {\n\
  return function(obj){\n\
    return re.test(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert property `str` to a function.\n\
 *\n\
 * @param {String} str\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function stringToFunction(str) {\n\
  // immediate such as \"> 20\"\n\
  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\
\n\
  // properties such as \"name.first\" or \"age > 18\" or \"age > 18 && age < 36\"\n\
  return new Function('_', 'return ' + get(str));\n\
}\n\
\n\
/**\n\
 * Convert `object` to a function.\n\
 *\n\
 * @param {Object} object\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function objectToFunction(obj) {\n\
  var match = {}\n\
  for (var key in obj) {\n\
    match[key] = typeof obj[key] === 'string'\n\
      ? defaultToFunction(obj[key])\n\
      : toFunction(obj[key])\n\
  }\n\
  return function(val){\n\
    if (typeof val !== 'object') return false;\n\
    for (var key in match) {\n\
      if (!(key in val)) return false;\n\
      if (!match[key](val[key])) return false;\n\
    }\n\
    return true;\n\
  }\n\
}\n\
\n\
/**\n\
 * Built the getter function. Supports getter style functions\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function get(str) {\n\
  var props = expr(str);\n\
  if (!props.length) return '_.' + str;\n\
\n\
  var val;\n\
  for(var i = 0, prop; prop = props[i]; i++) {\n\
    val = '_.' + prop;\n\
    val = \"('function' == typeof \" + val + \" ? \" + val + \"() : \" + val + \")\";\n\
    str = str.replace(new RegExp(prop, 'g'), val);\n\
  }\n\
\n\
  return str;\n\
}\n\
//@ sourceURL=component-to-function/index.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"\n\
/**\n\
 * toString ref.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val){\n\
  switch (toString.call(val)) {\n\
    case '[object Function]': return 'function';\n\
    case '[object Date]': return 'date';\n\
    case '[object RegExp]': return 'regexp';\n\
    case '[object Arguments]': return 'arguments';\n\
    case '[object Array]': return 'array';\n\
    case '[object String]': return 'string';\n\
  }\n\
\n\
  if (val === null) return 'null';\n\
  if (val === undefined) return 'undefined';\n\
  if (val && val.nodeType === 1) return 'element';\n\
  if (val === Object(val)) return 'object';\n\
\n\
  return typeof val;\n\
};\n\
//@ sourceURL=component-type/index.js"
));
require.register("component-each/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var type = require('type');\n\
var toFunction = require('to-function');\n\
\n\
/**\n\
 * HOP reference.\n\
 */\n\
\n\
var has = Object.prototype.hasOwnProperty;\n\
\n\
/**\n\
 * Iterate the given `obj` and invoke `fn(val, i)`\n\
 * in optional context `ctx`.\n\
 *\n\
 * @param {String|Array|Object} obj\n\
 * @param {Function} fn\n\
 * @param {Object} [ctx]\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn, ctx){\n\
  fn = toFunction(fn);\n\
  ctx = ctx || this;\n\
  switch (type(obj)) {\n\
    case 'array':\n\
      return array(obj, fn, ctx);\n\
    case 'object':\n\
      if ('number' == typeof obj.length) return array(obj, fn, ctx);\n\
      return object(obj, fn, ctx);\n\
    case 'string':\n\
      return string(obj, fn, ctx);\n\
  }\n\
};\n\
\n\
/**\n\
 * Iterate string chars.\n\
 *\n\
 * @param {String} obj\n\
 * @param {Function} fn\n\
 * @param {Object} ctx\n\
 * @api private\n\
 */\n\
\n\
function string(obj, fn, ctx) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn.call(ctx, obj.charAt(i), i);\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate object keys.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function} fn\n\
 * @param {Object} ctx\n\
 * @api private\n\
 */\n\
\n\
function object(obj, fn, ctx) {\n\
  for (var key in obj) {\n\
    if (has.call(obj, key)) {\n\
      fn.call(ctx, key, obj[key]);\n\
    }\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate array-ish.\n\
 *\n\
 * @param {Array|Object} obj\n\
 * @param {Function} fn\n\
 * @param {Object} ctx\n\
 * @api private\n\
 */\n\
\n\
function array(obj, fn, ctx) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn.call(ctx, obj[i], i);\n\
  }\n\
}\n\
//@ sourceURL=component-each/index.js"
));
require.register("visionmedia-debug/index.js", Function("exports, require, module",
"if ('undefined' == typeof window) {\n\
  module.exports = require('./lib/debug');\n\
} else {\n\
  module.exports = require('./debug');\n\
}\n\
//@ sourceURL=visionmedia-debug/index.js"
));
require.register("visionmedia-debug/debug.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `debug()` as the module.\n\
 */\n\
\n\
module.exports = debug;\n\
\n\
/**\n\
 * Create a debugger with the given `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {Type}\n\
 * @api public\n\
 */\n\
\n\
function debug(name) {\n\
  if (!debug.enabled(name)) return function(){};\n\
\n\
  return function(fmt){\n\
    fmt = coerce(fmt);\n\
\n\
    var curr = new Date;\n\
    var ms = curr - (debug[name] || curr);\n\
    debug[name] = curr;\n\
\n\
    fmt = name\n\
      + ' '\n\
      + fmt\n\
      + ' +' + debug.humanize(ms);\n\
\n\
    // This hackery is required for IE8\n\
    // where `console.log` doesn't have 'apply'\n\
    window.console\n\
      && console.log\n\
      && Function.prototype.apply.call(console.log, console, arguments);\n\
  }\n\
}\n\
\n\
/**\n\
 * The currently active debug mode names.\n\
 */\n\
\n\
debug.names = [];\n\
debug.skips = [];\n\
\n\
/**\n\
 * Enables a debug mode by name. This can include modes\n\
 * separated by a colon and wildcards.\n\
 *\n\
 * @param {String} name\n\
 * @api public\n\
 */\n\
\n\
debug.enable = function(name) {\n\
  try {\n\
    localStorage.debug = name;\n\
  } catch(e){}\n\
\n\
  var split = (name || '').split(/[\\s,]+/)\n\
    , len = split.length;\n\
\n\
  for (var i = 0; i < len; i++) {\n\
    name = split[i].replace('*', '.*?');\n\
    if (name[0] === '-') {\n\
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));\n\
    }\n\
    else {\n\
      debug.names.push(new RegExp('^' + name + '$'));\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Disable debug output.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
debug.disable = function(){\n\
  debug.enable('');\n\
};\n\
\n\
/**\n\
 * Humanize the given `ms`.\n\
 *\n\
 * @param {Number} m\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
debug.humanize = function(ms) {\n\
  var sec = 1000\n\
    , min = 60 * 1000\n\
    , hour = 60 * min;\n\
\n\
  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';\n\
  if (ms >= min) return (ms / min).toFixed(1) + 'm';\n\
  if (ms >= sec) return (ms / sec | 0) + 's';\n\
  return ms + 'ms';\n\
};\n\
\n\
/**\n\
 * Returns true if the given mode name is enabled, false otherwise.\n\
 *\n\
 * @param {String} name\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
debug.enabled = function(name) {\n\
  for (var i = 0, len = debug.skips.length; i < len; i++) {\n\
    if (debug.skips[i].test(name)) {\n\
      return false;\n\
    }\n\
  }\n\
  for (var i = 0, len = debug.names.length; i < len; i++) {\n\
    if (debug.names[i].test(name)) {\n\
      return true;\n\
    }\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Coerce `val`.\n\
 */\n\
\n\
function coerce(val) {\n\
  if (val instanceof Error) return val.stack || val.message;\n\
  return val;\n\
}\n\
\n\
// persist\n\
\n\
try {\n\
  if (window.localStorage) debug.enable(localStorage.debug);\n\
} catch(e){}\n\
//@ sourceURL=visionmedia-debug/debug.js"
));
require.register("ianstormtaylor-to-no-case/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `toNoCase`.\n\
 */\n\
\n\
module.exports = toNoCase;\n\
\n\
\n\
/**\n\
 * Test whether a string is camel-case.\n\
 */\n\
\n\
var hasSpace = /\\s/;\n\
var hasCamel = /[a-z][A-Z]/;\n\
var hasSeparator = /[\\W_]/;\n\
\n\
\n\
/**\n\
 * Remove any starting case from a `string`, like camel or snake, but keep\n\
 * spaces and punctuation that may be important otherwise.\n\
 *\n\
 * @param {String} string\n\
 * @return {String}\n\
 */\n\
\n\
function toNoCase (string) {\n\
  if (hasSpace.test(string)) return string.toLowerCase();\n\
\n\
  if (hasSeparator.test(string)) string = unseparate(string);\n\
  if (hasCamel.test(string)) string = uncamelize(string);\n\
  return string.toLowerCase();\n\
}\n\
\n\
\n\
/**\n\
 * Separator splitter.\n\
 */\n\
\n\
var separatorSplitter = /[\\W_]+(.|$)/g;\n\
\n\
\n\
/**\n\
 * Un-separate a `string`.\n\
 *\n\
 * @param {String} string\n\
 * @return {String}\n\
 */\n\
\n\
function unseparate (string) {\n\
  return string.replace(separatorSplitter, function (m, next) {\n\
    return next ? ' ' + next : '';\n\
  });\n\
}\n\
\n\
\n\
/**\n\
 * Camelcase splitter.\n\
 */\n\
\n\
var camelSplitter = /(.)([A-Z]+)/g;\n\
\n\
\n\
/**\n\
 * Un-camelcase a `string`.\n\
 *\n\
 * @param {String} string\n\
 * @return {String}\n\
 */\n\
\n\
function uncamelize (string) {\n\
  return string.replace(camelSplitter, function (m, previous, uppers) {\n\
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');\n\
  });\n\
}//@ sourceURL=ianstormtaylor-to-no-case/index.js"
));
require.register("ianstormtaylor-to-space-case/index.js", Function("exports, require, module",
"\n\
var clean = require('to-no-case');\n\
\n\
\n\
/**\n\
 * Expose `toSpaceCase`.\n\
 */\n\
\n\
module.exports = toSpaceCase;\n\
\n\
\n\
/**\n\
 * Convert a `string` to space case.\n\
 *\n\
 * @param {String} string\n\
 * @return {String}\n\
 */\n\
\n\
\n\
function toSpaceCase (string) {\n\
  return clean(string).replace(/[\\W_]+(.|$)/g, function (matches, match) {\n\
    return match ? ' ' + match : '';\n\
  });\n\
}//@ sourceURL=ianstormtaylor-to-space-case/index.js"
));
require.register("ianstormtaylor-to-camel-case/index.js", Function("exports, require, module",
"\n\
var toSpace = require('to-space-case');\n\
\n\
\n\
/**\n\
 * Expose `toCamelCase`.\n\
 */\n\
\n\
module.exports = toCamelCase;\n\
\n\
\n\
/**\n\
 * Convert a `string` to camel case.\n\
 *\n\
 * @param {String} string\n\
 * @return {String}\n\
 */\n\
\n\
\n\
function toCamelCase (string) {\n\
  return toSpace(string).replace(/\\s(\\w)/g, function (matches, letter) {\n\
    return letter.toUpperCase();\n\
  });\n\
}//@ sourceURL=ianstormtaylor-to-camel-case/index.js"
));
require.register("component-within-document/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Check if `el` is within the document.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
module.exports = function(el) {\n\
  var node = el;\n\
  while (node = node.parentNode) {\n\
    if (node == document) return true;\n\
  }\n\
  return false;\n\
};//@ sourceURL=component-within-document/index.js"
));
require.register("component-css/index.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var debug = require('debug')('css');\n\
var set = require('./lib/style');\n\
var get = require('./lib/css');\n\
\n\
/**\n\
 * Expose `css`\n\
 */\n\
\n\
module.exports = css;\n\
\n\
/**\n\
 * Get and set css values\n\
 *\n\
 * @param {Element} el\n\
 * @param {String|Object} prop\n\
 * @param {Mixed} val\n\
 * @return {Element} el\n\
 * @api public\n\
 */\n\
\n\
function css(el, prop, val) {\n\
  if (!el) return;\n\
\n\
  if (undefined !== val) {\n\
    var obj = {};\n\
    obj[prop] = val;\n\
    debug('setting styles %j', obj);\n\
    return setStyles(el, obj);\n\
  }\n\
\n\
  if ('object' == typeof prop) {\n\
    debug('setting styles %j', prop);\n\
    return setStyles(el, prop);\n\
  }\n\
\n\
  debug('getting %s', prop);\n\
  return get(el, prop);\n\
}\n\
\n\
/**\n\
 * Set the styles on an element\n\
 *\n\
 * @param {Element} el\n\
 * @param {Object} props\n\
 * @return {Element} el\n\
 */\n\
\n\
function setStyles(el, props) {\n\
  for (var prop in props) {\n\
    set(el, prop, props[prop]);\n\
  }\n\
\n\
  return el;\n\
}\n\
//@ sourceURL=component-css/index.js"
));
require.register("component-css/lib/css.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var debug = require('debug')('css:css');\n\
var camelcase = require('to-camel-case');\n\
var computed = require('./computed');\n\
var property = require('./prop');\n\
\n\
/**\n\
 * Expose `css`\n\
 */\n\
\n\
module.exports = css;\n\
\n\
/**\n\
 * CSS Normal Transforms\n\
 */\n\
\n\
var cssNormalTransform = {\n\
  letterSpacing: 0,\n\
  fontWeight: 400\n\
};\n\
\n\
/**\n\
 * Get a CSS value\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} prop\n\
 * @param {Mixed} extra\n\
 * @param {Array} styles\n\
 * @return {String}\n\
 */\n\
\n\
function css(el, prop, extra, styles) {\n\
  var hooks = require('./hooks');\n\
  var orig = camelcase(prop);\n\
  var style = el.style;\n\
  var val;\n\
\n\
  prop = property(prop, style);\n\
  var hook = hooks[prop] || hooks[orig];\n\
\n\
  // If a hook was provided get the computed value from there\n\
  if (hook && hook.get) {\n\
    debug('get hook provided. use that');\n\
    val = hook.get(el, true, extra);\n\
  }\n\
\n\
  // Otherwise, if a way to get the computed value exists, use that\n\
  if (undefined == val) {\n\
    debug('fetch the computed value of %s', prop);\n\
    val = computed(el, prop);\n\
  }\n\
\n\
  if ('normal' == val && cssNormalTransform[prop]) {\n\
    val = cssNormalTransform[prop];\n\
    debug('normal => %s', val);\n\
  }\n\
\n\
  // Return, converting to number if forced or a qualifier was provided and val looks numeric\n\
  if ('' == extra || extra) {\n\
    debug('converting value: %s into a number');\n\
    var num = parseFloat(val);\n\
    return true === extra || isNumeric(num) ? num || 0 : val;\n\
  }\n\
\n\
  return val;\n\
}\n\
\n\
/**\n\
 * Is Numeric\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Boolean}\n\
 */\n\
\n\
function isNumeric(obj) {\n\
  return !isNan(parseFloat(obj)) && isFinite(obj);\n\
}\n\
//@ sourceURL=component-css/lib/css.js"
));
require.register("component-css/lib/prop.js", Function("exports, require, module",
"/**\n\
 * Module dependencies\n\
 */\n\
\n\
var debug = require('debug')('css:prop');\n\
var camelcase = require('to-camel-case');\n\
var vendor = require('./vendor');\n\
\n\
/**\n\
 * Export `prop`\n\
 */\n\
\n\
module.exports = prop;\n\
\n\
/**\n\
 * Normalize Properties\n\
 */\n\
\n\
var cssProps = {\n\
  'float': 'cssFloat' in document.body.style ? 'cssFloat' : 'styleFloat'\n\
};\n\
\n\
/**\n\
 * Get the vendor prefixed property\n\
 *\n\
 * @param {String} prop\n\
 * @param {String} style\n\
 * @return {String} prop\n\
 * @api private\n\
 */\n\
\n\
function prop(prop, style) {\n\
  prop = cssProps[prop] || (cssProps[prop] = vendor(prop, style));\n\
  debug('transform property: %s => %s');\n\
  return prop;\n\
}\n\
//@ sourceURL=component-css/lib/prop.js"
));
require.register("component-css/lib/swap.js", Function("exports, require, module",
"/**\n\
 * Export `swap`\n\
 */\n\
\n\
module.exports = swap;\n\
\n\
/**\n\
 * Initialize `swap`\n\
 *\n\
 * @param {Element} el\n\
 * @param {Object} options\n\
 * @param {Function} fn\n\
 * @param {Array} args\n\
 * @return {Mixed}\n\
 */\n\
\n\
function swap(el, options, fn, args) {\n\
  // Remember the old values, and insert the new ones\n\
  for (var key in options) {\n\
    old[key] = el.style[key];\n\
    el.style[key] = options[key];\n\
  }\n\
\n\
  ret = fn.apply(el, args || []);\n\
\n\
  // Revert the old values\n\
  for (key in options) {\n\
    el.style[key] = old[key];\n\
  }\n\
\n\
  return ret;\n\
}\n\
//@ sourceURL=component-css/lib/swap.js"
));
require.register("component-css/lib/style.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var debug = require('debug')('css:style');\n\
var camelcase = require('to-camel-case');\n\
var support = require('./support');\n\
var property = require('./prop');\n\
var hooks = require('./hooks');\n\
\n\
/**\n\
 * Expose `style`\n\
 */\n\
\n\
module.exports = style;\n\
\n\
/**\n\
 * Possibly-unitless properties\n\
 *\n\
 * Don't automatically add 'px' to these properties\n\
 */\n\
\n\
var cssNumber = {\n\
  \"columnCount\": true,\n\
  \"fillOpacity\": true,\n\
  \"fontWeight\": true,\n\
  \"lineHeight\": true,\n\
  \"opacity\": true,\n\
  \"order\": true,\n\
  \"orphans\": true,\n\
  \"widows\": true,\n\
  \"zIndex\": true,\n\
  \"zoom\": true\n\
};\n\
\n\
/**\n\
 * Set a css value\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @param {Mixed} extra\n\
 */\n\
\n\
function style(el, prop, val, extra) {\n\
  // Don't set styles on text and comment nodes\n\
  if (!el || el.nodeType === 3 || el.nodeType === 8 || !el.style ) return;\n\
\n\
  var orig = camelcase(prop);\n\
  var style = el.style;\n\
  var type = typeof val;\n\
\n\
  if (!val) return get(el, prop, orig, extra);\n\
\n\
  prop = property(prop, style);\n\
\n\
  var hook = hooks[prop] || hooks[orig];\n\
\n\
  // If a number was passed in, add 'px' to the (except for certain CSS properties)\n\
  if ('number' == type && !cssNumber[orig]) {\n\
    debug('adding \"px\" to end of number');\n\
    val += 'px';\n\
  }\n\
\n\
  // Fixes jQuery #8908, it can be done more correctly by specifying setters in cssHooks,\n\
  // but it would mean to define eight (for every problematic property) identical functions\n\
  if (!support.clearCloneStyle && '' === val && 0 === prop.indexOf('background')) {\n\
    debug('set property (%s) value to \"inherit\"', prop);\n\
    style[prop] = 'inherit';\n\
  }\n\
\n\
  // If a hook was provided, use that value, otherwise just set the specified value\n\
  if (!hook || !hook.set || undefined !== (val = hook.set(el, val, extra))) {\n\
    // Support: Chrome, Safari\n\
    // Setting style to blank string required to delete \"style: x !important;\"\n\
    debug('set hook defined. setting property (%s) to %s', prop, val);\n\
    style[prop] = '';\n\
    style[prop] = val;\n\
  }\n\
\n\
}\n\
\n\
/**\n\
 * Get the style\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} prop\n\
 * @param {String} orig\n\
 * @param {Mixed} extra\n\
 * @return {String}\n\
 */\n\
\n\
function get(el, prop, orig, extra) {\n\
  var style = el.style;\n\
  var hook = hooks[prop] || hooks[orig];\n\
  var ret;\n\
\n\
  if (hook && hook.get && undefined !== (ret = hook.get(el, false, extra))) {\n\
    debug('get hook defined, returning: %s', ret);\n\
    return ret;\n\
  }\n\
\n\
  ret = style[prop];\n\
  debug('getting %s', ret);\n\
  return ret;\n\
}\n\
//@ sourceURL=component-css/lib/style.js"
));
require.register("component-css/lib/hooks.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var each = require('each');\n\
var css = require('./css');\n\
var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };\n\
var pnum = (/[+-]?(?:\\d*\\.|)\\d+(?:[eE][+-]?\\d+|)/).source;\n\
var rnumnonpx = new RegExp( '^(' + pnum + ')(?!px)[a-z%]+$', 'i');\n\
var rnumsplit = new RegExp( '^(' + pnum + ')(.*)$', 'i');\n\
var rdisplayswap = /^(none|table(?!-c[ea]).+)/;\n\
var styles = require('./styles');\n\
var support = require('./support');\n\
var swap = require('./swap');\n\
var computed = require('./computed');\n\
var cssExpand = [ \"Top\", \"Right\", \"Bottom\", \"Left\" ];\n\
\n\
/**\n\
 * Height & Width\n\
 */\n\
\n\
each(['width', 'height'], function(name) {\n\
  exports[name] = {};\n\
\n\
  exports[name].get = function(el, compute, extra) {\n\
    if (!compute) return;\n\
    // certain elements can have dimension info if we invisibly show them\n\
    // however, it must have a current display style that would benefit from this\n\
    return 0 == el.offsetWidth && rdisplayswap.test(css(el, 'display'))\n\
      ? swap(el, cssShow, function() { return getWidthOrHeight(el, name, extra); })\n\
      : getWidthOrHeight(el, name, extra);\n\
  }\n\
\n\
  exports[name].set = function(el, val, extra) {\n\
    var styles = extra && styles(el);\n\
    return setPositiveNumber(el, val, extra\n\
      ? augmentWidthOrHeight(el, name, extra, 'border-box' == css(el, 'boxSizing', false, styles), styles)\n\
      : 0\n\
    );\n\
  };\n\
\n\
});\n\
\n\
/**\n\
 * Opacity\n\
 */\n\
\n\
exports.opacity = {};\n\
exports.opacity.get = function(el, compute) {\n\
  if (!compute) return;\n\
  var ret = computed(el, 'opacity');\n\
  return '' == ret ? '1' : ret;\n\
}\n\
\n\
/**\n\
 * Utility: Set Positive Number\n\
 *\n\
 * @param {Element} el\n\
 * @param {Mixed} val\n\
 * @param {Number} subtract\n\
 * @return {Number}\n\
 */\n\
\n\
function setPositiveNumber(el, val, subtract) {\n\
  var matches = rnumsplit.exec(val);\n\
  return matches ?\n\
    // Guard against undefined 'subtract', e.g., when used as in cssHooks\n\
    Math.max(0, matches[1]) + (matches[2] || 'px') :\n\
    val;\n\
}\n\
\n\
/**\n\
 * Utility: Get the width or height\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} prop\n\
 * @param {Mixed} extra\n\
 * @return {String}\n\
 */\n\
\n\
function getWidthOrHeight(el, prop, extra) {\n\
  // Start with offset property, which is equivalent to the border-box value\n\
  var valueIsBorderBox = true;\n\
  var val = prop === 'width' ? el.offsetWidth : el.offsetHeight;\n\
  var styles = computed(el);\n\
  var isBorderBox = support.boxSizing && css(el, 'boxSizing') === 'border-box';\n\
\n\
  // some non-html elements return undefined for offsetWidth, so check for null/undefined\n\
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285\n\
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668\n\
  if (val <= 0 || val == null) {\n\
    // Fall back to computed then uncomputed css if necessary\n\
    val = computed(el, prop, styles);\n\
\n\
    if (val < 0 || val == null) {\n\
      val = el.style[prop];\n\
    }\n\
\n\
    // Computed unit is not pixels. Stop here and return.\n\
    if (rnumnonpx.test(val)) {\n\
      return val;\n\
    }\n\
\n\
    // we need the check for style in case a browser which returns unreliable values\n\
    // for getComputedStyle silently falls back to the reliable el.style\n\
    valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === el.style[prop]);\n\
\n\
    // Normalize ', auto, and prepare for extra\n\
    val = parseFloat(val) || 0;\n\
  }\n\
\n\
  // use the active box-sizing model to add/subtract irrelevant styles\n\
  extra = extra || (isBorderBox ? 'border' : 'content');\n\
  val += augmentWidthOrHeight(el, prop, extra, valueIsBorderBox, styles);\n\
  return val + 'px';\n\
}\n\
\n\
/**\n\
 * Utility: Augment the width or the height\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} prop\n\
 * @param {Mixed} extra\n\
 * @param {Boolean} isBorderBox\n\
 * @param {Array} styles\n\
 */\n\
\n\
function augmentWidthOrHeight(el, prop, extra, isBorderBox, styles) {\n\
  // If we already have the right measurement, avoid augmentation,\n\
  // Otherwise initialize for horizontal or vertical properties\n\
  var i = extra === (isBorderBox ? 'border' : 'content') ? 4 : 'width' == prop ? 1 : 0;\n\
  var val = 0;\n\
\n\
  for (; i < 4; i += 2) {\n\
    // both box models exclude margin, so add it if we want it\n\
    if (extra === 'margin') {\n\
      val += css(el, extra + cssExpand[i], true, styles);\n\
    }\n\
\n\
    if (isBorderBox) {\n\
      // border-box includes padding, so remove it if we want content\n\
      if (extra === 'content') {\n\
        val -= css(el, 'padding' + cssExpand[i], true, styles);\n\
      }\n\
\n\
      // at this point, extra isn't border nor margin, so remove border\n\
      if (extra !== 'margin') {\n\
        val -= css(el, 'border' + cssExpand[i] + 'Width', true, styles);\n\
      }\n\
    } else {\n\
      // at this point, extra isn't content, so add padding\n\
      val += css(el, 'padding' + cssExpand[i], true, styles);\n\
\n\
      // at this point, extra isn't content nor padding, so add border\n\
      if (extra !== 'padding') {\n\
        val += css(el, 'border' + cssExpand[i] + 'Width', true, styles);\n\
      }\n\
    }\n\
  }\n\
\n\
  return val;\n\
}\n\
//@ sourceURL=component-css/lib/hooks.js"
));
require.register("component-css/lib/styles.js", Function("exports, require, module",
"/**\n\
 * Expose `styles`\n\
 */\n\
\n\
module.exports = styles;\n\
\n\
/**\n\
 * Get all the styles\n\
 *\n\
 * @param {Element} el\n\
 * @return {Array}\n\
 */\n\
\n\
function styles(el) {\n\
  if (window.getComputedStyle) {\n\
    return el.ownerDocument.defaultView.getComputedStyle(el, null);\n\
  } else {\n\
    return el.currentStyle;\n\
  }\n\
}\n\
//@ sourceURL=component-css/lib/styles.js"
));
require.register("component-css/lib/vendor.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var prefixes = ['Webkit', 'O', 'Moz', 'ms'];\n\
\n\
/**\n\
 * Expose `vendor`\n\
 */\n\
\n\
module.exports = vendor;\n\
\n\
/**\n\
 * Get the vendor prefix for a given property\n\
 *\n\
 * @param {String} prop\n\
 * @param {Object} style\n\
 * @return {String}\n\
 */\n\
\n\
function vendor(prop, style) {\n\
  // shortcut for names that are not vendor prefixed\n\
  if (style[prop]) return prop;\n\
\n\
  // check for vendor prefixed names\n\
  var capName = prop[0].toUpperCase() + prop.slice(1);\n\
  var original = prop;\n\
  var i = prefixes.length;\n\
\n\
  while (i--) {\n\
    prop = prefixes[i] + capName;\n\
    if (prop in style) return prop;\n\
  }\n\
\n\
  return original;\n\
}\n\
//@ sourceURL=component-css/lib/vendor.js"
));
require.register("component-css/lib/support.js", Function("exports, require, module",
"/**\n\
 * Support values\n\
 */\n\
\n\
var reliableMarginRight;\n\
var boxSizingReliableVal;\n\
var pixelPositionVal;\n\
var clearCloneStyle;\n\
\n\
/**\n\
 * Container setup\n\
 */\n\
\n\
var docElem = document.documentElement;\n\
var container = document.createElement('div');\n\
var div = document.createElement('div');\n\
\n\
/**\n\
 * Clear clone style\n\
 */\n\
\n\
div.style.backgroundClip = 'content-box';\n\
div.cloneNode(true).style.backgroundClip = '';\n\
exports.clearCloneStyle = div.style.backgroundClip === 'content-box';\n\
\n\
container.style.cssText = 'border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px';\n\
container.appendChild(div);\n\
\n\
/**\n\
 * Pixel position\n\
 *\n\
 * Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084\n\
 * getComputedStyle returns percent when specified for top/left/bottom/right\n\
 * rather than make the css module depend on the offset module, we just check for it here\n\
 */\n\
\n\
exports.pixelPosition = function() {\n\
  if (undefined == pixelPositionVal) computePixelPositionAndBoxSizingReliable();\n\
  return pixelPositionVal;\n\
}\n\
\n\
/**\n\
 * Reliable box sizing\n\
 */\n\
\n\
exports.boxSizingReliable = function() {\n\
  if (undefined == boxSizingReliableVal) computePixelPositionAndBoxSizingReliable();\n\
  return boxSizingReliableVal;\n\
}\n\
\n\
/**\n\
 * Reliable margin right\n\
 *\n\
 * Support: Android 2.3\n\
 * Check if div with explicit width and no margin-right incorrectly\n\
 * gets computed margin-right based on width of container. (#3333)\n\
 * WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\
 * This support function is only executed once so no memoizing is needed.\n\
 *\n\
 * @return {Boolean}\n\
 */\n\
\n\
exports.reliableMarginRight = function() {\n\
  var ret;\n\
  var marginDiv = div.appendChild(document.createElement(\"div\" ));\n\
\n\
  marginDiv.style.cssText = div.style.cssText = divReset;\n\
  marginDiv.style.marginRight = marginDiv.style.width = \"0\";\n\
  div.style.width = \"1px\";\n\
  docElem.appendChild(container);\n\
\n\
  ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);\n\
\n\
  docElem.removeChild(container);\n\
\n\
  // Clean up the div for other support tests.\n\
  div.innerHTML = \"\";\n\
\n\
  return ret;\n\
}\n\
\n\
/**\n\
 * Executing both pixelPosition & boxSizingReliable tests require only one layout\n\
 * so they're executed at the same time to save the second computation.\n\
 */\n\
\n\
function computePixelPositionAndBoxSizingReliable() {\n\
  // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).\n\
  div.style.cssText = \"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;\" +\n\
    \"box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;\" +\n\
    \"position:absolute;top:1%\";\n\
  docElem.appendChild(container);\n\
\n\
  var divStyle = window.getComputedStyle(div, null);\n\
  pixelPositionVal = divStyle.top !== \"1%\";\n\
  boxSizingReliableVal = divStyle.width === \"4px\";\n\
\n\
  docElem.removeChild(container);\n\
}\n\
\n\
\n\
//@ sourceURL=component-css/lib/support.js"
));
require.register("component-css/lib/computed.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
\n\
var debug = require('debug')('css:computed');\n\
var withinDocument = require('within-document');\n\
var styles = require('./styles');\n\
\n\
/**\n\
 * Expose `computed`\n\
 */\n\
\n\
module.exports = computed;\n\
\n\
/**\n\
 * Get the computed style\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} prop\n\
 * @param {Array} precomputed (optional)\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function computed(el, prop, precomputed) {\n\
  var computed = precomputed || styles(el);\n\
  var ret;\n\
  \n\
  if (!computed) return;\n\
\n\
  if (computed.getPropertyValue) {\n\
    ret = computed.getPropertyValue(prop) || computed[prop];\n\
  } else {\n\
    ret = computed[prop];\n\
  }\n\
\n\
  if ('' === ret && !withinDocument(el)) {\n\
    debug('element not within document, try finding from style attribute');\n\
    var style = require('./style');\n\
    ret = style(el, prop);\n\
  }\n\
\n\
  debug('computed value of %s: %s', prop, ret);\n\
\n\
  // Support: IE\n\
  // IE returns zIndex value as an integer.\n\
  return undefined === ret ? ret : ret + '';\n\
}\n\
//@ sourceURL=component-css/lib/computed.js"
));
require.register("enyo-domready/index.js", Function("exports, require, module",
"/*!\n\
 * Copyright (c) 2012 Matias Meno <m@tias.me>\n\
 * \n\
 * Original code (c) by Dustin Diaz 2012 - License MIT\n\
 */\n\
\n\
\n\
/**\n\
 * Expose `domready`.\n\
 */\n\
\n\
module.exports = domready;\n\
\n\
\n\
/**\n\
 *\n\
 * Cross browser implementation of the domready event\n\
 *\n\
 * @param {Function} ready - the callback to be invoked as soon as the dom is fully loaded.\n\
 * @api public\n\
 */\n\
\n\
function domready(ready) {\n\
 var fns = [], fn, f = false\n\
    , doc = document\n\
    , testEl = doc.documentElement\n\
    , hack = testEl.doScroll\n\
    , domContentLoaded = 'DOMContentLoaded'\n\
    , addEventListener = 'addEventListener'\n\
    , onreadystatechange = 'onreadystatechange'\n\
    , readyState = 'readyState'\n\
    , loaded = /^loade|c/.test(doc[readyState])\n\
\n\
  function flush(f) {\n\
    loaded = 1\n\
    while (f = fns.shift()) f()\n\
  }\n\
\n\
  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {\n\
    doc.removeEventListener(domContentLoaded, fn, f)\n\
    flush()\n\
  }, f)\n\
\n\
\n\
  hack && doc.attachEvent(onreadystatechange, fn = function () {\n\
    if (/^c/.test(doc[readyState])) {\n\
      doc.detachEvent(onreadystatechange, fn)\n\
      flush()\n\
    }\n\
  })\n\
\n\
  return (ready = hack ?\n\
    function (fn) {\n\
      self != top ?\n\
        loaded ? fn() : fns.push(fn) :\n\
        function () {\n\
          try {\n\
            testEl.doScroll('left')\n\
          } catch (e) {\n\
            return setTimeout(function() { ready(fn) }, 50)\n\
          }\n\
          fn()\n\
        }()\n\
    } :\n\
    function (fn) {\n\
      loaded ? fn() : fns.push(fn)\n\
    })\n\
}//@ sourceURL=enyo-domready/index.js"
));
require.register("timoxley-dom-support/index.js", Function("exports, require, module",
"var domready = require('domready')()\n\
\n\
module.exports = (function() {\n\
\n\
\tvar support,\n\
\t\tall,\n\
\t\ta,\n\
\t\tselect,\n\
\t\topt,\n\
\t\tinput,\n\
\t\tfragment,\n\
\t\teventName,\n\
\t\ti,\n\
\t\tisSupported,\n\
\t\tclickFn,\n\
\t\tdiv = document.createElement(\"div\");\n\
\n\
\t// Setup\n\
\tdiv.setAttribute( \"className\", \"t\" );\n\
\tdiv.innerHTML = \"  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>\";\n\
\n\
\t// Support tests won't run in some limited or non-browser environments\n\
\tall = div.getElementsByTagName(\"*\");\n\
\ta = div.getElementsByTagName(\"a\")[ 0 ];\n\
\tif ( !all || !a || !all.length ) {\n\
\t\treturn {};\n\
\t}\n\
\n\
\t// First batch of tests\n\
\tselect = document.createElement(\"select\");\n\
\topt = select.appendChild( document.createElement(\"option\") );\n\
\tinput = div.getElementsByTagName(\"input\")[ 0 ];\n\
\n\
\ta.style.cssText = \"top:1px;float:left;opacity:.5\";\n\
\tsupport = {\n\
\t\t// IE strips leading whitespace when .innerHTML is used\n\
\t\tleadingWhitespace: ( div.firstChild.nodeType === 3 ),\n\
\n\
\t\t// Make sure that tbody elements aren't automatically inserted\n\
\t\t// IE will insert them into empty tables\n\
\t\ttbody: !div.getElementsByTagName(\"tbody\").length,\n\
\n\
\t\t// Make sure that link elements get serialized correctly by innerHTML\n\
\t\t// This requires a wrapper element in IE\n\
\t\thtmlSerialize: !!div.getElementsByTagName(\"link\").length,\n\
\n\
\t\t// Get the style information from getAttribute\n\
\t\t// (IE uses .cssText instead)\n\
\t\tstyle: /top/.test( a.getAttribute(\"style\") ),\n\
\n\
\t\t// Make sure that URLs aren't manipulated\n\
\t\t// (IE normalizes it by default)\n\
\t\threfNormalized: ( a.getAttribute(\"href\") === \"/a\" ),\n\
\n\
\t\t// Make sure that element opacity exists\n\
\t\t// (IE uses filter instead)\n\
\t\t// Use a regex to work around a WebKit issue. See #5145\n\
\t\topacity: /^0.5/.test( a.style.opacity ),\n\
\n\
\t\t// Verify style float existence\n\
\t\t// (IE uses styleFloat instead of cssFloat)\n\
\t\tcssFloat: !!a.style.cssFloat,\n\
\n\
\t\t// Make sure that if no value is specified for a checkbox\n\
\t\t// that it defaults to \"on\".\n\
\t\t// (WebKit defaults to \"\" instead)\n\
\t\tcheckOn: ( input.value === \"on\" ),\n\
\n\
\t\t// Make sure that a selected-by-default option has a working selected property.\n\
\t\t// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)\n\
\t\toptSelected: opt.selected,\n\
\n\
\t\t// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)\n\
\t\tgetSetAttribute: div.className !== \"t\",\n\
\n\
\t\t// Tests for enctype support on a form (#6743)\n\
\t\tenctype: !!document.createElement(\"form\").enctype,\n\
\n\
\t\t// Makes sure cloning an html5 element does not cause problems\n\
\t\t// Where outerHTML is undefined, this still works\n\
\t\thtml5Clone: document.createElement(\"nav\").cloneNode( true ).outerHTML !== \"<:nav></:nav>\",\n\
\n\
\t\t// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode\n\
\t\tboxModel: ( document.compatMode === \"CSS1Compat\" ),\n\
\n\
\t\t// Will be defined later\n\
\t\tsubmitBubbles: true,\n\
\t\tchangeBubbles: true,\n\
\t\tfocusinBubbles: false,\n\
\t\tdeleteExpando: true,\n\
\t\tnoCloneEvent: true,\n\
\t\tinlineBlockNeedsLayout: false,\n\
\t\tshrinkWrapBlocks: false,\n\
\t\treliableMarginRight: true,\n\
\t\tboxSizingReliable: true,\n\
\t\tpixelPosition: false\n\
\t};\n\
\n\
\t// Make sure checked status is properly cloned\n\
\tinput.checked = true;\n\
\tsupport.noCloneChecked = input.cloneNode( true ).checked;\n\
\n\
\t// Make sure that the options inside disabled selects aren't marked as disabled\n\
\t// (WebKit marks them as disabled)\n\
\tselect.disabled = true;\n\
\tsupport.optDisabled = !opt.disabled;\n\
\n\
\t// Test to see if it's possible to delete an expando from an element\n\
\t// Fails in Internet Explorer\n\
\ttry {\n\
\t\tdelete div.test;\n\
\t} catch( e ) {\n\
\t\tsupport.deleteExpando = false;\n\
\t}\n\
\n\
\tif ( !div.addEventListener && div.attachEvent && div.fireEvent ) {\n\
\t\tdiv.attachEvent( \"onclick\", clickFn = function() {\n\
\t\t\t// Cloning a node shouldn't copy over any\n\
\t\t\t// bound event handlers (IE does this)\n\
\t\t\tsupport.noCloneEvent = false;\n\
\t\t});\n\
\t\tdiv.cloneNode( true ).fireEvent(\"onclick\");\n\
\t\tdiv.detachEvent( \"onclick\", clickFn );\n\
\t}\n\
\n\
\t// Check if a radio maintains its value\n\
\t// after being appended to the DOM\n\
\tinput = document.createElement(\"input\");\n\
\tinput.value = \"t\";\n\
\tinput.setAttribute( \"type\", \"radio\" );\n\
\tsupport.radioValue = input.value === \"t\";\n\
\n\
\tinput.setAttribute( \"checked\", \"checked\" );\n\
\n\
\t// #11217 - WebKit loses check when the name is after the checked attribute\n\
\tinput.setAttribute( \"name\", \"t\" );\n\
\n\
\tdiv.appendChild( input );\n\
\tfragment = document.createDocumentFragment();\n\
\tfragment.appendChild( div.lastChild );\n\
\n\
\t// WebKit doesn't clone checked state correctly in fragments\n\
\tsupport.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;\n\
\n\
\t// Check if a disconnected checkbox will retain its checked\n\
\t// value of true after appended to the DOM (IE6/7)\n\
\tsupport.appendChecked = input.checked;\n\
\n\
\tfragment.removeChild( input );\n\
\tfragment.appendChild( div );\n\
\n\
\t// Technique from Juriy Zaytsev\n\
\t// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/\n\
\t// We only care about the case where non-standard event systems\n\
\t// are used, namely in IE. Short-circuiting here helps us to\n\
\t// avoid an eval call (in setAttribute) which can cause CSP\n\
\t// to go haywire. See: https://developer.mozilla.org/en/Security/CSP\n\
\tif ( !div.addEventListener ) {\n\
\t\tfor ( i in {\n\
\t\t\tsubmit: true,\n\
\t\t\tchange: true,\n\
\t\t\tfocusin: true\n\
\t\t}) {\n\
\t\t\teventName = \"on\" + i;\n\
\t\t\tisSupported = ( eventName in div );\n\
\t\t\tif ( !isSupported ) {\n\
\t\t\t\tdiv.setAttribute( eventName, \"return;\" );\n\
\t\t\t\tisSupported = ( typeof div[ eventName ] === \"function\" );\n\
\t\t\t}\n\
\t\t\tsupport[ i + \"Bubbles\" ] = isSupported;\n\
\t\t}\n\
\t}\n\
\n\
\t// Run tests that need a body at doc ready\n\
\tdomready(function() {\n\
\t\tvar container, div, tds, marginDiv,\n\
\t\t\tdivReset = \"padding:0;margin:0;border:0;display:block;overflow:hidden;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;\",\n\
\t\t\tbody = document.getElementsByTagName(\"body\")[0];\n\
\n\
\t\tif ( !body ) {\n\
\t\t\t// Return for frameset docs that don't have a body\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\tcontainer = document.createElement(\"div\");\n\
\t\tcontainer.style.cssText = \"visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px\";\n\
\t\tbody.insertBefore( container, body.firstChild );\n\
\n\
\t\t// Construct the test element\n\
\t\tdiv = document.createElement(\"div\");\n\
\t\tcontainer.appendChild( div );\n\
\n\
    //Check if table cells still have offsetWidth/Height when they are set\n\
    //to display:none and there are still other visible table cells in a\n\
    //table row; if so, offsetWidth/Height are not reliable for use when\n\
    //determining if an element has been hidden directly using\n\
    //display:none (it is still safe to use offsets if a parent element is\n\
    //hidden; don safety goggles and see bug #4512 for more information).\n\
    //(only IE 8 fails this test)\n\
\t\tdiv.innerHTML = \"<table><tr><td></td><td>t</td></tr></table>\";\n\
\t\ttds = div.getElementsByTagName(\"td\");\n\
\t\ttds[ 0 ].style.cssText = \"padding:0;margin:0;border:0;display:none\";\n\
\t\tisSupported = ( tds[ 0 ].offsetHeight === 0 );\n\
\n\
\t\ttds[ 0 ].style.display = \"\";\n\
\t\ttds[ 1 ].style.display = \"none\";\n\
\n\
\t\t// Check if empty table cells still have offsetWidth/Height\n\
\t\t// (IE <= 8 fail this test)\n\
\t\tsupport.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );\n\
\n\
\t\t// Check box-sizing and margin behavior\n\
\t\tdiv.innerHTML = \"\";\n\
\t\tdiv.style.cssText = \"box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;\";\n\
\t\tsupport.boxSizing = ( div.offsetWidth === 4 );\n\
\t\tsupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );\n\
\n\
\t\t// NOTE: To any future maintainer, we've window.getComputedStyle\n\
\t\t// because jsdom on node.js will break without it.\n\
\t\tif ( window.getComputedStyle ) {\n\
\t\t\tsupport.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== \"1%\";\n\
\t\t\tsupport.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: \"4px\" } ).width === \"4px\";\n\
\n\
\t\t\t// Check if div with explicit width and no margin-right incorrectly\n\
\t\t\t// gets computed margin-right based on width of container. For more\n\
\t\t\t// info see bug #3333\n\
\t\t\t// Fails in WebKit before Feb 2011 nightlies\n\
\t\t\t// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\
\t\t\tmarginDiv = document.createElement(\"div\");\n\
\t\t\tmarginDiv.style.cssText = div.style.cssText = divReset;\n\
\t\t\tmarginDiv.style.marginRight = marginDiv.style.width = \"0\";\n\
\t\t\tdiv.style.width = \"1px\";\n\
\t\t\tdiv.appendChild( marginDiv );\n\
\t\t\tsupport.reliableMarginRight =\n\
\t\t\t\t!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );\n\
\t\t}\n\
\n\
\t\tif ( typeof div.style.zoom !== \"undefined\" ) {\n\
\t\t\t// Check if natively block-level elements act like inline-block\n\
\t\t\t// elements when setting their display to 'inline' and giving\n\
\t\t\t// them layout\n\
\t\t\t// (IE < 8 does this)\n\
\t\t\tdiv.innerHTML = \"\";\n\
\t\t\tdiv.style.cssText = divReset + \"width:1px;padding:1px;display:inline;zoom:1\";\n\
\t\t\tsupport.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );\n\
\n\
\t\t\t// Check if elements with layout shrink-wrap their children\n\
\t\t\t// (IE 6 does this)\n\
\t\t\tdiv.style.display = \"block\";\n\
\t\t\tdiv.style.overflow = \"visible\";\n\
\t\t\tdiv.innerHTML = \"<div></div>\";\n\
\t\t\tdiv.firstChild.style.width = \"5px\";\n\
\t\t\tsupport.shrinkWrapBlocks = ( div.offsetWidth !== 3 );\n\
\n\
\t\t\tcontainer.style.zoom = 1;\n\
\t\t}\n\
\n\
\t\t// Null elements to avoid leaks in IE\n\
\t\tbody.removeChild( container );\n\
\t\tcontainer = div = tds = marginDiv = null;\n\
\t});\n\
\n\
\t// Null elements to avoid leaks in IE\n\
\tfragment.removeChild( div );\n\
\tall = a = select = opt = input = fragment = div = null;\n\
\n\
\treturn support;\n\
})();\n\
//@ sourceURL=timoxley-dom-support/index.js"
));
require.register("timoxley-offset/index.js", Function("exports, require, module",
"var support = require('dom-support')\n\
var contains = require('within-document')\n\
\n\
/**\n\
 * Get offset of an element within the viewport.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
module.exports = function offset(el) {\n\
  var doc = el && el.ownerDocument\n\
  if (!doc) return\n\
\n\
  // Make sure it's not a disconnected DOM node\n\
  if (!contains(el)) return box\n\
\n\
  var body = doc.body\n\
  if (body === el) {\n\
    return bodyOffset(el)\n\
  }\n\
\n\
  var box = { top: 0, left: 0 }\n\
  if ( typeof el.getBoundingClientRect !== \"undefined\" ) {\n\
    // If we don't have gBCR, just use 0,0 rather than error\n\
    // BlackBerry 5, iOS 3 (original iPhone)\n\
    box = el.getBoundingClientRect()\n\
  }\n\
\n\
  var docEl = doc.documentElement\n\
  var clientTop  = docEl.clientTop  || body.clientTop  || 0\n\
  var clientLeft = docEl.clientLeft || body.clientLeft || 0\n\
  var scrollTop  = window.pageYOffset || docEl.scrollTop\n\
  var scrollLeft = window.pageXOffset || docEl.scrollLeft\n\
\n\
  return {\n\
    top: box.top  + scrollTop  - clientTop,\n\
    left: box.left + scrollLeft - clientLeft\n\
  }\n\
}\n\
\n\
function bodyOffset(body) {\n\
  var top = body.offsetTop\n\
  var left = body.offsetLeft\n\
\n\
  if (support.doesNotIncludeMarginInBodyOffset) {\n\
    top  += parseFloat(body.style.marginTop || 0)\n\
    left += parseFloat(body.style.marginLeft || 0)\n\
  }\n\
\n\
  return {\n\
    top: top,\n\
    left: left\n\
  }\n\
}\n\
//@ sourceURL=timoxley-offset/index.js"
));

require.register("component-event/index.js", Function("exports, require, module",
"var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',\n\
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',\n\
    prefix = bind !== 'addEventListener' ? 'on' : '';\n\
\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  el[bind](prefix + type, fn, capture || false);\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  el[unbind](prefix + type, fn, capture || false);\n\
  return fn;\n\
};//@ sourceURL=component-event/index.js"
));
require.register("tip/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var bind = require('bind');\n\
var Emitter = require('emitter');\n\
var events = require('events');\n\
var query = require('query');\n\
var domify = require('domify');\n\
var classes = require('classes');\n\
var css = require('css');\n\
var html = domify(require('./template.html'));\n\
var offset = require('offset');\n\
\n\
/**\n\
 * Expose `Tip`.\n\
 */\n\
\n\
module.exports = Tip;\n\
\n\
/**\n\
 * Apply the average use-case of simply\n\
 * showing a tool-tip on `el` hover.\n\
 *\n\
 * Options:\n\
 *\n\
 *  - `delay` hide delay in milliseconds [0]\n\
 *  - `value` defaulting to the element's title attribute\n\
 *\n\
 * @param {Mixed} elem\n\
 * @param {Object|String} options or value\n\
 * @api public\n\
 */\n\
\n\
function tip(elem, options) {\n\
  if ('string' == typeof options) options = { value : options };\n\
  var els = ('string' == typeof elem) ? query.all(elem) : [elem];\n\
  for(var i = 0, el; el = els[i]; i++) {\n\
    var val = options.value || el.getAttribute('title');\n\
    var tip = new Tip(val, options);\n\
    el.setAttribute('title', '');\n\
    tip.cancelHideOnHover();\n\
    tip.attach(el);\n\
  }\n\
}\n\
\n\
/**\n\
 * Initialize a `Tip` with the given `content`.\n\
 *\n\
 * @param {Mixed} content\n\
 * @api public\n\
 */\n\
\n\
function Tip(content, options) {\n\
  options = options || {};\n\
  if (!(this instanceof Tip)) return tip(content, options);\n\
  Emitter.call(this);\n\
  this.classname = '';\n\
  this.delay = options.delay || 300;\n\
  this.el = html.cloneNode(true);\n\
  this.events = events(this.el, this);\n\
  this.winEvents = events(window, this);\n\
  this.classes = classes(this.el);\n\
  this.inner = query('.tip-inner', this.el);\n\
  this.message(content);\n\
  this.position('top');\n\
  if (Tip.effect) this.effect(Tip.effect);\n\
}\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(Tip.prototype);\n\
\n\
/**\n\
 * Set tip `content`.\n\
 *\n\
 * @param {String|jQuery|Element} content\n\
 * @return {Tip} self\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.message = function(content){\n\
  this.inner.innerHTML = content;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Attach to the given `el` with optional hide `delay`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Number} delay\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.attach = function(el){\n\
  var self = this;\n\
  this.target = el;\n\
  this.handleEvents = events(el, this);\n\
  this.handleEvents.bind('mouseover');\n\
  this.handleEvents.bind('mouseout');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * On mouse over\n\
 *\n\
 * @param {Event} e\n\
 * @return {Tip}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.onmouseover = function() {\n\
  this.show(this.target);\n\
  this.cancelHide();\n\
};\n\
\n\
/**\n\
 * On mouse out\n\
 *\n\
 * @param {Event} e\n\
 * @return {Tip}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.onmouseout = function() {\n\
  this.hide(this.delay);\n\
};\n\
\n\
/**\n\
 * Cancel hide on hover, hide with the given `delay`.\n\
 *\n\
 * @param {Number} delay\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.cancelHideOnHover = function(){\n\
  this.events.bind('mouseover', 'cancelHide');\n\
  this.events.bind('mouseout', 'hide');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the effect to `type`.\n\
 *\n\
 * @param {String} type\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.effect = function(type){\n\
  this._effect = type;\n\
  this.classes.add(type);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set position:\n\
 *\n\
 *  - `top`\n\
 *  - `top left`\n\
 *  - `top right`\n\
 *  - `bottom`\n\
 *  - `bottom left`\n\
 *  - `bottom right`\n\
 *  - `left`\n\
 *  - `right`\n\
 *\n\
 * @param {String} pos\n\
 * @param {Object} options\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.position = function(pos, options){\n\
  options = options || {};\n\
  this._position = pos;\n\
  this._auto = false != options.auto;\n\
  this.replaceClass(pos);\n\
  this.emit('reposition');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Show the tip attached to `el`.\n\
 *\n\
 * Emits \"show\" (el) event.\n\
 *\n\
 * @param {String|Element|Number} el or x\n\
 * @param {Number} [y]\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.show = function(el){\n\
  if ('string' == typeof el) el = query(el);\n\
\n\
  // show it\n\
  this.target = el;\n\
  document.body.appendChild(this.el);\n\
  this.classes.add('tip-' + this._position.replace(/\\s+/g, '-'));\n\
  this.classes.remove('tip-hide');\n\
\n\
  // x,y\n\
  if ('number' == typeof el) {\n\
    var x = arguments[0];\n\
    var y = arguments[1];\n\
    this.emit('show');\n\
    css(this.el, {\n\
      top: y,\n\
      left: x\n\
    });\n\
    return this;\n\
  }\n\
\n\
  // el\n\
  this.reposition();\n\
  this.emit('show', this.target);\n\
\n\
  this.winEvents.bind('resize', 'reposition');\n\
  this.winEvents.bind('scroll', 'reposition');\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Reposition the tip if necessary.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.reposition = function(){\n\
  var pos = this._position;\n\
  var off = this.offset(pos);\n\
  var newpos = this._auto && this.suggested(pos, off);\n\
  if (newpos) off = this.offset(pos = newpos);\n\
  this.replaceClass(pos);\n\
  this.emit('reposition');\n\
  css(this.el, off);\n\
};\n\
\n\
/**\n\
 * Compute the \"suggested\" position favouring `pos`.\n\
 * Returns undefined if no suggestion is made.\n\
 *\n\
 * @param {String} pos\n\
 * @param {Object} offset\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.suggested = function(pos, off){\n\
  var el = this.el;\n\
\n\
  var ew = el.clientWidth;\n\
  var eh = el.clientHeight;\n\
  var top = window.scrollY;\n\
  var left = window.scrollX;\n\
  var w = window.innerWidth;\n\
  var h = window.innerHeight;\n\
\n\
  // too low\n\
  if (off.top + eh > top + h) return 'top';\n\
\n\
  // too high\n\
  if (off.top < top) return 'bottom';\n\
\n\
  // too far to the right\n\
  if (off.left + ew > left + w) return 'left';\n\
\n\
  // too far to the left\n\
  if (off.left < left) return 'right';\n\
};\n\
\n\
/**\n\
 * Replace position class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.replaceClass = function(name){\n\
  name = name.split(' ').join('-');\n\
  var classname = this.classname + ' tip tip-' + name;\n\
  if (this._effect) classname += ' ' + this._effect;\n\
  this.el.setAttribute('class', classname);\n\
};\n\
\n\
/**\n\
 * Compute the offset for `.target`\n\
 * based on the given `pos`.\n\
 *\n\
 * @param {String} pos\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.offset = function(pos){\n\
  var pad = 15;\n\
  var el = this.el;\n\
  var target = this.target;\n\
\n\
  var ew = el.clientWidth;\n\
  var eh = el.clientHeight;\n\
\n\
  var to = offset(target);\n\
  var tw = target.offsetWidth;\n\
  var th = target.offsetHeight;\n\
\n\
  switch (pos) {\n\
    case 'top':\n\
      return {\n\
        top: to.top - eh,\n\
        left: to.left + tw / 2 - ew / 2\n\
      }\n\
    case 'bottom':\n\
      return {\n\
        top: to.top + th,\n\
        left: to.left + tw / 2 - ew / 2\n\
      }\n\
    case 'right':\n\
      return {\n\
        top: to.top + th / 2 - eh / 2,\n\
        left: to.left + tw\n\
      }\n\
    case 'left':\n\
      return {\n\
        top: to.top + th / 2 - eh / 2,\n\
        left: to.left - ew\n\
      }\n\
    case 'top left':\n\
      return {\n\
        top: to.top - eh,\n\
        left: to.left + tw / 2 - ew + pad\n\
      }\n\
    case 'top right':\n\
      return {\n\
        top: to.top - eh,\n\
        left: to.left + tw / 2 - pad\n\
      }\n\
    case 'bottom left':\n\
      return {\n\
        top: to.top + th,\n\
        left: to.left + tw / 2 - ew + pad\n\
      }\n\
    case 'bottom right':\n\
      return {\n\
        top: to.top + th,\n\
        left: to.left + tw / 2 - pad\n\
      }\n\
    default:\n\
      throw new Error('invalid position \"' + pos + '\"');\n\
  }\n\
};\n\
\n\
/**\n\
 * Cancel the `.hide()` timeout.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.cancelHide = function(){\n\
  clearTimeout(this._hide);\n\
};\n\
\n\
/**\n\
 * Hide the tip with optional `ms` delay.\n\
 *\n\
 * Emits \"hide\" event.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.hide = function(ms){\n\
  var self = this;\n\
\n\
  // duration\n\
  if (ms) {\n\
    this._hide = setTimeout(bind(this, this.hide), ms);\n\
    return this;\n\
  }\n\
\n\
  // hide\n\
  this.classes.add('tip-hide');\n\
  if (this._effect) {\n\
    setTimeout(bind(this, this.remove), 300);\n\
  } else {\n\
    self.remove();\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Hide the tip without potential animation.\n\
 *\n\
 * @return {Tip}\n\
 * @api\n\
 */\n\
\n\
Tip.prototype.remove = function(){\n\
  this.winEvents.unbind('resize', 'reposition');\n\
  this.winEvents.unbind('scroll', 'reposition');\n\
  this.emit('hide');\n\
\n\
  var parent = this.el.parentNode;\n\
  if (parent) parent.removeChild(this.el);\n\
  return this;\n\
};\n\
//@ sourceURL=tip/index.js"
));




























require.register("tip/template.html", Function("exports, require, module",
"module.exports = '<div class=\"tip tip-hide\">\\n\
  <div class=\"tip-arrow\"></div>\\n\
  <div class=\"tip-inner\"></div>\\n\
</div>';//@ sourceURL=tip/template.html"
));
require.alias("component-bind/index.js", "tip/deps/bind/index.js");
require.alias("component-bind/index.js", "bind/index.js");

require.alias("component-emitter/index.js", "tip/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-query/index.js", "tip/deps/query/index.js");
require.alias("component-query/index.js", "query/index.js");

require.alias("component-events/index.js", "tip/deps/events/index.js");
require.alias("component-events/index.js", "events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-domify/index.js", "tip/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("component-classes/index.js", "tip/deps/classes/index.js");
require.alias("component-classes/index.js", "classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "tip/deps/css/index.js");
require.alias("component-css/lib/css.js", "tip/deps/css/lib/css.js");
require.alias("component-css/lib/prop.js", "tip/deps/css/lib/prop.js");
require.alias("component-css/lib/swap.js", "tip/deps/css/lib/swap.js");
require.alias("component-css/lib/style.js", "tip/deps/css/lib/style.js");
require.alias("component-css/lib/hooks.js", "tip/deps/css/lib/hooks.js");
require.alias("component-css/lib/styles.js", "tip/deps/css/lib/styles.js");
require.alias("component-css/lib/vendor.js", "tip/deps/css/lib/vendor.js");
require.alias("component-css/lib/support.js", "tip/deps/css/lib/support.js");
require.alias("component-css/lib/computed.js", "tip/deps/css/lib/computed.js");
require.alias("component-css/index.js", "tip/deps/css/index.js");
require.alias("component-css/index.js", "css/index.js");
require.alias("component-each/index.js", "component-css/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("visionmedia-debug/index.js", "component-css/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-css/deps/debug/debug.js");

require.alias("ianstormtaylor-to-camel-case/index.js", "component-css/deps/to-camel-case/index.js");
require.alias("ianstormtaylor-to-space-case/index.js", "ianstormtaylor-to-camel-case/deps/to-space-case/index.js");
require.alias("ianstormtaylor-to-no-case/index.js", "ianstormtaylor-to-space-case/deps/to-no-case/index.js");

require.alias("component-within-document/index.js", "component-css/deps/within-document/index.js");

require.alias("component-css/index.js", "component-css/index.js");
require.alias("timoxley-offset/index.js", "tip/deps/offset/index.js");
require.alias("timoxley-offset/index.js", "offset/index.js");
require.alias("timoxley-dom-support/index.js", "timoxley-offset/deps/dom-support/index.js");
require.alias("enyo-domready/index.js", "timoxley-dom-support/deps/domready/index.js");

require.alias("component-within-document/index.js", "timoxley-offset/deps/within-document/index.js");


require.alias("component-event/index.js", "tip/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");
