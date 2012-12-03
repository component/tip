
build: tip.css index.js template.js components
	@component build --dev

template.js: template.html
	@component convert $<

components:
	@component install --dev

clean:
	rm -fr build components

.PHONY: clean
