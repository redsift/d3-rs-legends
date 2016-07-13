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

[ 'top', 'left', 'right', 'bottom' ].forEach(function (o) {


tape("html() single", function(t) {
    var host = legends.html().orientation(o);
    var el = d3.select('#test');
    var node = el.datum([ 'A' ]).call(host).select(host.self());
    
    t.equal(node.selectAll('rect').size(), 1);
    t.equal(node.selectAll('text').size(), 1);
           
    t.end();
});

tape("html() dual", function(t) {
    var host = legends.html().orientation(o);
    var el = d3.select('#test');
    var node = el.datum([ 'A', 'B' ]).call(host).select(host.self());
    
    t.equal(node.selectAll('rect').size(), 2);
    t.equal(node.selectAll('text').size(), 2);
           
    t.end();
});

tape("html() nulls", function(t) {
    var host = legends.html().orientation(o);
    var el = d3.select('#test');
    var node = el.datum([ null, 'A', null, 'B' ]).call(host).select(host.self());
    
    t.equal(node.selectAll('rect').size(), 4);
    t.equal(node.selectAll('text').size(), 4);
    
    node.selectAll('rect').each(function(e, i) { 
        var w = d3.select(this).attr('width');
        if (i % 2 == 0) {
            t.ok(w == 0, 'Width is zero');
        }  else {
            t.ok(w > 0, 'Width is not zero');
        }
    });
           
    t.end();
});
    
});
