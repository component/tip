
/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , o = require('jquery');

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
 *
 * @param {Mixed} el
 * @param {Object} options
 * @api public
 */

function tip(el, options) {
  options = options || {};
  var delay = options.delay || 0;

  o(el).each(function(i, el){
    el = o(el);
    var tip = new Tip(el.attr('title'));

    // prevent original title
    el.attr('title', '');

    // cancel hide on hover
    tip.cancelHideOnHover(delay);

    // show tip on hover
    el.hover(
      tip.show.bind(tip, el),
      tip.hide.bind(tip, delay));
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
  this._content = content;
  this._parent = null;
  this.el = o(require('./template'));
  this.inner = this.el.find('.tip-inner');
  this.position('north');
  if (Tip.effect) this.effect(Tip.effect);
}

/**
 * Inherits from `Emitter.prototype`.
 */

Tip.prototype.__proto__ = Emitter.prototype;

/**
 * Cancel hide on hover, hide with the given `delay`.
 *
 * @param {Number} delay
 * @api private
 */

Tip.prototype.cancelHideOnHover = function(delay){
  this.el.hover(
    this.cancelHide.bind(this),
    this.hide.bind(this, delay));
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
  this.el.addClass(type);
  return this;
};

/**
 * Set position `type`:
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
 * @param {String} type
 * @return {Tip}
 * @api public
 */

Tip.prototype.position = function(type){
  this._position = type;
  return this;
};

/**
 * Show the tip attached to `el`.
 *
 * Emits "show" (el) event.
 *
 * @param {jQuery|Element} el
 * @return {Tip}
 * @api public
 */

Tip.prototype.show = function(el){
  if (!el) throw new Error('.show() element required');
  this.target = o(el);
  this.inner.empty().append(this._content);
  this.el.appendTo(this._parent || 'body');
  this.el.addClass('tip-' + this._position);
  this.reposition();
  this.reposition();
  this.el.removeClass('tip-hide');
  this.emit('show', this.target);
  this._reposition = this.reposition.bind(this);
  o(window).bind('resize', this._reposition);
  o(this._parent || window).bind('scroll', this._reposition);
  return this;
};

/**
 * Set element's parent element
 *
 * @param {jQuery|Element} el 
 * @return {Tip}
 * @api public
 */
Tip.prototype.parent = function(el){
  this._parent = o(el);
  return this;
}

/**
 * Reposition the tip if necessary.
 *
 * @api private
 */

Tip.prototype.reposition = function(){
  var pos = this._position;
  var off = this.offset(pos);
  var newpos = this.suggested(pos, off);
  if (newpos) off = this.offset(pos = newpos);
  this.replaceClass(pos);
  this.el.css(off);
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

  var ew = el.outerWidth();
  var eh = el.outerHeight();

  var parent = o(this._parent || window);
  var top = parent.scrollTop();
  var left = parent.scrollLeft();
  var w = parent.width();
  var h = parent.height();

  // too high
  if (off.top < top) return 'south';

  // too low
  if (off.top + eh > top + h) return 'north';

  // too far to the right
  if (off.left + ew > left + w) return 'west';

  // too far to the left
  if (off.left < left) return 'east';
};

/**
 * Replace position class `name`.
 *
 * @param {String} name
 * @api private
 */

Tip.prototype.replaceClass = function(name){
  name = name.split(' ').join('-');
  this.el.attr('class', this.classname + ' tip tip-' + name + ' ' + this._effect);
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
  var el = this.el;
  var target = this.target;
  var parent = this._parent;

  var ew = el.outerWidth();
  var eh = el.outerHeight();

  var to = target.offset();
  var tw = target.outerWidth();
  var th = target.outerHeight();

  if (parent) {
    var po = parent.offset();
    to.top = to.top - po.top + parent.scrollTop();
    to.left = to.left - po.left + parent.scrollLeft();
  }

  switch (pos) {
    case 'north':
      return {
        top: to.top - eh,
        left: to.left + tw / 2 - ew / 2
      }
    case 'north west':
      return {
        top: to.top,
        left: to.left - ew
      }
    case 'north east':
      return {
        top: to.top,
        left: to.left + tw
      }
    case 'south':
      return {
        top: to.top + th,
        left: to.left + tw / 2 - ew / 2
      }
    case 'south west':
      return {
        top: to.top + th - eh * .85,
        left: to.left - ew
      }
    case 'south east':
      return {
        top: to.top + th - eh * .85,
        left: to.left + tw
      }
    case 'east':
      return {
        top: to.top + th / 2 - eh / 2,
        left: to.left + tw
      }
    case 'west':
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
    this._hide = setTimeout(this.hide.bind(this), ms);
    return this;
  }

  // hide
  this.el.addClass('tip-hide');
  if (this._effect) {
    setTimeout(this.remove.bind(this), 300);
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
  o(window).unbind('resize', this._reposition);
  o(this._parent || window).unbind('scroll', this._reposition);
  this.emit('hide');
  this.el.detach();
  return this;
};
