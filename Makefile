
build: tip.css index.js template.js components
	@component build --dev

template.js: template.html
	@component convert $<

components: component.json
	@component install --dev

clean:
	rm -fr build components

test: build
	@open test/index.html

.PHONY: clean test
