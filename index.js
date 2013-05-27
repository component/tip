
/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , inherit = require('inherit')
  , each = require('each')
  , query = require('query')
  , domify = require('domify')
  , classes = require('classes')
  , css = require('css')
  , events = require('event')
  , bind = require('bind')
  , isArray = require('isArray');

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
 * @param {Mixed} el
 * @param {Object|String} options or value
 * @api public
 */

function tip(el, options) {
  if ('string' == typeof options) options = { value : options };
  options = options || {};
  var delay = options.delay;

  if ('string' == typeof el) el = query.all(el);
  if (!isArray(el) && !(el instanceof NodeList)) el = [el];

  each(el, function(el, i){
    var val = options.value || el.getAttribute('title');
    var tip = new Tip(val);
    el.setAttribute('title', '');
    tip.cancelHideOnHover(delay);
    tip.attach(el, delay);
  });
}

/**
 * Initialize a `Tip` with the given `content`.
 *
 * @param {Mixed} content
 * @api public
 */

function Tip(content, options) {
  if (!(this instanceof Tip)) return tip(content, options);
  Emitter.call(this);
  this.classname = '';
  this.el = domify(require('./template'))[0];
  this.inner = query('.tip-inner', this.el);
  Tip.prototype.message.call(this, content);
  this.position('south');
  if (Tip.effect) this.effect(Tip.effect);
}

/**
 * Inherits from `Emitter.prototype`.
 */

inherit(Tip, Emitter);

/**
 * Set tip `content`.
 *
 * @param {String|Element} content
 * @return {Tip} self
 * @api public
 */

Tip.prototype.message = function(content){
  this.inner.innerHTML = '';
  if ('string' == typeof content) {
    this.inner.innerHTML = content;
  } else {
    this.inner.appendChild(content);
  }
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

Tip.prototype.attach = function(el, delay){
  var self = this;
  if ('string' == typeof el) el = query(el);
  events.bind(el, 'mouseover', function () {
    self.show(el);
    self.cancelHide();
  });
  events.bind(el, 'mouseout', function () {
    self.hide(delay);
  });
  return this;
};

/**
 * Cancel hide on hover, hide with the given `delay`.
 *
 * @param {Number} delay
 * @return {Tip}
 * @api public
 */

Tip.prototype.cancelHideOnHover = function(delay){
  events.bind(this.el, 'mouseover', bind(this, 'cancelHide'));
  events.bind(this.el, 'mouseout', bind(this, 'hide', delay));
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
  classes(this.el).add(type);
  return this;
};

/**
 * Set position:
 *
 *  - `north`
 *  - `north east`
 *  - `north west`
 *  - `south`
 *  - `south east`
 *  - `south west`
 *  - `east`
 *  - `west`
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
  return this;
};

/**
 * Show the tip attached to `el`.
 *
 * Emits "show" (el) event.
 *
 * @param {String|Element} el or x
 * @param {Number} [y]
 * @return {Tip}
 * @api public
 */

Tip.prototype.show = function(el){
  // show it
  try {
    this.target = query(el);
  } catch (_) { try {
    this.target = domify(el)[0];
  } catch (_) {
    this.target = el.hover
      ? el[0]
      : el;
  }}

  document.body.appendChild(this.el);

  var cl = classes(this.el);
  each(this._position.split(/ /g), function (c) {
    cl.add(c);
  });
  cl.remove('tip-hide');

  // x,y
  if ('number' == typeof el) {
    var x = arguments[0];
    var y = arguments[1];
    this.emit('show');
    css(this.el, { top: y, left: x });
    return this;
  }

  // el
  this.reposition();
  this.emit('show', this.target);
  this._reposition = bind(this, 'reposition');
  events.bind(window, 'resize', this._reposition);
  events.bind(window, 'scroll', this._reposition);

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

  var ew = el.offsetWidth;
  var eh = el.offsetHeight;

  var top = window.scrollY;
  var left = window.scrollX;

  var w = window.innerWidth;
  var h = window.innerHeight;

  // too high
  if (off.top < top) return 'north';

  // too low
  if (off.top + eh > top + h) return 'south';

  // too far to the right
  if (off.left + ew > left + w) return 'east';

  // too far to the left
  if (off.left < left) return 'west';
};

/**
 * Replace position class `name`.
 *
 * @param {String} name
 * @api private
 */

Tip.prototype.replaceClass = function(name){
  name = name.split(' ').join('-');
  this.el.setAttribute('class', this.classname + ' tip tip-' + name + ' ' + this._effect);
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
  var el = this.el;

  var ew = el.offsetWidth;
  var eh = el.offsetHeight;

  var target = this.target;
  var docEl = document.documentElement;
  var rect = target.getBoundingClientRect();
  var to = {
    top: rect.top + window.pageYOffset - docEl.clientTop,
    left: rect.left + window.pageXOffset - docEl.clientLeft
  };
  var tw = target.offsetWidth;
  var th = target.offsetHeight;

  switch (pos) {
    case 'south':
      return {
        top: to.top - eh,
        left: to.left + tw / 2 - ew / 2
      }
    case 'north west':
      return {
        top: to.top + th,
        left: to.left + tw / 2 - pad
      }
    case 'north east':
      return {
        top: to.top + th,
        left: to.left + tw / 2 - ew + pad
      }
    case 'north':
      return {
        top: to.top + th,
        left: to.left + tw / 2 - ew / 2
      }
    case 'south west':
      return {
        top: to.top - eh,
        left: to.left + tw / 2 - pad
      }
    case 'south east':
      return {
        top: to.top - eh,
        left: to.left + tw / 2 - ew + pad
      }
    case 'west':
      return {
        top: to.top + th / 2 - eh / 2,
        left: to.left + tw
      }
    case 'east':
      return {
        top: to.top + th / 2 - eh / 2,
        left: to.left - ew
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
    this._hide = setTimeout(bind(this, 'hide'), ms);
    return this;
  }

  // hide
  classes(this.el).add('tip-hide');
  if (this._effect) {
    setTimeout(bind(this, 'remove'), 300);
  } else {
    self.remove();
  }

  return this;
};

/**
 * Hide the tip without potential animation.
 *
 * @return {Tip}
 * @api
 */

Tip.prototype.remove = function(){
  events.unbind(window, 'resize', this._reposition);
  events.unbind(window, 'scroll', this._reposition);
  this.emit('hide');
  if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
  return this;
};
