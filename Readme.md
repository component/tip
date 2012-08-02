
# Tip

  Tip component. Inspired by [tipsy](https://github.com/jaz303/tipsy) without the weird jQuery
  API.

  ![js tip component](http://f.cl.ly/items/2H1D232Y0g1T3g1G0l3s/Screen%20Shot%202012-08-02%20at%202.31.50%20PM.png)

## Installation

```
$ npm install tip-component
```

## Features

  - events for composition
  - "auto" positioning
  - fluent API

## Events

  - `show` the tip is shown
  - `hide` the tip is hidden

## API

### new Tip(content)

  Create a new tip with `content` being
  either a string or element.

```js
var tip = new Tip('Hello!');
tip.show('#mylink');
```
  
### Tip#show(el)

  Show the tip attached to `el`, where `el`
  may be a selector or element.

### Tip#hide([ms])

  Hide the tip immediately or wait `ms`.

### Tip#effect(name)

  Use effect `name`. Default with `Tip.effect = 'fade'` for example.

## License

  MIT