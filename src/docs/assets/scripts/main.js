;(function($, window, document, undefined) {
  
  'use strict';
  
  var main = function($main) {
    
    //////////////////////
    // demo
    //////////////////////
    
    window.resizeIframe = function(id) {
      var $iframe = $('#' + id);
      var oldH = $iframe.data('iframeHeight');
      var h = $iframe.contents().find('#inject').height();
      if (h !== oldH) {
        $iframe.height(h);
        $iframe.data('iframeHeight', h);
      }
    };
    
    // populateDemo
    function populateDemo($container, i) {
      var $items = $container.find('> .demo-item');
      // multiple elements
      $container.prepend('<div class="box demo-tabs"><div class="box demo-tabs-inside"><div class="demo-tabs-left float-left"></div><div class="demo-code-tabs-right float-right"></div></div></div>');
      $container.find('.demo-code-tabs-right').append('<button class="button button__fullscreen" data-toggle="tooltip" data-placement="top" title="Open fullscreen"><span class="icon-enlarge2"></span></button>');
      $container.find('.button__fullscreen').tooltip(/*{trigger: 'click'}*/)
        .on('mouseleave', function(e) {
          $(this).attr('data-original-title', 'Open fullscreen').tooltip('hide');
        });
      // single element and no demo tabs
      if ($items.length === 1 && !$items.hasClass('demo-preview') && !$items.attr('data-iframe')) {
        $items.css('display', 'block');
        $container.find('.demo-tabs').css('display', 'none');
      }
      $items.each( function(k) {
        var $item = $(this);
        // populate tabs
        var name = $item.attr('data-name');
        if ($items.length === 1) {
          if (!$item.attr('data-name')) {
            name = 'demo';
          }
        } else {
          if (!$item.attr('data-name')) {
            name = 'demo #' + k;
          }
        }
        var $btn = $container.find('.demo-tabs-left').append('<button class="button">' + name + '</button>').find('.button').eq(k);
        $btn.xtend({"target": ".demo-item", "group": ".demo", "grouping": i});
        // disable fullscreen when not needed
        $btn.on('xtend.show', function(e, object) {
          if ($(this).parents('.demo').find('.demo-item.active').attr('data-iframe')) {
            $(this).parents('.demo').find('.button__fullscreen').css('display', 'block');
          } else {
            $(this).parents('.demo').find('.button__fullscreen').css('display', 'none');
          }
        });
        // iframe append
        if ($item.attr('data-iframe')) {
          $item.append('<iframe src="' + $item.attr('data-iframe') + '" frameborder="0"></iframe>');
        }
        // tabs
        var id = 'iframe' + i + k;
        $item.append('<div class="demo-code"><div class="box demo-code-tabs"><div class="box demo-code-tabs-inside"><div class="demo-code-tabs-left float-left"></div><div class="demo-code-tabs-right float-right"><button class="button button__clipboard" data-toggle="tooltip" data-placement="top" title="Copy to clipboard">copy</button></div></div></div><div class="box demo-code-body"></div></div>');
        // https://github.com/zenorocha/clipboard.js/
        $item.find('.button__clipboard').tooltip(/*{trigger: 'click'}*/)
          .on('mouseleave', function(e) {
            $(this).attr('data-original-title', 'Copy to clipboard').tooltip('hide');
          });
        var clipboard = new Clipboard('.button__clipboard', {
          target: function (trigger) {
            return $(trigger).parents('.demo').find('.demo-item.active .demo-code-body-item.active .hljs')[0];
          }
        });
        clipboard.on('success', function(e) {
          e.clearSelection();
          $(e.trigger).attr('data-original-title', 'Done').tooltip('show');
        });
        clipboard.on('error', function(e) {
          $(e.trigger).attr('data-original-title', 'Error: copy manually').tooltip('show');
        });
        // inject iframe
        if ($item.attr('data-iframe')) {
          $item.addClass('demo-iframe');
          var $iframe = $item.find('> iframe');
          $iframe.attr('id', id);
          $iframe.on('load', function(e){
            populateIframe($item, $iframe, id);
            window.resizeIframe(id);
            $iframe[0].contentWindow.init();
            // .populated fix scroll
            setTimeout( function($item) {
              $item.addClass('populated');
            }, 0, $item);
          });
          // iframe resize on show
          $item.on('xtend.show', function(e, object) {
            var $iframe = $(this).find('> iframe');
            window.resizeIframe(id);
            //console.log($iframe.attr('src'), $iframe.contents().find('#inject').height());
          });
        } else {
          populateInline($item, id);
          // .populated fix scroll
          setTimeout( function($item) {
            $item.addClass('populated');
          }, 0, $item);
        }
      });
    }
    
    // populateInline
    function populateInline($item, id) {
      var $sources = $item.find('> .demo-source');
      $sources.each( function(z) {
        var $source = $(this);
        populateSources($item, $source, id, z);
        if (!$item.hasClass('demo-preview')) {
          $source.css('display', 'none');
        }
      });
    }
    
    // populateIframe
    function populateIframe($item, $iframe, id) {
      var html = $('body #inject-inside', $iframe[0].contentWindow.document).html();
      var scss = $('body scss-style', $iframe[0].contentWindow.document).html();
      var css = $('body style[scoped]', $iframe[0].contentWindow.document).html();
      var js = $('body script', $iframe[0].contentWindow.document).html();
      // inject code
      if (html) {
        //html = html.replace(/^\s+|\s+$/g, '');
        $iframe.append('<div class="demo-source" data-lang="html">' + html + '</div>');
      }
      if (scss) {
        //scss = scss.replace(/^\s+|\s+$/g, '');
        $iframe.append('<div class="demo-source" data-lang="scss">' + scss + '</div>');
      }
      /*
      if (css) {
        //css = css.replace(/^\s+|\s+$/g, '');
        $iframe.append('<div class="demo-source" data-lang="css">' + css + '</div>');
      }
      */
      if (js) {
        //js = js.replace(/^\s+|\s+$/g, '');
        $iframe.append('<div class="demo-source" data-lang="js">' + js + '</div>');
      }
      // populate
      var $sources = $item.find('.demo-source');
      $sources.each( function(z) {
        var $source = $(this);
        populateSources($item, $source, id, z);
      });
    }
    
    // populateSources
    function populateSources($item, $source, id, z) {
      var lang = $source.data('lang');
      // populate tabs
      var $codeInside = $item.find('.demo-code-body').append('<div class="demo-code-body-item"><pre><code></code></pre></div>').find('.demo-code-body-item').eq(z).find('pre code');
      var $btnInside = $item.find('.demo-code-tabs-left').append('<button class="button">' + lang + '</button>').find('.button').eq(z);
      $btnInside.xtend({"target": ".demo-code-body-item", "group": ".demo-code", "grouping": id});
      // format code
      if (!$codeInside.hasClass('hljs')) {
        var text = formatCode($source);
        $codeInside.html(text).removeClass().addClass(lang);
        window.hljs.highlightBlock($codeInside[0]);
      }
    }
    
    // formatCode
    function formatCode($source) {
      var $clone = $source.clone();
      var text = $clone.html();
      if (text.match(/[&<>]/g)) {
        // replace entities
        text = text.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g, '>');
        // replace json quotes
        text = text.replace(/("{)/g, '\'{').replace(/(}")/g, '}\'');
        // replace quote entities 
        text = text.replace(/&quot;:/g,'&quot;: '); // add spacing for white-space: pre-wrap;
        text = text.replace(/&quot;/g,'"');
      }
      text = $clone.text(text).html();
      $clone.remove();
      return text;
    }
    
    // init demo
    $main.find('.demo').each( function(i) {
      populateDemo($(this), i);
    });
    
    //////////////////////
    // others
    //////////////////////

    // syntax
    $main.find('pre code').each( function(i) {
      window.hljs.highlightBlock(this);
    });
    
    // .site-article .make-line
    $main.find('.site-article').find('h2, h3').addClass('make-line').wrapInner('<span class="line"></span>').wrapInner('<div class="line-container"></div>');
    
    // .site-article .site-article-anchor
    jQuery.expr[':'].parents = function(a,i,m){
      return jQuery(a).parents(m[3]).length < 1;
    };
    $main.find('.site-article').find('h2, h3').filter(':parents(.demo)').each( function(i) {
      var $element = $(this);
      var id = $element.text().replace(/\s+/g, '-').toLowerCase();
      $element.attr('id', id);
      $element.addClass('make-anchor').append('<span class="site-article-anchor"><a href="#' + id + '" class="button"><span class="icon-link" aria-hidden="true"></span></a></span>');
    });
    
    // tooltips
    $main.find('[data-toggle="tooltip"]').tooltip(/*{trigger: 'click'}*/);
    
    //////////////////////
    
  };
  
  // init main
  
  main($('html'));
  
  //////////////////////
  // xtend
  //////////////////////
  
  // on done
  $('.site-wrapper').on('xtend.ajax.done', function(e, object, $data) {
    var $container = $(this);
    // main on ajax
    main($container);
  });
  
  // on ajax
  $('.site-wrapper').on('xtend.ajax.init xtend.ajax.done', function(e, object, $data) {
    var $container = $(this);
    // populate header
    /*
    $('.site-hero h1').html($data.find('.site-hero .h1').text());
    $('.site-hero h2').html($data.find('.site-hero .h5').text());
    $('.site-header .button__menu .text').html(object.settings.ajax.cat);
    */
    // populate breadcrumbs and reinit
    //$('.site-breadcrumbs').html($data.find('.site-breadcrumbs'));
    // init breadcrumbs
    $('.site-breadcrumbs').find('[data-xtend]').xtend();
  });
  
})(jQuery, window, document);