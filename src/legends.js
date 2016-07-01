
import { select } from 'd3-selection';

import { html as chartSVG } from '@redsift/d3-rs-svg';
import { 
  presentation10 as presentation10
} from '@redsift/d3-rs-theme';

const DEFAULT_SIZE = 270;
const DEFAULT_ASPECT = 0.5;
const DEFAULT_MARGIN = 12;  // white space
const DEFAULT_INSET = 8;   // scale space
const DEFAULT_LEGEND_SIZE = 14;
const DEFAULT_LEGEND_RADIUS = 2;
const DEFAULT_LEGEND_TEXT_SCALE = 9; // hack value to do fast estimation of length of string

// Font fallback chosen to keep presentation on places like GitHub where Content Security Policy prevents inline SRC
const DEFAULT_STYLE = [ "@import url(https://fonts.googleapis.com/css?family=Source+Code+Pro:300);",
                        "text{ font-family: 'Source Code Pro', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-weight: 300; }"
                      ].join(' \n');


function _legends(id, makeSVG) {
  let classed = 'chart-legends', 
      theme = 'light',
      background = null,
      width = DEFAULT_SIZE,
      height = null,
      margin = DEFAULT_MARGIN,
      inset = DEFAULT_INSET,
      padding = DEFAULT_INSET,
      textPadding = DEFAULT_INSET,
      style = DEFAULT_STYLE,
      legendSize = DEFAULT_LEGEND_SIZE,
      radius = DEFAULT_LEGEND_RADIUS,
      spacing = DEFAULT_LEGEND_TEXT_SCALE,
      orientation = 'bottom',
      fill = null,
      scale = 1.0;
 
  function _makeFillFn() {
    let colors = () => fill;
    if (fill == null) {
      let c = presentation10.standard;
      colors = (d, i) => (c[i % c.length]);
    } else if (typeof fill === 'function') {
      colors = fill;
    } else if (Array.isArray(fill)) {
      colors = (d, i) => fill[ i % fill.length ];
    }
    return colors;  
  }  
  
  function _impl(context) {
    let selection = context.selection ? context.selection() : context,
        transition = (context.selection !== undefined);
    
    let _inset = inset;
    if (typeof _inset !== 'object') {
      _inset = { top: _inset, bottom: _inset, left: _inset, right: _inset };
    } 
           
    selection.each(function() {
      let node = select(this);  
      let _height = height || Math.round(width * DEFAULT_ASPECT);
      
      let elmS = node,
          w = width,
          h = _height;
          
      if (makeSVG === true) {
        // SVG element
        let sid = null;
        if (id) sid = 'svg-' + id;
        let root = chartSVG(sid).width(w).height(h).margin(margin).scale(scale).style(style).background(background);
        let tnode = node;
        if (transition === true) {
          tnode = node.transition(context);
        }
        tnode.call(root);
        
        elmS = node.select(root.self()).select(root.child());
        w = root.childWidth();
        h = root.childHeight();
      }
      
      // Create required elements
      let g = elmS.select(_impl.self())
      if (g.empty()) {
        g = elmS.append('g').attr('class', classed).attr('id', id);
      }

      let legend = (g.datum() || []).map((d, i) => ({ d: d, i: i }));
      
      if (orientation === 'top') {
        g.attr('transform', 'translate(' + (w/2) + ',' + (_inset.top) + ')');
      } else if (orientation === 'left') {
        g.attr('transform', 'translate(' + _inset.left + ',' + ((h - legend.length * (legendSize + padding) + padding)/2) + ')');
      } else if (orientation === 'right') {
        g.attr('transform', 'translate(' + (w - _inset.right - legendSize) + ',' + ((h - legend.length * (legendSize + padding) + padding)/2) + ')');
      } else {
        g.attr('transform', 'translate(' + (w/2) + ',' + (h - _inset.bottom - legendSize) + ')');
      }
      
      let lg = g.selectAll('g').data(legend);
      lg.exit().remove();
      let newlg = lg.enter().append('g');
      
      let colors = _makeFillFn();

      newlg.append('rect');
      newlg.append('text')
        .attr('dominant-baseline', 'central');
            
      lg = newlg.merge(lg);

      let rect = lg.selectAll('rect');
      let text = lg.selectAll('text').text((d) => d.d);
            
      if (transition === true) {
          rect = rect.transition(context);
          text = text.transition(context);
      }
      
      rect.attr('rx', radius)
            .attr('ry', radius)
            .attr('width', legendSize)
            .attr('height', legendSize)
            .attr('fill', d => colors(d.d, d.i));

      text.attr('y', legendSize / 2);
      if (orientation === 'right') {
        text.attr('x', () => -textPadding).attr('text-anchor', 'end');
      } else {
        text.attr('x', () => legendSize + textPadding).attr('text-anchor', 'start');
      }
      
      let lens = legend.map((s) => s.d.length * spacing + legendSize + textPadding + padding);

      if (orientation === 'left' || orientation === 'right') {
        let groups = g.selectAll('g').data(lens);
        
        groups = transition === true ? groups.transition(context) : groups;
        groups.attr('transform', (d, i) => 'translate(' + 0 + ',' + (i * (legendSize + padding)) + ')');
      } else {
        let clens = []
        let total = lens.reduce((p, c) => (clens.push(p) , p + c), 0) - padding; // trim the last padding
        let offset = -total / 2;
        let groups = g.selectAll('g').data(clens);
        
        groups = transition === true ? groups.transition(context) : groups;
        groups.attr('transform', (d) => 'translate(' + (offset + d) + ',0)');
      }
    });
    
  }
  
  _impl.self = function() { return 'g' + (id ?  '#' + id : '.' + classed); }

  _impl.id = function() {
    return id;
  };
    
  _impl.classed = function(value) {
    return arguments.length ? (classed = value, _impl) : classed;
  };
    
  _impl.background = function(value) {
    return arguments.length ? (background = value, _impl) : background;
  };

  _impl.theme = function(value) {
    return arguments.length ? (theme = value, _impl) : theme;
  };  

  _impl.size = function(value) {
    return arguments.length ? (width = value, height = null, _impl) : width;
  };
    
  _impl.width = function(value) {
    return arguments.length ? (width = value, _impl) : width;
  };  

  _impl.height = function(value) {
    return arguments.length ? (height = value, _impl) : height;
  }; 

  _impl.scale = function(value) {
    return arguments.length ? (scale = value, _impl) : scale;
  }; 

  _impl.margin = function(value) {
    return arguments.length ? (margin = value, _impl) : margin;
  };   

  _impl.inset = function(value) {
    return arguments.length ? (inset = value, _impl) : inset;
  };  

  _impl.style = function(value) {
    return arguments.length ? (style = value, _impl) : style;
  }; 
  
  _impl.padding = function(value) {
    return arguments.length ? (padding = value, _impl) : padding;
  };   
  
  _impl.fill = function(value) {
    return arguments.length ? (fill = value, _impl) : fill;
  };    

  _impl.textPadding = function(value) {
    return arguments.length ? (textPadding = value, _impl) : textPadding;
  };  

  _impl.spacing = function(value) {
    return arguments.length ? (spacing = value, _impl) : spacing;
  };   

  _impl.legendSize = function(value) {
    return arguments.length ? (legendSize = value, _impl) : legendSize;
  };  
      
  _impl.radius = function(value) {
    return arguments.length ? (radius = value, _impl) : radius;
  };    
  
  _impl.inset = function(value) {
    return arguments.length ? (inset = value, _impl) : inset;
  }; 
  
  _impl.orientation = function(value) {
    return arguments.length ? (orientation = value, _impl) : orientation;
  };     
              
  return _impl;
}

export function html(id) {
  return _legends(id, true);
}

export function svg(id) {
  return _legends(id, false);
}