/*! xtend v0.0.6 (http://www.minimit.com/xtend/)
@copyright (c) 2016 - 2017 Riccardo Caroli
@license MIT (https://github.com/minimit/xtend/blob/master/LICENSE) */

;( function($, window, document, undefined) {

  'use strict';
  
  //////////////////////
  // constructor
  //////////////////////
  
  // super class
  var Xt = function(element, options, defaults) {
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    this.init();
  };
  $.fn.xt = function(options) {
    var defaults = {
      'name': 'xt',
      'type': 'plugin_xt',
      'on': 'click',
      'target': null,
      'class': 'active',
      'group': null,
      'grouping': 'xt',
      'min': 0,
      'max': 1,
    };
    return this.each( function() {
      if (!$.data(this, 'plugin_xt')) {
        $.data(this, 'plugin_xt', new Xt(this, options, defaults));
      }
    });
  };
  
  // subclass toggle
  var XtToggle = function(element, options, defaults) {
    Xt.call(this, element, options, defaults);
  };
  XtToggle.prototype = Object.create(Xt.prototype);
  XtToggle.prototype.constructor = XtToggle;
  $.fn.xtToggle = function(options) {
    var defaults = {
      'name': 'xt-toggle',
      'type': 'plugin_xtToggle',
      'on': 'click',
      'target': null,
      'class': 'active',
      'group': null,
      'grouping': 'xtToggle',
      'min': 0,
      'max': 1,
    };
    return this.each( function() {
      if (!$.data(this, 'plugin_xtToggle')) {
        $.data(this, 'plugin_xtToggle', new XtToggle(this, options, defaults));
      }
    });
  };
  
  // subclass scroll
  var XtMenu = function(element, options, defaults) {
    Xt.call(this, element, options, defaults);
  };
  XtMenu.prototype = Object.create(Xt.prototype);
  XtMenu.prototype.constructor = XtMenu;
  $.fn.xtMenu = function(options) {
    var defaults = {
      'name': 'xt-menu',
      'type': 'plugin_xtMenu',
      'on': 'click',
      'target': 'html',
      'class': 'menu',
      'group': null,
      'grouping': 'xtMenu',
      'min': 0,
      'max': 1,
    };
    return this.each( function() {
      if (!$.data(this, 'plugin_xtMenu')) {
        $.data(this, 'plugin_xtMenu', new XtMenu(this, options, defaults));
      }
    });
  };
  
  // subclass scroll
  var XtScroll = function(element, options, defaults) {
    Xt.call(this, element, options, defaults);
  };
  XtScroll.prototype = Object.create(Xt.prototype);
  XtScroll.prototype.constructor = XtScroll;
  $.fn.xtScroll = function(options) {
    var defaults = {
      'name': 'xt-scroll',
      'type': 'plugin_xtScroll',
      'on': 'scroll',
      'target': null,
      'class': 'scroll',
      'group': null,
      'grouping': 'xtScroll',
      'min': 0,
      'max': 1,
    };
    return this.each( function() {
      if (!$.data(this, 'plugin_xtScroll')) {
        $.data(this, 'plugin_xtScroll', new XtScroll(this, options, defaults));
      }
    });
  };
  
  // subclass ajax
  var XtAjax = function(element, options, defaults) {
    Xt.call(this, element, options, defaults);
  };
  XtAjax.prototype = Object.create(Xt.prototype);
  XtAjax.prototype.constructor = XtAjax;
  $.fn.xtAjax = function(options) {
    var defaults = {
      'name': 'xt-ajax',
      'type': 'plugin_xtAjax',
      'on': 'click',
      'target': null,
      'class': 'active',
      'group': null,
      'grouping': 'xtAjax',
      'url': null,
    };
    return this.each( function() {
      if (!$.data(this, 'plugin_xtAjax')) {
        $.data(this, 'plugin_xtAjax', new XtAjax(this, options, defaults));
      }
    });
  };
  
  //////////////////////
  // init
  //////////////////////
  
  // xtInitAll jQuery
  // usage: $('html').xtInitAll();
  $.fn.xtInitAll = function(deep) {
    return this.each( function() {
      if ($(this).is('[data-xt]')) {
        $(this).xt();
      }
      if ($(this).is('[data-xt-toggle]')) {
        $(this).xtToggle();
      }
      if ($(this).is('[data-xt-menu]')) {
        $(this).xtMenu();
      }
      if ($(this).is('[data-xt-scroll]')) {
        $(this).xtScroll();
      }
      if ($(this).is('[data-xt-ajax]')) {
        $(this).xtAjax();
      }
      if (deep) {
        $(this).find('[data-xt]').xt();
        $(this).find('[data-xt-toggle]').xtToggle();
        $(this).find('[data-xt-menu]').xtMenu();
        $(this).find('[data-xt-scroll]').xtScroll();
        $(this).find('[data-xt-ajax]').xtAjax();
      }
    });
  };
  
  // initAjax
  $.fn.xt.initAjax = function(options) {
    // ajax links
    $('a[href^="' + options.baseurl + '"]').xtAjax({'target': options.target});
    // on ajax.populated.xt
    $(options.target).off('ajax.populated.xt.populate');
    $(options.target).on('ajax.populated.xt.populate', function(e, obj, $data) {
      // ajax links
      $(this).find('a[href^="' + options.baseurl + '"]').xtAjax({'target': options.target});
    });
  };
  
  //////////////////////
  // methods
  //////////////////////

  // init
  Xt.prototype.init = function() {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // variables
    if ($element.attr('debug') || $element.attr('debug') === '') {
      settings.debug = true;
    }
    // override with html settings
    $.extend(settings, $element.data(settings.name));
    // setup
    this.scoping(); // scoping before setup
    this.setup();
    this.events(); // events after setup
    //console.log(':init', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
  };
  
  Xt.prototype.scoping = function() {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // $group and $target
    if (settings.name === 'xt-scroll') {
      $element.wrap($('<div class="box xt-container"></div>'));
      settings.$target = $element.clone().addClass('box xt-ignore').css('visibility', 'hidden');
      $.each(settings.$target.data(), function (i) {
        settings.$target.removeAttr("data-" + i);
      });
      settings.$target.insertAfter($element);
      settings.$group = $element.parents('.xt-container');
    } else if (settings.target === 'html' || settings.name === 'xt-ajax') {
      // special case 'html' or ajax
      settings.$target = $(settings.target);
      settings.$group = settings.$target;
    } else if (settings.group) {
      // if 'group'
      settings.$group = $element.parents(settings.group);
      if (settings.target) {
        settings.$target = settings.$group.find(settings.target);
      }
    } else {
      // we search from $element
      settings.$group = $element;
      if (settings.target) {
        settings.$target = settings.$group.find(settings.target);
        // if not found we search from $element.parent()
        if (!settings.$target.length) {
          settings.$group = $element.parent();
          settings.$target = settings.$group.find(settings.target);
          // if not found we search parents for $target
          if (!settings.$target.length) {
            settings.$target = $element.parents(settings.target);
            settings.$group = settings.$target;
          }
        }
      }
    }
    // initialized
    $element.attr('data-xt-initialized', settings.name);
    // $group unique id
		window.uuid = window.uuid ? window.uuid : 0;
    var uuid = settings.$group.attr('id') ? settings.$group.attr('id') : 'xt-id-' + window.uuid++;
    settings.$group.attr('id', uuid);
    // grouping and set namespace
    settings.namespace = settings.grouping + '_' + uuid + '_' + settings.class;
    $element.attr('data-xt-element-' + settings.name, settings.namespace);
  };
  
  Xt.prototype.setup = function() {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // ajax url
    if (settings.name === 'xt-ajax') {
      settings.url = $element.attr('href');
    }
    // $buttons based on $group and namespace
    var $buttons = this.getButtons();
    // groupIndex based on $buttons
    $buttons.each( function(i) {
      if ($(this).is($element)) {
        settings.groupIndex = i;
      }
    });
    // automatic $target based on groupIndex
    if (settings.$target && settings.$target.length > 1) {
      settings.$target = settings.$target.eq(settings.groupIndex);
    }
    // xt-height
    if (settings.$target && settings.$target.hasClass('xt-height')) {
      settings.$target.wrapInner('<div class="xt-height-inside"></div>');
    }
    // automatic init
    if (settings.url) {
      // init with settings.url
      var found;
      if (history.state && history.state.url) {
        // detect from history
        if (settings.url === history.state.url) {
          found = true;
        }
      } else {
        // detect from url location (absolute url without domain name)
        var loc = window.location.href.split('#')[0];
        loc = loc.replace(/https?:\/\/[^\/]+/i, '');
        if (loc === settings.url) {
          found = true;
        }
      }
      if (found) {
        // set ajaxified
        settings.title = settings.title ? settings.title : document.title;
        settings.$target.attr('data-xt-ajaxified', settings.url);
        this.pushstate();
        // then show
        this.show();
        // api
        settings.$target.trigger('ajax.init.xt', [object]);
      }
    } else {
      if ($element.hasClass(settings.class)) {
        // reinit if has class
        $element.removeClass(settings.class);
        this.show();
      }
      // after concurrent
      window.requestAnimFrame( function() {
        $buttons = object.getButtons();
        // init if $shown < min
        var min = settings.min;
        var $shown = $buttons.filter('.' + settings.class);
        if (settings.max === 3) {
          console.log($shown.length);
        }
        if ($shown.length < min) {
          object.show();
        }
      });
    }
    //console.log(':setup', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
  };
  
  Xt.prototype.events = function() {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // events
    if (settings.name === 'xt-scroll') {
      // scroll events
      var scrollNamespace = 'scroll.xt.' + settings.namespace;
      $(window).off(scrollNamespace);
      $(window).on(scrollNamespace, function(e) {
        var top = $(this).scrollTop();
        // show or hide
        var min = $element.parents('.xt-container').offset().top;
        var max = Infinity;
        if (settings.scrollTop) {
          min = $(settings.scrollTop).offset().top;
        }
        if (settings.scrollBottom) {
          max = $(settings.scrollBottom).offset().top;
        }
        if (top > min && top < max) {
          if (!$element.hasClass(settings.class)) {
            object.show();
            // direction classes
            $element.removeClass('scroll-hide-up scroll-hide-down');
            if (settings.scrollOld > top) {
              $element.removeClass('scroll-show-down');
              window.requestAnimFrame( function() {
                $element.addClass('scroll-show-up');
              });
            } else {
              $element.removeClass('scroll-show-up');
              window.requestAnimFrame( function() {
                $element.addClass('scroll-show-down');
              });
            }
          }
        } else {
          if ($element.hasClass(settings.class)) {
            object.hide();
            // direction classes
            $element.removeClass('scroll-show-up scroll-show-down');
            if (settings.scrollOld > top) {
              $element.removeClass('scroll-hide-down');
              window.requestAnimFrame( function() {
                $element.addClass('scroll-hide-up');
              });
            } else {
              $element.removeClass('scroll-hide-up');
              window.requestAnimFrame( function() {
                $element.addClass('scroll-hide-down');
              });
            }
          }
        }
        settings.scrollOld = top;
        //console.log(':scroll.xt', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), top, min, max);
      });
      $(window).trigger(scrollNamespace);
      // remove window event on remove
      $element.on('xtRemoved', function(e) {
        $(window).off(scrollNamespace);
      });
    } else {
      // toggle events
      $element.on(settings.on, function(e) {
        object.toggle();
        if (settings.url) {
          e.preventDefault();
        }
      });
      $element.on(settings.off, function(e) {
        object.toggle();
      });
    }
    // triggers
    $element.on('toggle.xt', function(e, obj, triggered) {
      if (!triggered && e.target === this) {
        object.toggle(true);
        console.log($element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""));
      }
    });
    $element.on('show.xt', function(e, obj, triggered) {
      if (!triggered && e.target === this) {
        object.show(true);
      }
    });
    $element.on('hide.xt', function(e, obj, triggered) {
      if (!triggered && e.target === this) {
        object.hide(true);
      }
    });
    // remove html classes on remove
    if ($element.is('[data-xt-reset]') || settings.target === 'html') {
      $element.on('xtRemoved', function(e) {
        object.hide(false, true, true);
      });
    }
    //console.log(':events', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
  };
  
  // methods
  
  Xt.prototype.getButtons = function() {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // get $buttons on $group based on namespace
    var $buttons = settings.$group.find('[data-xt-element-' + settings.name + '="' + settings.namespace + '"]').filter(':parents(.xt-ignore)');
    return $buttons;
  };
  
  Xt.prototype.getCurrents = function() {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // get $currents on $group data
    var $currents = settings.$group.data('$currents_' + settings.namespace) || $([]);
    return $currents;
  };
  
  Xt.prototype.setCurrents = function($currents) {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // set $currents on $group data
    settings.$group.data('$currents_' + settings.namespace, $currents);
    return $currents;
  };
  
  // toggle
  Xt.prototype.toggle = function(triggered, isSync, skipState) {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // choose based on state
    var $buttons = this.getButtons();
    if (!$element.hasClass(settings.class)) {
      this.show(triggered, isSync, skipState);
      if (!settings.url) {
        // xt sync
        $buttons.each( function(i) {
          var xt = $(this).data(settings.type);
          if (xt.settings.$target && xt.settings.$target.is(settings.$target)) {
            xt.show(triggered, true, skipState);
          }
        });
      }
    } else {
      if (!settings.url) {
        this.hide(triggered, isSync, skipState);
        // xt sync
        $buttons.each( function(i) {
          var xt = $(this).data(settings.type);
          if (xt.settings.$target && xt.settings.$target.is(settings.$target)) {
            xt.hide(triggered, true, skipState);
          }
        });
      }
    }
    // api
    if (!triggered) {
      $element.trigger('toggle.xt', [object, true]);
      if (settings.$target) {
        settings.$target.trigger('toggle.xt', [object, true]);
      }
    }
  };
  
  Xt.prototype.show = function(triggered, isSync, skipState) {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // filter
    if (!$element.hasClass(settings.class)) {
      var $currents = this.getCurrents();
      var triggerTarget;
      // show and add in $currents
      $element.addClass(settings.class);
      $currents = this.setCurrents($currents.pushElement($element));
      if (settings.$target && !settings.$target.hasClass(settings.class)) {
        triggerTarget = true;
        settings.$target.addClass(settings.class);
        if (settings.$target.hasClass('xt-height')) {
          var h = settings.$target.find('.xt-height-inside').outerHeight();
          settings.$target.css("height", h);
          settings.$target.parents('.xt-height-top').css("margin-top", -h);
          settings.$target.parents('.xt-height-bottom').css("margin-bottom", -h);
        }
      }
      // control over activated
      if (settings.url) {
        // [disabled]
        this.checkDisabled('disable');
        // ajax
        object.ajax(triggered, isSync, skipState);
      } else {
        // [disabled]
        this.checkDisabled();
        // hide max or differents
        if (!isSync) {
          if ($currents.length > settings.max) {
            var xt = $currents.first().data(settings.type);
            if (xt) {
              xt.hide();
            }
          }
        }
      }
      // api
      if (!triggered) {
        $element.trigger('show.xt', [object, true]);
        if (triggerTarget) {
          settings.$target.trigger('show.xt', [object, true]);
        }
      }
      //console.log(':show', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
    }
  };
  
  Xt.prototype.hide = function(triggered, isSync, skipState) {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // filter
    if ($element.hasClass(settings.class)) {
      var $currents = this.getCurrents();
      var triggerTarget;
      // hide and remove from $currents
      if (isSync || settings.url || $currents.length > settings.min) {
        $element.removeClass(settings.class);
        $currents = this.setCurrents($currents.not(element));
        if (settings.$target && settings.$target.hasClass(settings.class)) {
          triggerTarget = true;
          settings.$target.removeClass(settings.class);
          if (settings.$target.hasClass('xt-height')) {
            settings.$target.css("height", 0);
            settings.$target.parents('.xt-height-top').css("margin-top", 0);
            settings.$target.parents('.xt-height-bottom').css("margin-bottom", 0);
          }
        }
      }
      // [disabled]
      if (isSync || settings.url) {
        this.checkDisabled('enable');
      } else {
        this.checkDisabled();
      }
      // api
      if (!triggered) {
        $element.trigger('hide.xt', [object, true]);
        if (triggerTarget) {
          settings.$target.trigger('hide.xt', [object, true]);
        }
      }
      //console.log(':hide', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
    }
  };
  
  Xt.prototype.checkDisabled = function(force) {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // manage [disabled] attribute
    if (settings.on === 'click') {
      if (!force) {
        // automatic based on max
        var $currents = this.getCurrents();
        var min = settings.min;
        if ($currents.length === min) {
          $currents.attr('disabled', '');
        } else {
          $currents.removeAttr('disabled');
        }
      } else if (force === 'disable') {
        // force disable
        $element.attr('disabled', '');
      } else if (force === 'enable') {
        // force enable
        $element.removeAttr('disabled');
      }
    }
  };
  
  // ajax and pushstate
  
  Xt.prototype.ajax = function(triggered, isSync, skipState) {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // do ajax only one time
    if (settings.$target.attr('data-xt-ajaxified') !== settings.url) {
      // ajax
      $.ajax({
        type: 'GET',
        url: settings.url,
        success: function(data, textStatus, jqXHR) {
          var $data = $('<div />').html(data);
          // api
          settings.$target.trigger('ajax.success.xt', [object, $data]);
          // populate
          var $html = $data.find(settings.target).contents();
          settings.$target.html($html);
          settings.$target.attr('data-xt-ajaxified', settings.url);
          // pushstate
          if (!skipState) {
            settings.title = settings.title ? settings.title : $data.find('title').text();
            object.pushstate(true);
          }
          // api
          settings.$target.trigger('ajax.populated.xt', [object, $data]);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error('ajax error url:' + settings.url + ' ' + errorThrown);
        }
      });
    }
  };
  
  Xt.prototype.pushstate = function(triggered) {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // if no state or if the state is new
    var title = settings.title;
    if (!history.state || !history.state.url || history.state.url !== settings.url) {
      var url = settings.url;
      // push this object state
      history.pushState({'url': url, 'title': title}, title, url);
      // trigger on registered
      $(document).find('[data-xt-initialized="xt-ajax"]').filter(':parents(.xt-ignore)').each( function(i) {
        var xt = $(this).data(settings.type);
        if (xt) {
          xt.pushstateListener(url, triggered);
        }
      });
      //console.log(':pushstate', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
    }
    document.title = title; // also when no history.state
  };
  
  Xt.prototype.pushstateListener = function(url, triggered) {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // triggered pushstate
    if (settings.url === url) {
      object.show(triggered, false, true);
      //console.log(':push:show', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
    } else {
      object.hide(triggered, false, true);
      //console.log(':push:hide', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
    }
  };

  //////////////////////
  // utils
  //////////////////////
  
  // onpopstate trigger window.pushstate
  window.onpopstate = function(history) {
    if (history.state && history.state.url) {
      document.title = history.state.title;
      // trigger on registered
      $(document).find('[data-xt-initialized="xt-ajax"]').filter(':parents(.xt-ignore)').each( function(i, element) {
        var xt = $(this).data('plugin_xtAjax');
        xt.pushstateListener(history.state.url);
      });
    }
  };
  
  // https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimFrame = ( function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();
  
  // http://stackoverflow.com/questions/13281897/how-to-preserve-order-of-items-added-to-jquery-matched-set
  // push jquery element inside jquery query, use $([]) for empty query
  // usage: $elements.pushElement($element)
  $.fn.pushElement = function($element) {
    Array.prototype.push.apply(this, $element);
    return this;
  };
  
  // http://stackoverflow.com/questions/2200494/jquery-trigger-event-when-an-element-is-removed-from-the-dom
  // xtRemoved event fired when an element is removed from DOM
  $.event.special.xtRemoved = {
    remove: function(o) {
      if (o.handler) { o.handler(); }
    }
  };
  
  // http://stackoverflow.com/questions/965816/what-jquery-selector-excludes-items-with-a-parent-that-matches-a-given-selector
  // filter out $elements with :parents(.classname)
  // usage: $elements.filter(':parents(.xt-ignore)')
  $.expr[':'].parents = function(a, i, m){
    return $(a).parents(m[3]).length < 1;
  };

})(jQuery, window, document);