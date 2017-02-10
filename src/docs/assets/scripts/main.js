;(function($, window, document, undefined) {
  
  'use strict';
  
  var main = function($main) {
    
    //////////////////////
    // demo
    //////////////////////
    
    window.resizeIframe = function(id) {
      var $iframe = $('#' + id);
      var $target = $iframe.contents().find('#body-inside');
      $target.hide().show(0); // fix scrollbars disappearing
      var h = $target.height();
      if (h !== $iframe.data('iframeHeight')) {
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
            name = '#' + k;
          }
        }
        var $btn = $container.find('.demo-tabs-left').append('<button class="button">' + name + '</button>').find('.button').eq(k);
        // iframe append
        if ($item.attr('data-iframe')) {
          $item.append('<iframe data-src="' + $item.attr('data-iframe') + '" frameborder="0"></iframe>');
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
          var $iframe = $item.find('> iframe');
          var initIframe = function() {
            if (!$iframe.attr('src')) {
              $item.addClass('demo-iframe');
              $iframe.attr('id', id);
              $iframe.attr('src', $iframe.attr('data-src'));
              $iframe.on('load', function(e){
                populateIframe($item, $iframe, id);
                window.resizeIframe(id);
                $iframe[0].contentWindow.init();
                // .populated fix scroll
                setTimeout( function($item) {
                  $item.addClass('populated');
                }, 0, $item);
              });
            }
          };
          if (k === 0) {
            initIframe();
          }
          // iframe resize on show
          $item.on('on.xt', function(e, obj) {
            if (e.target === this) {
              window.resizeIframe(id);
              if (k !== 0) {
                initIframe();
              }
            }
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
      $item.xtToggle({"elements": ".demo-code-tabs-left .button", "targets": ".demo-code-body-item", "min": 1});
    }
    
    // populateIframe
    function populateIframe($item, $iframe, id) {
      var html = $('body #body-inside', $iframe[0].contentWindow.document).html();
      var scss = $('body scss-style', $iframe[0].contentWindow.document).html();
      var css = $('body style[scoped]', $iframe[0].contentWindow.document).html();
      var js = $('body script', $iframe[0].contentWindow.document).html();
      // inject code
      if (html) {
        $iframe.append('<div class="demo-source" data-lang="html">' + html + '</div>');
      }
      if (scss) {
        $iframe.append('<div class="demo-source" data-lang="scss">' + scss + '</div>');
      }
      if (js) {
        $iframe.append('<div class="demo-source" data-lang="js">' + js + '</div>');
      }
      // populate
      var $sources = $item.find('.demo-source');
      $sources.each( function(z) {
        var $source = $(this);
        populateSources($item, $source, id, z);
      });
      $item.xtToggle({"elements": ".demo-code-tabs-left .button", "targets": ".demo-code-body-item", "min": 1});
    }
    
    // populateSources
    function populateSources($item, $source, id, z) {
      var lang = $source.data('lang');
      // populate tabs
      var $codeInside = $item.find('.demo-code-body').append('<div class="demo-code-body-item"><pre><code></code></pre></div>').find('.demo-code-body-item').eq(z).find('pre code');
      var $btnInside = $item.find('.demo-code-tabs-left').append('<button class="button">' + lang + '</button>').find('.button').eq(z);
      // format code
      if (!$codeInside.hasClass('hljs')) {
        var text = formatCode($source, lang);
        text = text.replace(/^\s+|\s+$/g, ''); // remove newline at start and end
        $codeInside.html(text).removeClass().addClass(lang);
        window.hljs.highlightBlock($codeInside[0]);
      }
    }
    
    // formatCode
    function formatCode($source, lang) {
      var $clone = $source.clone();
      var text = $clone.html();
      if (lang === 'css' || lang === 'js') {
        text = text.replace(/<[^>]*>/g, '');
      }
      if (text.match(/[&<>]/g)) {
        // replace entities
        text = text.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g, '>');
        // replace json quotes
        text = text.replace(/("{)/g, '\'{').replace(/(}")/g, '}\'');
        // replace quote entities 
        text = text.replace(/&quot;:/g,'&quot;:'); // add spacing for white-space: pre-wrap;
        text = text.replace(/&quot;/g,'"');
      }
      text = $clone.text(text).html();
      $clone.remove();
      return text;
    }
    
    // init demo
    $main.find('.demo').each( function(i) {
      var $demo = $(this);
      populateDemo($demo, i);
      // enable fullscreen
      $demo.find('.demo-tabs-left .button').on('on.xt', function(e, obj) {
        var $fullscreen = $(this).parents('.demo').find('.button__fullscreen');
        var iframe = $(this).parents('.demo').find('.demo-item.active').attr('data-iframe');
        if (iframe) {
          $fullscreen.css('display', 'block');
          $fullscreen.off('click');
          $fullscreen.on('click', function() {
            window.open(iframe, '_blank');
          });
        } else {
          $fullscreen.css('display', 'none');
        }
      });
      // demo tabs
      $demo.xtToggle({"elements":".demo-tabs-left .button", "targets": ".demo-item", "min": 1});
    });
    
    //////////////////////
    // others
    //////////////////////

    // syntax
    $main.find('pre code').each( function(i) {
      window.hljs.highlightBlock(this);
    });
    
    // .site-article .make-line
    $main.find('.site-article').find('h2, h3').addClass('make-line');
    $main.find('.make-line').wrapInner('<span class="line"></span>').wrapInner('<div class="line-container"></div>');
    
    // .site-article .site-article-anchor
    $main.find('.site-article').find('h2, h3').filter(':parents(.demo)').each( function(i) {
      var $element = $(this);
      var id = $element.text().replace(/\s+/g, '-').toLowerCase();
      $element.attr('id', id);
      $element.wrapInner('<a href="#' + id + '"></a>');
      $element.addClass('make-anchor').append('<span class="site-article-anchor"><div class="button"><span class="icon-link" aria-hidden="true"></span></div></span>');
    });
    
    // tooltips
    $main.find('[data-toggle="tooltip"]').tooltip(/*{trigger: 'click'}*/);
    
    // .site-aside-text
    $main.find('.site-aside-text > .button:not(.different)').each( function(i) {
      var $container = $(this).parent();
      $main.find('.site-article').find('h2, h3').each( function(z) {
        var $element = $(this);
        if ($(this).is('h3')) {
          $container.append($('<a href="#' + $(this).attr('id') + '" class="button site-aside-subsub">' + $(this).text() + '</a>'));
        } else {
          $container.append($('<a href="#' + $(this).attr('id') + '" class="button site-aside-sub">' + $(this).text() + '</a>'));
        }
        //$element.xtScroll();
      });
    });
    
    //////////////////////
    // developer
    //////////////////////
    
    window.developer = false;
    function developerInit() {
      // state
      if (window.developer) {
        $('.button__developer').addClass('active');
        $('.developer').addClass('developer-show');
      }
      // init
      $('.button__developer').xtToggle().on('on.xt', function(e) {
        window.developer = true;
        $('.developer').addClass('developer-show');
      }).on('hide.xt', function(e) {
        window.developer = false;
        $('.developer').removeClass('developer-show');
      });
    }
    $main.find('.site-wrapper').on('ajax.populated.xt', function(e, obj, $data) {
      developerInit();
    });
    developerInit();
    
  };
  
  // init main
  
  main($('html'));
  
  //////////////////////
  // xtend
  //////////////////////
  
  // init xt
  $('html').xtInitAll(true);
  $('html').xtAjax({'elements': 'a[href^="/"]', 'targets': '.site-wrapper'});
  
  // xt-ajax
  $('.site-wrapper').on('ajax.populated.xt', function(e, obj, $data) {
    main($(this)); // custom function on ajax
    $(this).xtInitAll(true); // init xt
  });
  
  /*
  $('.button__menu').filter(':parents(.xt-ignore)').on('on.xt', function(e, obj, triggered, isSync) {
    console.log(triggered, $('.button__menu').filter(':parents(.xt-ignore)').length, $('.button__menu').filter(':parents(.xt-ignore)').not(this).length);
    if (!triggered && e.target === this) {
      $('.button__menu').filter(':parents(.xt-ignore)').not(this).trigger('on.xt', [true, true]);
    }
  });
  */
  /*
  $('.button__menu').on('off.xt', function(e) {
    $('.button__menu').not(this).trigger('off.xt', [true]);
  });
  */
  
  /*
  // tests
  $('button').on('on.xt', function(e, obj, $data) {
    console.log($(this));
  });
  */
  // tests
  $(document).ready( function() {
    //$('.site-breadcrumbs-body-main').trigger('on.xt');
    //$('a[href="/"]').filter(':parents(.xt-ignore)').trigger('on.xt');
    //if ($('html').atr('id') === 'test-0.html') { console.log(this.settings); }
    //$('.demo-item').on('on.xt', function(e, obj) { console.log($(e.target)); });
  });
  
  
})(jQuery, window, document);