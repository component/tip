
/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , $ = require('jquery');

/**
 * Expose `Tip`.
 */

module.exports = Tip;

/**
 * Apply the average use-case of simply
 * showing a tool-tip on `el` hover.
 *
 * @param {jQuery|String} el
 * @api public
 */

function tip(el) {
  o(el).each(function(i, el){
    el = o(el);
    var tip = new Tip(el.attr('title'));
    el.hover(function(){
      tip.show(el);
    }, function(){
      tip.hide(300);
    });
  });
}

/**
 * Initialize a `Tip` with the given `content`.
 *
 * @param {String|jQuery|Element} content
 * @api public
 */

function Tip(content) {
  if (!(this instanceof Tip)) return tip(content);
  Emitter.call(this);
  this.pad = 5;
  this.preferred = 'north';
  this.content = content;
  this.el = $(render('tip'));
  this.inner = this.el.find('.tip-inner');
  this.position('auto');
  if (Tip.effect) this.effect(Tip.effect);
}

/**
 * Inherits from `Emitter.prototype`.
 */

Tip.prototype.__proto__ = Emitter.prototype;

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
 *  - `auto`
 *  - `north`
 *  - `south`
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
  if ('string' == typeof this.content) this.inner.text(this.content)
  else this.inner.empty().append(this.content);
  this.el.appendTo('body');
  this.el.addClass('tip-' + this._position);
  this.reposition();
  this.el.removeClass('tip-hide');
  this.emit('show', this.target);
  this._reposition = this.reposition.bind(this);
  o(window).bind('resize', this._reposition);
  o(window).bind('scroll', this._reposition);
  return this;
};

/**
 * Reposition the tip.
 *
 * @api private
 */

Tip.prototype.reposition = function(){
  this.el.css(this.offset());
};

/**
 * Compute the "best" position.
 *
 * @return {String}
 * @api private
 */

Tip.prototype.bestPosition = function(){
  // TODO: east / west as well
  var pad = 80;
  var target = this.target;
  var top = o(window).scrollTop();
  var to = target.offset();

  if (top > to.top - pad) return 'south';
  return 'north';
};

/**
 * Compute the offset for `.target`
 * based on the selected gravity.
 *
 * @return {Object}
 * @api private
 */

Tip.prototype.offset = function(){
  var pos = this._position;
  var el = this.el;
  var pad = this.pad;
  var target = this.target;

  var ew = el.outerWidth();
  var eh = el.outerHeight();

  var to = target.offset();
  var tw = target.outerWidth();
  var th = target.outerHeight();

  if ('auto' == pos) {
    pos = this.bestPosition();
    el.attr('class', 'tip tip-' + pos + ' ' + this._effect);
  }

  switch (pos) {
    case 'north':
      return {
        top: to.top - eh,
        left: to.left + tw / 2 - ew / 2
      }
    case 'south':
      return {
        top: to.top + th,
        left: to.left + tw / 2 - ew / 2
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
      throw new Error('invalid position "' + this._position + '"');
  }
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
    setTimeout(function(){
      self.hide();
    }, ms);
    return this;
  }

  // hide
  this.el.addClass('tip-hide');
  if (this._effect) {
    setTimeout(function(){
      self.remove();
    }, 300);
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
  o(window).unbind('scroll', this._reposition);
  this.emit('hide');
  this.el.remove();
  return this;
};
