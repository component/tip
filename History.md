
2.1.2 / 2014-08-01
==================

 * component, package: update "events" to v1.0.9

2.1.1 / 2014-07-14
==================

 * package: use "document-offset" module
 * component: update deps
 * package: update deps

2.1.0 / 2014-06-21
==================

 * index: use dimensions() to get the `target` dims
 * index: add `dimensions()` calculation function
 * index: fix @api JSDoc for remove()
 * test: remove redundant `<title>` element
 * package: update "timoxley-offset" to v1.0.1

2.0.0 / 2014-05-27
==================

 * gitignore: ignore root level development temp files
 * component, package: update "css" and "events"
 * package: initial browserify support
 * package: make dependencies be equivalent to component.json
 * package: update name to "component-tip"
 * Readme: update Installation section
 * component: add "browser" keyword

1.0.3 / 2014-04-08
==================

 * improve binding of 'scroll' and 'resize' handlers

1.0.2 / 2014-04-08
==================

 * fix Tip position for elements with borders
 * add live demo links
 * remove jquery from examples
 * remove component-convert step
 * update pinned dependencies

1.0.1 / 2014-04-07
==================

 * update `component/events`
 * instantiate Tip with options
 * pin `component/css@0.0.4`
 * add attach to API documentation
 * fix IE8 compatibility

1.0.0 / 2014-01-17
==================

 * change direction keywords

0.3.1 / 2014-01-02
==================

 * emit `reposition` event
 * fix setting `undefined` css classname
 * update emitter

0.3.0 / 2013-10-24
==================

 * undo 'fix' for cancelOnHide
 * removed jquery dep

0.2.1 / 2013-05-27
==================

 * pin deps
 * change default position back to above the element
 * remove silly inherit dep
 * fix for offset bug on 100% pages

0.2.0 / 2013-03-25
==================

 * add .position() .auto option to completely disable auto positioning

0.1.5 / 2013-03-05
==================

 * add explicit Tip#message() call

0.1.4 / 2013-02-28
==================

 * rename .content() to .message() for inheritance bullshit

0.1.3 / 2013-02-28
==================

 * fix backwards positioning

0.1.2 / 2013-02-21
==================

 * add inherit dependency

0.1.1 / 2012-12-18
==================

 * fix .position(), replace class immediately

0.1.0 / 2012-12-03
==================

 * add absolute positioning support via .show(x, y)
 * add Tip#cancelHideOnHover()

0.0.5 / 2012-08-31
==================

 * fix hiding of tip when hover back over the target

0.0.4 / 2012-08-22
==================

 * fix unnecessary applying of content on .show() [guille]

0.0.3 / 2012-08-22
==================

 * add `Tip#attach(el, [delay])`
 * add `.value` option
 * change `Tip#cancelHideOnHover()` to be public
 * fix npm template.js usage

0.0.2 / 2012-08-22
==================

 * add `Tip#cancelHideOnHover()`
