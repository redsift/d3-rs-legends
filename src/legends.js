
import { select } from 'd3-selection';

import { html as chartSVG } from '@redsift/d3-rs-svg';
import { 
  presentation10,
  fonts,
  display
} from '@redsift/d3-rs-theme';

const DEFAULT_SIZE = 270;
const DEFAULT_ASPECT = 0.5;
const DEFAULT_MARGIN = 12;  // white space
const DEFAULT_INSET = 8;   // scale space
const DEFAULT_LEGEND_SIZE = 14;
const DEFAULT_LEGEND_RADIUS = 2;
const DEFAULT_LEGEND_TEXT_SCALE = 7.19; // hack value to do fast estimation of length of string
// TODO: estimate the M, m = 7.19 = 12
// m = 8.39  = 14
// m = 9.59 = 20

function _legends(id, makeSVG) {
  let classed = 'chart-legends', 
      theme = 'light',
      background = undefined,
      width = DEFAULT_SIZE,
      height = null,
      margin = DEFAULT_MARGIN,
      inset = DEFAULT_INSET,
      padding = DEFAULT_INSET,
      textPadding = DEFAULT_INSET,
      style = undefined,
      legendSize = DEFAULT_LEGEND_SIZE,
      radius = DEFAULT_LEGEND_RADIUS,
      msize = DEFAULT_LEGEND_TEXT_SCALE,
      fontSize = undefined,
      fontFill = undefined,
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
      
    let _inset = _impl.canonicalInset();
    let _style = style;
    if (_style === undefined) {
      _style = _impl.defaultStyle();
    }       
    selection.each(function() {
      let node = select(this);  
      let _height = height || Math.round(width * DEFAULT_ASPECT);
      
      let elmS = node,
          w = width,
          h = _height;
          
      if (makeSVG === true) {
        let _background = background;
        if (_background === undefined) {
          _background = display[theme].background;
        }
        // SVG element
        let sid = null;
        if (id) sid = 'svg-' + id;
        let root = chartSVG(sid).width(w).height(h).margin(margin).scale(scale).style(_style).background(_background);
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

      let legend = (node.datum() || []).map((d, i) => ({ d: d, i: i }));
      console.log(legend.length > 0 ? legend[0].d : '');
      node.datum(legend);
      
      let lg = g.selectAll('g').data(legend);
      lg.exit().remove();
      let newlg = lg.enter().append('g');
      
      newlg.append('rect');
      newlg.append('text')
        .attr('dominant-baseline', 'central');
            
      let rect = g.selectAll('g rect').data(legend);
      let text = g.selectAll('g text').data(legend).text(d => (console.log(d), d.d));
            
      if (transition === true) {
          g = g.transition(context);
          rect = rect.transition(context);
          text = text.transition(context);
      }      
      
      if (orientation === 'top') {
        g.attr('transform', 'translate(' + (w/2) + ',' + (_inset.top) + ')');
      } else if (orientation === 'left') {
        g.attr('transform', 'translate(' + _inset.left + ',' + ((h - legend.length * (legendSize + padding) + padding)/2) + ')');
      } else if (orientation === 'right') {
        g.attr('transform', 'translate(' + (w - _inset.right - legendSize) + ',' + ((h - legend.length * (legendSize + padding) + padding)/2) + ')');
      } else {
        g.attr('transform', 'translate(' + (w/2) + ',' + (h - _inset.bottom - legendSize) + ')');
      }

      let colors = _makeFillFn();
      
      rect.attr('rx', radius)
            .attr('ry', radius)
            .attr('width', s => s.d != null ? legendSize : 0)
            .attr('height', s => s.d != null ? legendSize : 0)
            .attr('fill', d => colors(d.d, d.i));

      text.attr('y', legendSize / 2)
          .attr('fill', fontFill === undefined ? display[theme].text : fontFill)
          .attr('font-size', fontSize === undefined ? fonts.fixed.sizeForWidth(w) : fontSize);
      if (orientation === 'right') {
        text.attr('x', () => -textPadding).attr('text-anchor', 'end');
      } else {
        text.attr('x', () => legendSize + textPadding).attr('text-anchor', 'start');
      }
      
      let lens = legend.map(s => s.d == null ?  0 : s.d.length * msize + legendSize + textPadding + padding);
      
      if (orientation === 'left' || orientation === 'right') {
        let groups = g.selectAll('g').data(lens);
        groups = transition === true ? groups.transition(context) : groups;

        let idx = -1;
        let remap = legend.map(s => (s.d == null ? idx : ++idx));
        groups.attr('transform', (d, i) => 'translate(' + 0 + ',' + (remap[i] * (legendSize + padding)) + ')');
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
  
  _impl.defaultStyle = () => `${fonts.fixed.cssImport}
                              ${_impl.self()} text { 
                                font-family: ${fonts.fixed.family}; 
                                font-weight: ${fonts.fixed.weightMonochrome}; }
  `;
      
  _impl.childWidth = function() {
    let _inset = _impl.canonicalInset();
    return _inset.left + _inset.right + legendSize;
  };
  
  _impl.childHeight = function() {
    let _inset = _impl.canonicalInset();
    return _inset.top + _inset.bottom + legendSize;
  };
  
  _impl.childInset = function(inset) {
    if (inset == null) inset = 0;
    
    if (typeof inset !== 'object') {
      inset = { top: inset, left: inset, right: inset, bottom: inset };
    } else {
      inset = { top: inset.top, left: inset.left, right: inset.right, bottom: inset.bottom };
    }
    let legendOrientation = _impl.orientation();
    if (legendOrientation === 'top') {
      inset.top = inset.top + _impl.childHeight();
    } else if (legendOrientation === 'left') {
      inset.left = inset.left + _impl.childWidth();
    } else if (legendOrientation === 'right') { 
      inset.right = inset.right + _impl.childWidth();
    } else {
      inset.bottom = inset.bottom + _impl.childHeight();
    }   
    return inset;
  };        

  _impl.canonicalMargin = function() {
    let _margin = margin;
    if (_margin == null) _margin = 0;
    if (typeof _margin === 'object') {
      _margin = { top: _margin.top, bottom: _margin.bottom, left: _margin.left, right: _margin.right };
    } else {
      _margin = { top: _margin, bottom: _margin, left: _margin, right: _margin };
    }
    
    return _margin;    
  };  

  _impl.canonicalInset = function() {
    let _inset = inset;
    if (_inset == null) _inset = 0;
    if (typeof _inset === 'object') {
      _inset = { top: _inset.top, bottom: _inset.bottom, left: _inset.left, right: _inset.right };
    } else {
      _inset = { top: _inset, bottom: _inset, left: _inset, right: _inset };
    }
    
    return _inset;    
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

  _impl.msize = function(value) {
    return arguments.length ? (msize = value, _impl) : msize;
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
              
  _impl.fontSize = function(value) {
    return arguments.length ? (fontSize = value, _impl) : fontSize;
  };                 

  _impl.fontFill = function(value) {
    return arguments.length ? (fontFill = value, _impl) : fontFill;
  };  

              
  return _impl;
}

export function html(id) {
  return _legends(id, true);
}

export function svg(id) {
  return _legends(id, false);
}