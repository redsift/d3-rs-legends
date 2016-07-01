var tape = require("@redsift/tape-reel")("<div id='test'></div>"),
    d3 = require("d3-selection"),
    legends = require("../");

// This test should be on all brick compatable charts
tape("html() empty state", function(t) {
    var host = legends.html();
    var el = d3.select('#test');
    el.call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
       
    t.end();
});


tape("html() single", function(t) {
    var host = legends.html();
    var el = d3.select('#test');
    var node = el.datum([ 'A' ]).call(host).select(host.self());
    
    t.equal(node.selectAll('rect').size(), 1);
    t.equal(node.selectAll('text').size(), 1);
           
    t.end();
});

tape("html() dual", function(t) {
    var host = legends.html();
    var el = d3.select('#test');
    var node = el.datum([ 'A', 'B' ]).call(host).select(host.self());
    
    t.equal(node.selectAll('rect').size(), 2);
    t.equal(node.selectAll('text').size(), 2);
           
    t.end();
});