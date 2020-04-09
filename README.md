# d3-rs-legends

`d3-rs-legends` generate a legend for charts.

## Builds

[![Circle CI](https://circleci.com/gh/Redsift/d3-rs-legends.svg?style=svg)](https://circleci.com/gh/Redsift/d3-rs-legends)

## Example

[View @redsift/d3-rs-legends on Codepen](http:...)

### Default

![Default bottom orientation](https://bricks.redsift.io/reusable/d3-rs-legends.svg?_datum=['A', 'B', 'C'])

### Left

![Left orientation](https://bricks.redsift.io/reusable/d3-rs-legends.svg?_datum=['A', 'B', 'C']&orientation=left)

### Right

![Right orientation](https://bricks.redsift.io/reusable/d3-rs-legends.svg?_datum=['A Short', 'B', 'C Long']&orientation=right)

### Top, rounded and spaced out

![Top orientation](https://bricks.redsift.io/reusable/d3-rs-legends.svg?_datum=['A', 'B', 'C']&orientation=top&radius=10&padding=40)

## Usage

### Browser
	
	<script src="//static.redsift.io/reusable/d3-rs-legends/latest/d3-rs-legends.umd-es2015.min.js"></script>
	<script>
		var chart = d3_rs_legends.html();
		d3.select('body').datum([ 'A', 'B' ]).call(chart);
	</script>

### ES6

	import { chart } from "@redsift/d3-rs-legends";
	let eml = chart.html();
	...
	
### Require

	var chart = require("@redsift/d3-rs-legends");
	var eml = chart.html();
	...

### Datum

- Simplest form, array of strings: `['A', 'B', 'C', ...]`

### Parameters

Property|Description|Transition|Preview
----|-----------|----------|-------
`classed`|*String* SVG custom class|N
`width`, `height`, `size`, `scale`|*Integer* SVG container sizes. Typically, use `size` to scale the chart|Y
`margin`|*Object, Number* Margin affecting all chart elements
`inset`|*Object, Number* Margin affecting the legend
`style`|*String* Custom CSS to inject into chart|N
`background`|*Color*
`theme`|*light|dark*
`orientation`|*String* Location of the legend, one of `top`, `bottom`, `left`, `right`|N
`legendSize`|*Integer* Size of the color sample|N
`spacing`|*Integer* Estimator of the amount of space to resere of each char in the text label
`padding`|*Integer* Pixels between each legend element
`radius`|*Integer* Radius of the legend rectangle. Rounds the element
`fill`|*Array, Function* Colors to assign to legend in order
`toggleable`|*Boolean* If true will add a new Checkbox on the left side of the color square to add capability to enable/disable legend items.|N
`onEnabledLegendItemsChange`|*Function* To be called whenever enabled legend items changed. It's called passing an array of the enabled legend indexes|N
`tintColor`|*String* Color to use for checkbox|N


