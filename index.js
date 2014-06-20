/**
 * Module dependencies.
 */

var bind = require('bind');
var Emitter = require('emitter');
var events = require('events');
var query = require('query');
var domify = require('domify');
var classes = require('classes');
var css = require('css');
var html = domify(require('./template.html'));
var offset = require('offset');

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
  this.el = html.cloneNode(true);
  this.events = events(this.el, this);
  this.classes = classes(this.el);
  this.inner = query('.tip-inner', this.el);
  this.message(content);
  this.position('top');
  if (Tip.effect) this.effect(Tip.effect);
}

/**
 * Mixin emitter.
 */

Emitter(Tip.prototype);

/**
 * Set tip `content`.
 *
 * @param {String|jQuery|Element} content
 * @return {Tip} self
 * @api public
 */

Tip.prototype.message = function(content){
  this.inner.innerHTML = content;
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
  var self = this;
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
  this.target = el;
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
  this.reposition();
  this.emit('show', this.target);

  if (!this.winEvents) {
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
  var off = this.offset(pos);
  var newpos = this._auto && this.suggested(pos, off);
  if (newpos) off = this.offset(pos = newpos);
  this.replaceClass(pos);
  this.emit('reposition');
  css(this.el, off);
};

/**
 * Compute the "suggested" position favouring `pos`.
 * Returns undefined if no suggestion is made.
 *
 * @param {String} pos
 * @param {Object} offset
 * @return {String}
 * @api private
 */

Tip.prototype.suggested = function(pos, off){
  var el = this.el;

  var ew = el.clientWidth;
  var eh = el.clientHeight;
  var top = window.scrollY;
  var left = window.scrollX;
  var w = window.innerWidth;
  var h = window.innerHeight;

  // too low
  if (off.top + eh > top + h) return 'top';

  // too high
  if (off.top < top) return 'bottom';

  // too far to the right
  if (off.left + ew > left + w) return 'left';

  // too far to the left
  if (off.left < left) return 'right';
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
  var pad = 15;

  var tipDims = dimensions(this.el);
  if (!tipDims) throw new Error('could not determine dimensions of Tip element');
  var ew = tipDims.width;
  var eh = tipDims.height;

  var to = offset(this.target);
  if (!to) throw new Error('could not determine page offset of `target`');

  var dims = dimensions(this.target);
  if (!dims) throw new Error('could not determine dimensions of `target`');
  var tw = dims.width;
  var th = dims.height;

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
 * Returns an Object with `width` and `height` values which represent the
 * dimensions of the given `node` which could be a DOM Element, Range, etc.
 *
 * TODO: extract this into a standalone module
 *
 * @private
 */

function dimensions(node) {
  var dims;
  var ow = node.offsetWidth;
  var oh = node.offsetHeight;

  // use `offsetWidth` and `offsetHeight` by default if available
  if (ow != null && oh != null) {
    dims = { width: ow, height: oh };
  }

  // fallback to `getBoundingClientRect()` if available
  if ((!dims || (!dims.width && !dims.height)) &&
      'function' == typeof node.getBoundingClientRect) {
    dims = node.getBoundingClientRect();
  }

  return dims;
}
