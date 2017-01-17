/*! xtend v0.0.5 (http://)
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
    this._defaults = defaults;
    this.init();
  };
  $.fn.xt = function(options) {
    var defaults = {
      'type': 'xt',
      'on': 'click',
      'target': '',
      'class': 'active',
      'group': '',
      'grouping': 'xt',
      'min': 0,
      'max': 1,
    };
    return this.each( function() {
      if (!$.data(this, 'xt_xt')) {
        $.data(this, 'xt_xt', new Xt(this, options, defaults));
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
      'type': 'ajax',
      'on': 'click',
      'target': '',
      'class': 'active',
      'group': '',
      'grouping': 'xt',
      'url': 'href',
    };
    return this.each( function() {
      if (!$.data(this, 'xt_ajax')) {
        $.data(this, 'xt_ajax', new XtAjax(this, options, defaults));
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
      'type': 'toggle',
      'on': 'click',
      'target': '',
      'class': 'active',
      'group': '',
      'grouping': 'xt',
      'min': 0,
      'max': 1,
    };
    return this.each( function() {
      if (!$.data(this, 'xt_toggle')) {
        $.data(this, 'xt_toggle', new XtToggle(this, options, defaults));
      }
    });
  };
  
  // subclass collapse
  var XtCollapse = function(element, options, defaults) {
    Xt.call(this, element, options, defaults);
  };
  XtCollapse.prototype = Object.create(Xt.prototype);
  XtCollapse.prototype.constructor = XtCollapse;
  $.fn.xtCollapse = function(options) {
    var defaults = {
      'type': 'collapse',
      'on': 'click',
      'target': '',
      'class': 'active',
      'group': '',
      'grouping': 'xt',
      'min': 1,
      'max': 1,
    };
    return this.each( function() {
      if (!$.data(this, 'xt_collapse')) {
        $.data(this, 'xt_collapse', new XtCollapse(this, options, defaults));
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
      'type': 'scroll',
      'on': 'scroll',
      'target': '',
      'class': 'active',
      'group': '',
      'grouping': 'xt',
      'min': 0,
      'max': 1,
      '$clone': null,
    };
    return this.each( function() {
      if (!$.data(this, 'xt_scroll')) {
        $.data(this, 'xt_scroll', new XtScroll(this, options, defaults));
      }
    });
  };
  
  //////////////////////
  // jquery init
  //////////////////////
  
  $.fn.xtInit = function() {
    return this.each( function() {
      $(this).find('[data-xt]').xt();
      $(this).find('[data-xt-ajax]').xtAjax();
      $(this).find('[data-xt-toggle]').xtToggle();
      $(this).find('[data-xt-collapse]').xtCollapse();
      $(this).find('[data-xt-scroll]').xtScroll();
    });
  };
  
  $(document).ready( function() {
    // init if not manualInit
    if (!$.fn.xt.manualInit) {
      $('html').xtInit();
    }
  });
  
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
    var override = $element.data('xt-' + settings.type);
    if (settings.type === 'xt') {
      override = $element.data('xt');
    }
    if (override) {
      $.extend(settings, override);
    }
    // scoping and events before setup
    this.scoping();
    this.events();
    // setup
    window.requestAnimFrame( function() {
      object.setup();
    });
    //console.log(':init', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
  };
  
  Xt.prototype.scoping = function() {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // $group and target
    if (settings.target && settings.group) {
      settings.$group = $element.parents(settings.group);
      settings.$target = settings.$group.find(settings.target);
    } else {
      /* @TODO not sure if with or without
      if ($element.closest('[id]')) {
        settings.$group = $element.closest('[id]');
        settings.$target = settings.$group.find(settings.target);
      } else {*/
      if (settings.target) {
        settings.$target = $(settings.target);
        settings.$group = settings.$target.parent();
      } else {
        settings.$group = $element.parent();
      }
      //}
    }
    // set namespace
    settings.namespace = settings.grouping + '_' + settings.group;
    $element.attr('data-xt-button', settings.namespace);
  };
  
  Xt.prototype.setup = function() {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // ajax url
    if (settings.url === 'href') {
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
    if (settings.target && settings.$target.length > 1) {
      settings.$target = settings.$target.eq(settings.groupIndex);
    }
    // init if has class
    if ($element.hasClass(settings.class)) {
      this.show();
    }
    // automatic init
    if (settings.url) {
      // register data-xt-pushstate on element
      $element.attr('data-xt-pushstate', 'true');
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
      // init if $shown < min
      var min = settings.min;
      var $shown = $buttons.filter('.' + settings.class);
      if ($shown.length < min) {
        this.show();
      }
    }
    //console.log(':setup', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
  };
  
  Xt.prototype.events = function() {
    var object = this;
    var settings = this.settings;
    var element = this.element;
    var $element = $(this.element);
    // events
    if (settings.type === 'scroll') {
      // scroll events
      if (!settings.$clone) {
        $element.wrap($('<div class="box xt-container"></div>'));
        settings.$clone = $element.clone().addClass('box xt-ignore').css('visibility', 'hidden').css('display', 'none');
        $.each(settings.$clone.data(), function (i) {
          settings.$clone.removeAttr("data-" + i);
        });
        settings.$clone.insertAfter($element);
      }
      var scrollNamespace = 'scroll.xt.' + settings.namespace;
      $(window).off(scrollNamespace);
      $(window).on(scrollNamespace, function() {
        var $container = $(this);
        var top = $container.scrollTop();
        var min = $element.parents('.xt-container').offset().top;
        var max = Infinity;
        if (settings.scrollTop) {
          min = $(settings.scrollTop).offset().top;
        }
        if (settings.scrollBottom) {
          max = $(settings.scrollBottom).offset().top;
        }
        if (top > min && top < max) {
          object.show();
          settings.$clone.css('display', 'block');
        } else {
          object.hide();
          settings.$clone.css('display', 'none');
        }
        //console.log(':scroll.xt', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), top, min, max);
      });
      $(window).trigger(scrollNamespace);
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
      // [data-xt-resetonajax] hides on ajax
      if ($element.is('[data-xt-resetonajax]')) {
        $(document).on('ajax.success.xt', function(e, obj, $data) {
          object.hide(true, false, true);
        });
      }
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
    var $buttons = settings.$group.find('[data-xt-button="' + settings.namespace + '"]').filter(':parents(.xt-ignore)');
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
          var xt = $(this).data('xt_' + settings.type);
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
          var xt = $(this).data('xt_' + settings.type);
          if (xt.settings.$target && xt.settings.$target.is(settings.$target)) {
            xt.hide(triggered, true, skipState);
          }
        });
      }
    }
    // api
    if (!triggered) {
      $element.trigger('toggle.xt', [object]);
      if (settings.target) {
        settings.$target.trigger('toggle.xt', [object]);
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
      if (settings.target && !settings.$target.hasClass(settings.class)) {
        triggerTarget = true;
        settings.$target.addClass(settings.class);
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
            var xt = $currents.first().data('xt_' + settings.type);
            if (xt) {
              xt.hide();
            }
          }
        }
      }
      // api
      if (!triggered) {
        $element.trigger('show.xt', [object]);
        if (triggerTarget) {
          settings.$target.trigger('show.xt', [object]);
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
        if (settings.target && settings.$target.hasClass(settings.class)) {
          triggerTarget = true;
          settings.$target.removeClass(settings.class);
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
        $element.trigger('hide.xt', [object]);
        if (triggerTarget) {
          settings.$target.trigger('hide.xt', [object]);
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
    var $currents = this.getCurrents();
    if (!force) {
      // automatic based on max
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
          settings.$target.trigger('ajax.done.xt', [object, $data]);
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
      // trigger on registered data-xt-pushstate
      $(document).find('[data-xt-pushstate]').filter(':parents(.xt-ignore)').each( function(i) {
        var xt = $(this).data('xt_' + settings.type);
        xt.pushstateListener(url, triggered);
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
      // trigger on registered data-xt-pushstate
      $(document).find('[data-xt-pushstate]').filter(':parents(.xt-ignore)').each( function(i, element) {
        var xt = $(this).data('xt_ajax');
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
  
  // http://stackoverflow.com/questions/965816/what-jquery-selector-excludes-items-with-a-parent-that-matches-a-given-selector
  // filter out $elements with :parents(.classname)
  // usage: $elements.filter(':parents(.xt-ignore)')
  $.expr[':'].parents = function(a, i, m){
    return $(a).parents(m[3]).length < 1;
  };

})(jQuery, window, document);