/**
 * Module dependencies.
 */

var css = require('css');
var bind = require('bind');
var query = require('query');
var domify = require('domify');
var events = require('events');
var Emitter = require('emitter');
var classes = require('classes');
var viewport = require('viewport');
var getBoundingClientRect = require('bounding-client-rect');

var html = domify(require('./template.html'));

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
    this.winEvents.bind('resize', 'reposition');
    this.winEvents.bind('scroll', 'reposition');
  }

  return this;
};

/**
 * Reposition the tip if necessary.
 *
 * @api private
 */

Tip.prototype.reposition = function(){
  var pos = this._position;
  if (this._auto) pos = this.suggested(pos);
  this.replaceClass(pos);
  this.emit('reposition');
  css(this.el, this.offset(pos));
};

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
  var port = viewport.value;

  // see where we have spare room
  var room = {
    top: target.top - h,
    bottom: port.height - target.bottom - h,
    left: target.left - w,
    right: port.width - target.right - w
  };

  var positions = pos.split(/\s+/);
  var primary = choosePrimary(positions[0], room);
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
  var port = viewport.value;
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
    var yVisible = Math.min(off.top < port.top ? offBottom - port.top : port.bottom - off.top, h);
    var xVisible = Math.min(off.left < port.left ? offRight - port.left : port.right - off.left, w);
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

  switch (pos) {
    case 'top':
      return {
        top: to.top - eh,
        left: to.left + tw / 2 - ew / 2
      }
    case 'bottom':
      return {
        top: to.top + th,
        left: to.left + tw / 2 - ew / 2
      }
    case 'right':
      return {
        top: to.top + th / 2 - eh / 2,
        left: to.left + tw
      }
    case 'left':
      return {
        top: to.top + th / 2 - eh / 2,
        left: to.left - ew
      }
    case 'top left':
      return {
        top: to.top - eh,
        left: to.left + tw / 2 - ew + pad
      }
    case 'top right':
      return {
        top: to.top - eh,
        left: to.left + tw / 2 - pad
      }
    case 'bottom left':
      return {
        top: to.top + th,
        left: to.left + tw / 2 - ew + pad
      }
    case 'bottom right':
      return {
        top: to.top + th,
        left: to.left + tw / 2 - pad
      }
    case 'left top':
      return {
        top: to.top + th / 2 - eh,
        left: to.left - ew
      }
    case 'left bottom':
      return {
        top: to.top + th / 2,
        left: to.left - ew
      }
    case 'right top':
      return {
        top: to.top + th / 2 - eh,
        left: to.left + tw
      }
    case 'right bottom':
      return {
        top: to.top + th / 2,
        left: to.left + tw
      }
    default:
      throw new Error('invalid position "' + pos + '"');
  }
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
