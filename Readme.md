# Tip

  Tip component. Inspired by [tipsy](https://github.com/jaz303/tipsy) without the weird jQuery
  API.

  ![js tip component](http://f.cl.ly/items/2H1D232Y0g1T3g1G0l3s/Screen%20Shot%202012-08-02%20at%202.31.50%20PM.png)
  ![js tip with markup](http://f.cl.ly/items/2h1F2B1P1C3M0g0a0M0n/Screen%20Shot%202012-08-02%20at%203.34.06%20PM.png)

  ![js maru](http://f.cl.ly/items/1I2V2o0q3M2p1E2H183w/Screen%20Shot%202012-08-02%20at%206.48.28%20PM.png)

  Live demo is [here](http://component.github.io/tip/).

## Installation

``` bash
$ npm install component-tip
```

## Features

  - events for composition
  - "auto" positioning on window resize / scroll
  - fluent API

## Events

  - `show` the tip is shown
  - `hide` the tip is hidden

## API

### Tip(el, string)

  Equivalent to `Tip(el, { value: string })`.

### Tip(el, [options])

  Attach a `Tip` to an element, and display the `title`
  attribute's contents on hover. Optionally apply a hide `delay`
  in milliseconds.
  Also if `static` is true the tip will be fixed to its initial position.

```js
var tip = require('tip');
tip('a[title]', { delay: 300 });
```

### new Tip(content, [options])

  Create a new tip with `content` being
  either a string, html, element, etc.

```js
var Tip = require('tip');
var tip = new Tip('Hello!');
tip.show('#mylink');
```

### Tip#position(type, [options])

  - `top`
  - `top right`
  - `top left`
  - `bottom`
  - `bottom right`
  - `bottom left`
  - `right`
  - `left`

Options:

  - `auto` set to __false__ to disable auto-positioning

### Tip#show(el)

  Show the tip attached to `el`, where `el`
  may be a selector or element.

### Tip#show(x, y)

  Show the tip at the absolute position `(x, y)`.

### Tip#hide([ms])

  Hide the tip immediately or wait `ms`.

### Tip#attach(el)

  Attach the tip to the given `el`, showing on `mouseover` and hiding on `mouseout`.

### Tip#effect(name)

  Use effect `name`. Default with `Tip.effect = 'fade'` for example.

### Themes

  - [Aurora](https://github.com/component/aurora-tip)
  - [Nightrider](https://github.com/jb55/nightrider-tip)

## License

  MIT
