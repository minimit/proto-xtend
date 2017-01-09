;(function($, window, document, undefined) {
  
  'use strict';
  
  var main = function($main) {
    
    //////////////////////
    // demo
    //////////////////////
    
    function resizeIframe($iframe) {
      var oldH;
      var h = $iframe.contents().find('#inject').height();
      if (h !== oldH) {
        $iframe.height(h);
      }
      /*
      var oldH;
      var timeout = $iframe.data('iframe-timeout');
      clearTimeout(timeout);
      setInterval( function($iframe){
        var h = $iframe.contents().find('#inject').height();
        if (h !== oldH) {
          $iframe.height(h);
        }
      }, 500, $iframe);
      */
    }
    
    // populateDemo
    
    function populateDemo($element, i) {
      var $container = $element;
      var $items = $container.find('.demo-item');
      // single element
      if ($items.length === 1) {
        $items.css('display', 'block');
      }
      // multiple elements
      $container.prepend('<div class="box demo-tabs"><div class="box demo-tabs-inside"><div class="demo-tabs-left float-left"></div><div class="demo-code-tabs-right float-right"><button class="button color-text button__fullscreen" data-toggle="tooltip" data-placement="top" title="Open fullscreen"><span class="icon-enlarge2"></span></button></div></div></div>');
      $container.find('.button__fullscreen').tooltip(/*{trigger: 'click'}*/)
        .on('mouseleave', function(e) {
          $(this).attr('data-original-title', 'Open fullscreen').tooltip('hide');
        });
      $items.each( function(k) {
        var $demo = $(this);
        // populate tabs
        var name = $demo.attr('data-name');
        if ($items.length === 1) {
          if (!$demo.attr('data-name')) {
            name = 'demo';
          }
        } else {
          if (!$demo.attr('data-name')) {
            name = 'demo #' + k;
          }
        }
        var $btn = $container.find('.demo-tabs-left').append('<button class="button color-text">' + name + '</button>').find('.button').eq(k);
        $btn.xtend({"target": ".demo-item", "group": ".demo", "grouping": i});
        // inject iframe
        if ($demo.attr('data-iframe')) {
          $container.addClass('demo-iframe');
          $demo.append('<iframe src="demos/' + $demo.attr('data-iframe') + '" frameborder="0"></iframe>');
          var $iframe = $demo.find('iframe');
          $iframe.on('load', function(e){
            populateCode($demo, $iframe, i + k);
            resizeIframe($iframe);
          });
          // iframe resize on show
          $demo.on('xtend.show', function(e, object) {
            var $iframe = $(this).find('iframe');
            resizeIframe($iframe);
            //console.log($iframe.attr('src'), $iframe.contents().find('#inject').height());
          });
          // tabs
          $demo.append('<div class="demo-code"><div class="box demo-code-tabs"><div class="box demo-code-tabs-inside"><div class="demo-code-tabs-left float-left"></div><div class="demo-code-tabs-right float-right"><button class="button color-text button__clipboard" data-toggle="tooltip" data-placement="top" title="Copy to clipboard">copy</button></div></div></div><div class="box demo-code-body"></div></div>');
          // https://github.com/zenorocha/clipboard.js/
          $demo.find('.button__clipboard').tooltip(/*{trigger: 'click'}*/)
            .on('mouseleave', function(e) {
              $(this).attr('data-original-title', 'Copy to clipboard').tooltip('hide');
            });
          var clipboard = new Clipboard('.button__clipboard', {
            target: function (trigger) {
              return $(trigger).parents('.demo').find('.demo-code-body-item.active .hljs')[0];
            }
          });
          clipboard.on('success', function(e) {
            e.clearSelection();
            $(e.trigger).attr('data-original-title', 'Done').tooltip('show');
          });
          clipboard.on('error', function(e) {
            $(e.trigger).attr('data-original-title', 'Error: copy manually').tooltip('show');
          });
        } else {
          $demo.append('<div class="demo-code"><div class="box demo-code-body"><pre><code></code></pre></div></div>');
          // format code
          var $code = $demo.find('pre code');
          var $source = $demo.find('.demo-source');
          var text = formatCode($source);
          $code.html(text);
          if (!$code.hasClass('hljs')) {
            window.hljs.highlightBlock($code[0]);
          }
          $source.remove();
        }
      });
    }
    
    // populateCode
    
    function populateCode($demo, $iframe, num) {
      var html = $('body #inject-inside', $iframe[0].contentWindow.document).html();
      var scss = $('body scss-style', $iframe[0].contentWindow.document).html();
      var css = $('body style[scoped]', $iframe[0].contentWindow.document).html();
      // inject code
      if (html) {
        $iframe.append('<div class="demo-source" data-lang="html">' + html + '</div>');
      }
      if (scss && scss.indexOf('<!--') === -1) {
        $iframe.append('<div class="demo-source" data-lang="scss">' + scss + '</div>');
      }
      // populate
      var $sources = $demo.find('.demo-source');
      $sources.each( function(z) {
        var $source = $(this);
        var lang = $source.data('lang');
        // populate tabs
        var $code = $demo.find('.demo-code-body').append('<div class="demo-code-body-item"><pre><code></code></pre></div>').find('.demo-code-body-item').eq(z).find('pre code');
        var $btn = $demo.find('.demo-code-tabs-left').append('<button class="button color-text">' + lang + '</button>').find('.button').eq(z);
        $btn.xtend({"target": ".demo-code-body-item", "group": ".demo-code", "grouping": num});
        // format code
        var text = formatCode($source);
        $code.html(text).removeClass().addClass(lang);
        window.hljs.highlightBlock($code[0]);
      });
      $sources.remove();
    }
    function formatCode($source) {
      var text = $source.html();
      if (text.match(/[&<>]/g)) {
        // replace entities
        text = text.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g, '>');
        // replace json quotes
        text = text.replace(/("{)/g, '\'{').replace(/(}")/g, '}\'');
        // replace quote entities 
        text = text.replace(/&quot;:/g,'&quot;: '); // add spacing for white-space: pre-wrap;
        text = text.replace(/&quot;/g,'"');
      }
      return $source.text(text).html();
    }
    
    // init demo
    
    $main.find('.demo').each( function(i) {
      populateDemo($(this), i);
    });
    
    //////////////////////
    // others
    //////////////////////

    // .box-wrapper

    $main.find('.site-header, .site-main, .site-footer').wrapAll('<div class="box-wrapper">');
    $main.find('.site-main, .site-footer').wrapAll('<div class="box-wrapper-inside">');
    
    // syntax
    
    $main.find('pre code').each( function(i) {
      window.hljs.highlightBlock(this);
    });
    
    // .site-article .make-line
    
    $main.find('.site-article').find('h2, h3').addClass('make-line').wrapInner('<span class="line"></span>').wrapInner('<div class="line-container"></div>');
    
    // .site-article .site-article-anchor
    
    $main.find('.site-article').find('h2, h3').each( function(i) {
      var $element = $(this);
      var id = $element.attr('id');
      if (id) {
        $element.addClass('make-anchor').append('<span class="site-article-anchor"><a href="#' + id + '" class="button color-text"><span class="icon-link" aria-hidden="true"></span></a></span>');
      }
    });
    
    // tooltips
    
    $main.find('[data-toggle="tooltip"]').tooltip(/*{trigger: 'click'}*/);
    
    // .site-footer-bottom-year
    
    var year = new Date().getFullYear();
    $('.site-footer-bottom-year').html(year);
    
    //////////////////////
    
  };
  
  // init main
  
  main($('html'));
  
  //////////////////////
  // xtend events
  //////////////////////
  
  $('.site-main').on('xtend.ajax.done', function(e, object, $data) {
    var $container = $(this);
    // main on ajax
    main($container);
    // populate breadcrumbs and reinit
    /*
    var $html = $data.find('.site-breadcrumbs');
    $('.site-breadcrumbs').html($html);
    $('.site-breadcrumbs').find('[data-xtend]').xtend();
    */
  });
  
  $('.site-main').on('xtend.ajax.init xtend.ajax.done', function(e, object) {
    var $container = $(this);
    // populate header
    $('.site-hero h1').html(object.settings.ajax.h1);
    $('.site-hero h2').html(object.settings.ajax.h2);
    $('.site-header .button__menu .text').html(object.settings.ajax.cat);
  });
  
})(jQuery, window, document);