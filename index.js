/**
 * Module dependencies.
 */

try {
  var css = require('css');
} catch (err) {
  var css = require('component-css');
}

try {
  var bind = require('bind');
} catch (err) {
  var bind = require('component-bind');
}

try {
  var query = require('query');
} catch (err) {
  var query = require('component-query');
}

try {
  var events = require('events');
} catch (err) {
  var events = require('component-events');
}

try {
  var Emitter = require('emitter');
} catch (err) {
  var Emitter = require('component-emitter');
}

try {
  var classes = require('classes');
} catch (err) {
  var classes = require('component-classes');
}

try {
  var raf = require('raf');
} catch (err) {
  var raf = require('component-raf');
}

var domify = require('domify');
var getBoundingClientRect = require('bounding-client-rect');

var html = domify(require('./template.html'));


// inspired by https://github.com/jkroso/viewport
function updateViewport( v ) {
  v.top = window.scrollY;
  v.left = window.scrollX;
  v.width = window.innerWidth;
  v.height = window.innerHeight;
  v.right = v.left + v.width;
  v.bottom = v.top + v.height;
  return v;
}

var viewport = updateViewport({});

function onViewportChange() {
  updateViewport( viewport );
}

// don't debounce these because they don't so any work that requires layout
window.addEventListener('resize', onViewportChange, true)
window.addEventListener('scroll', onViewportChange, true)


/**
 * Expose `Tip`.
 */

module.exports = Tip;

/**
 * Apply the average use-case of simply
 * showing a tool-tip on `el` hover.
 *
 * Options:
 *
 *  - `delay` hide delay in milliseconds [0]
 *  - `value` defaulting to the element's title attribute
 *
 * @param {Mixed} elem
 * @param {Object|String} options or value
 * @api public
 */

function tip(elem, options) {
  if ('string' == typeof options) options = { value : options };
  var els = ('string' == typeof elem) ? query.all(elem) : [elem];
  for(var i = 0, el; el = els[i]; i++) {
    var val = options.value || el.getAttribute('title');
    var tip = new Tip(val, options);
    el.setAttribute('title', '');
    tip.cancelHideOnHover();
    tip.attach(el);
  }
}

/**
 * Initialize a `Tip` with the given `content`.
 *
 * @param {Mixed} content
 * @api public
 */

function Tip(content, options) {
  options = options || {};
  if (!(this instanceof Tip)) return tip(content, options);
  Emitter.call(this);
  this.classname = '';
  this.delay = options.delay || 300;
  this.pad = null == options.pad ? 15 : options.pad;
  this.el = html.cloneNode(true);
  this.events = events(this.el, this);
  this.classes = classes(this.el);
  this.reposition = bind( this, Tip.prototype.reposition );
  this.inner = query('.tip-inner', this.el);
  this.message(content);
  this.position('top');
  this.static = !!options.static;
  if (Tip.effect) this.effect(Tip.effect);
}

/**
 * Mixin emitter.
 */

Emitter(Tip.prototype);

/**
 * Set tip `content`.
 *
 * @param {String|Element} content
 * @return {Tip} self
 * @api public
 */

Tip.prototype.message = function(content){
  if ('string' == typeof content) content = domify(content);
  this.inner.appendChild(content);
  return this;
};

/**
 * Attach to the given `el` with optional hide `delay`.
 *
 * @param {Element} el
 * @param {Number} delay
 * @return {Tip}
 * @api public
 */

Tip.prototype.attach = function(el){
  this.target = el;
  this.handleEvents = events(el, this);
  this.handleEvents.bind('mouseover');
  this.handleEvents.bind('mouseout');
  return this;
};

/**
 * On mouse over
 *
 * @param {Event} e
 * @return {Tip}
 * @api private
 */

Tip.prototype.onmouseover = function() {
  this.show(this.target);
  this.cancelHide();
};

/**
 * On mouse out
 *
 * @param {Event} e
 * @return {Tip}
 * @api private
 */

Tip.prototype.onmouseout = function() {
  this.hide(this.delay);
};

/**
 * Cancel hide on hover, hide with the given `delay`.
 *
 * @param {Number} delay
 * @return {Tip}
 * @api public
 */

Tip.prototype.cancelHideOnHover = function(){
  this.events.bind('mouseover', 'cancelHide');
  this.events.bind('mouseout', 'hide');
  return this;
};

/**
 * Set the effect to `type`.
 *
 * @param {String} type
 * @return {Tip}
 * @api public
 */

Tip.prototype.effect = function(type){
  this._effect = type;
  this.classes.add(type);
  return this;
};

/**
 * Set position:
 *
 *  - `top`
 *  - `top left`
 *  - `top right`
 *  - `bottom`
 *  - `bottom left`
 *  - `bottom right`
 *  - `left`
 *  - `right`
 *
 * @param {String} pos
 * @param {Object} options
 * @return {Tip}
 * @api public
 */

Tip.prototype.position = function(pos, options){
  options = options || {};
  this._position = pos;
  this._auto = false != options.auto;
  this.replaceClass(pos);
  this.emit('reposition');
  return this;
};

/**
 * Show the tip attached to `el`.
 *
 * Emits "show" (el) event.
 *
 * @param {String|Element|Number} el or x
 * @param {Number} [y]
 * @return {Tip}
 * @api public
 */

Tip.prototype.show = function(el){
  if ('string' == typeof el) el = query(el);

  // show it
  document.body.appendChild(this.el);
  this.classes.add('tip-' + this._position.replace(/\s+/g, '-'));
  this.classes.remove('tip-hide');

  // x,y
  if ('number' == typeof el) {
    var x = arguments[0];
    var y = arguments[1];
    this.emit('show');
    css(this.el, {
      top: y,
      left: x
    });
    return this;
  }

  // el
  this.target = el;
  this.reposition();
  this.emit('show', this.target);

  if (!this.winEvents && !this.static) {
    this.winEvents = events(window, this);
    this.winEvents.bind('resize', 'debouncedReposition');
    this.winEvents.bind('scroll', 'debouncedReposition');
  }

  return this;
};

/**
 * Reposition the tip if necessary.
 *
 * @api private
 */

Tip.prototype.reposition = function(){
  this.willReposition = null;
  var pos = this._position;
  if (this._auto) pos = this.suggested(pos);
  this.replaceClass(pos);
  this.emit('reposition');
  css(this.el, constrainLeft( this.offset(pos), this.el ) );
};

/**
 * Reposition the tip on the next available animation frame
 *
 * @api private
 */
Tip.prototype.debouncedReposition = function() {
  this.willReposition = raf( this.reposition );
}

/**
 * Compute the "suggested" position favouring `pos`.
 *
 * Returns `pos` if no suggestion can be determined.
 *
 * @param {String} pos
 * @param {Object} offset
 * @return {String}
 * @api private
 */

Tip.prototype.suggested = function(pos){
  var target = getBoundingClientRect(this.target);
  var h = this.el.clientHeight;
  var w = this.el.clientWidth;

  // see where we have spare room
  var room = {
    top: target.top - h,
    bottom: viewport.height - target.bottom - h,
    left: target.left - w,
    right: viewport.width - target.right - w
  };

  var positions = pos.split(/\s+/);
  var primary = choosePrimary(positions[0], room);
  if( positions[1] === primary || positions[1] === opposite[primary] ) {
    positions[1] = null;
  }
  return chooseSecondary(primary, positions[1], this, w, h) || pos;
};

function choosePrimary(prefered, room){
  // top, bottom, left, right in order of preference
  var order = [prefered, opposite[prefered], adjacent[prefered], opposite[adjacent[prefered]]];
  var best = -Infinity;
  var bestPos
  for (var i = 0, len = order.length; i < len; i++) {
    var prefered = order[i];
    var space = room[prefered];
    // the first side it fits completely
    if (space > 0) return prefered;
    // less chopped of than other sides
    if (space > best) best = space, bestPos = prefered;
  }
  return bestPos;
}

function chooseSecondary(primary, prefered, tip, w, h){
  // top, top left, top right in order of preference
  var order = prefered
    ? [primary + ' ' + prefered, primary, primary + ' ' + opposite[prefered]]
    : [primary, primary + ' ' + adjacent[primary], primary + ' ' + opposite[adjacent[primary]]];
  var bestPos;
  var best = 0;
  var max = w * h;
  for (var i = 0, len = order.length; i < len; i++) {
    var pos = order[i];
    var off = tip.offset(pos);
    var offRight = off.left + w;
    var offBottom = off.top + h;
    var yVisible = Math.min(off.top < viewport.top ? offBottom - viewport.top : viewport.bottom - off.top, h);
    var xVisible = Math.min(off.left < viewport.left ? offRight - viewport.left : viewport.right - off.left, w);
    var area = xVisible * yVisible;
    // the first position that shows all the tip
    if (area == max) return pos;
    // shows more of the tip than the other positions
    if (area > best) best = area, bestPos = pos;
  }
  return bestPos;
}

var opposite = {
  top: 'bottom', bottom: 'top',
  left: 'right', right: 'left'
};

var adjacent = {
  top: 'right',
  left: 'top',
  bottom: 'left',
  right: 'bottom'
};

/**
 * Replace position class `name`.
 *
 * @param {String} name
 * @api private
 */

Tip.prototype.replaceClass = function(name){
  name = name.split(' ').join('-');
  var classname = this.classname + ' tip tip-' + name;
  if (this._effect) classname += ' ' + this._effect;
  this.el.setAttribute('class', classname);
};

/**
 * Compute the offset for `.target`
 * based on the given `pos`.
 *
 * @param {String} pos
 * @return {Object}
 * @api private
 */

Tip.prototype.offset = function(pos){
  var pad = this.pad;

  var tipRect = getBoundingClientRect(this.el);
  if (!tipRect) throw new Error('could not get bounding client rect of Tip element');
  var ew = tipRect.width;
  var eh = tipRect.height;

  var targetRect = getBoundingClientRect(this.target);
  if (!targetRect) throw new Error('could not get bounding client rect of `target`');
  var tw = targetRect.width;
  var th = targetRect.height;

  var to = offset(targetRect, document);
  if (!to) throw new Error('could not determine page offset of `target`');

  var pos;
  switch (pos) {
    case 'top':
      pos = {
        top: to.top - eh,
        left: to.left + tw / 2 - ew / 2
      };
      break;
    case 'bottom':
      pos = {
        top: to.top + th,
        left: to.left + tw / 2 - ew / 2
      };
      break;
    case 'right':
      pos = {
        top: to.top + th / 2 - eh / 2,
        left: to.left + tw
      };
      break;
    case 'left':
      pos = {
        top: to.top + th / 2 - eh / 2,
        left: to.left - ew
      };
      break;
    case 'top left':
      pos = {
        top: to.top - eh,
        left: to.left + tw / 2 - ew + pad
      };
      break;
    case 'top right':
      pos = {
        top: to.top - eh,
        left: to.left + tw / 2 - pad
      };
      break;
    case 'bottom left':
      pos = {
        top: to.top + th,
        left: to.left + tw / 2 - ew + pad
      };
      break;
    case 'bottom right':
      pos = {
        top: to.top + th,
        left: to.left + tw / 2 - pad
      };
      break;
    case 'left top':
      pos = {
        top: to.top + th / 2 - eh,
        left: to.left - ew
      };
      break;
    case 'left bottom':
      pos = {
        top: to.top + th / 2,
        left: to.left - ew
      };
      break;
    case 'right top':
      pos = {
        top: to.top + th / 2 - eh,
        left: to.left + tw
      };
      break;
    case 'right bottom':
      pos = {
        top: to.top + th / 2,
        left: to.left + tw
      };
      break;
    default:
      throw new Error('invalid position "' + pos + '"');
  }
  return pos;
};

/**
 * Cancel the `.hide()` timeout.
 *
 * @api private
 */

Tip.prototype.cancelHide = function(){
  clearTimeout(this._hide);
};

/**
 * Hide the tip with optional `ms` delay.
 *
 * Emits "hide" event.
 *
 * @param {Number} ms
 * @return {Tip}
 * @api public
 */

Tip.prototype.hide = function(ms){
  var self = this;

  this.emit('hiding');

  // duration
  if (ms) {
    this._hide = setTimeout(bind(this, this.hide), ms);
    return this;
  }

  // hide
  this.classes.add('tip-hide');
  if (this._effect) {
    setTimeout(bind(this, this.remove), 300);
  } else {
    self.remove();
  }

  return this;
};

/**
 * Hide the tip without potential animation.
 *
 * @return {Tip}
 * @api public
 */

Tip.prototype.remove = function(){
  if (this.winEvents) {
    this.winEvents.unbind();
    this.winEvents = null;
  }
  if (this._willReposition) {
    raf.cancel( this.willReposition );
    this.willReposition = null;
  }
  this.emit('hide');

  var parent = this.el.parentNode;
  if (parent) parent.removeChild(this.el);
  return this;
};

/**
 * Extracted from `timoxley/offset`, but directly using a
 * TextRectangle instead of getting another version.
 *
 * @param {TextRectangle} box - result from a `getBoundingClientRect()` call
 * @param {Document} doc - Document instance to use
 * @return {Object} an object with `top` and `left` Number properties
 * @api private
 */

function offset (box, doc) {
  var body = doc.body || doc.getElementsByTagName('body')[0];
  var docEl = doc.documentElement || body.parentNode;
  var clientTop  = docEl.clientTop  || body.clientTop  || 0;
  var clientLeft = docEl.clientLeft || body.clientLeft || 0;
  var scrollTop  = window.pageYOffset || docEl.scrollTop;
  var scrollLeft = window.pageXOffset || docEl.scrollLeft;

  return {
    top: box.top  + scrollTop  - clientTop,
    left: box.left + scrollLeft - clientLeft
  };
}

/**
 * Constrain a left to keep the element in the window
 * @param  {Object} pl proposed left
 * @param  {Number} ew tip element width
 * @return {Number}    the best width
 */
function constrainLeft ( off, el ) {
  var ew = getBoundingClientRect(el).width;
  off.left = Math.max( 0, Math.min( off.left, viewport.width - ew ) );
  return off;
}
