# nzGrid

[![Join the chat at https://gitter.im/nozzle/nzGrid](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/nozzle/nzGrid?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
An intelligent layout engine built for Angular.

nzGrid is the first layout system that is truly responsive in every way. Instead of depending on media queries and viewport dimensions, responsive calculations and classes are made relative to their containing element.  This takes the pain out of nested layouts, and is a beautiful way to use a grid in Angular.

*nzGrid is built on [Flexbox Grid](https://github.com/kristoferjoseph/flexboxgrid) and [stylus](https://github.com/LearnBoost/stylus).*

## Installation

1.	`$ bower/npm install nz-grid --save`
2.	Include `dist/nzGrid.min.js` and `dist/nzGrid.min.css`
3.	Add `nzGrid` to your app's dependencies.

## Usage

*	`<div col>`'s must be defined as direct children of `<div row>`'s 
*	`<div row>`'s can be infinitely nested inside of `<div col>`'s 
*	Breakpoints are defined like so: `<div col="xs-sm-md-lg">`, and inherited upwards. Therefore, `<div col="12--4"> == <div col="12-12-4-4">`.
*	Breakpoints are backwards compatible with classic grid style classes `<div class="col-sm-12 ...">`
*	If no breakbpoints are specified eg. `<div col></div>`, it will result in equally distributed columns.
*	`offset`, `reorder`, `align` examples can be found at [Flexbox Grid](https://github.com/kristoferjoseph/flexboxgrid), and are likewise implemented as a class... for now ;)

```html
<div row>
	<div col>Equal Column</div>
	<div col>Equal Column</div>
	<div col>Equal Column</div>
</div>

<div row>
	<div col="12-6-4-3"></div>
	<div col="12-6-4-3"></div>
	<div col="12-12-4-3"></div>
</div>

<div row>
	<div col="12--4-3">
		<div row>
			<div col="12--6">
			<div col="12--6">
			<div col="12--6">
			<div col="12--6">
		</div>
	</div>
	<div col="12--4-3">
		<div row>
			<div col="12--6">
			<div col="12--6">
			<div col="12--6">
			<div col="12--6">
		</div>
	</div>
	<div col="12--4-3">
		<div row>
			<div col="12--6">
			<div col="12--6">
			<div col="12--6">
			<div col="12--6">
		</div>
	</div>
</div>
```

## Config

Breakpoints can be changed like so:

```javascript
module.config(function(nzGridConfig){
	nzGridConfig.breaks = {
		sm: 360, // anything greater than 360 will be considered "small"
		md: 780, // anything greater than 780 will be considered "medium"
        lg: 1200, // anything greater than 1200 will be considered "large"
    },
});
```

## Custom Directive Attributes

If, for some reason, you are unable to use the directives `row` or `col` because they conflict with other directives, you may set custom directives prior to loading the nzGrid.js scripts like so:

```
<script>
window.nzGrid = {
	rowAttribute: 'myRow',	// defaults to row
	colAttribute: 'myCol,	// defaults to col
};
</script>
<script src=".../dist/nzGrid.min.js"></script>
```

## Roadmap & Contributing

1. Lessen the size of the build.
2. Create more directives for offset and alignment

All PR's and contributions are more than welcome!
