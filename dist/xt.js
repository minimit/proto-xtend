/*! xtend v0.0.6 (http://www.minimit.com/xtend/)
@copyright (c) 2016 - 2017 Riccardo Caroli
@license MIT (https://github.com/minimit/xtend/blob/master/LICENSE) */

;(function($, window, document, undefined) {

  'use strict';
  
  //////////////////////
  // constructor
  //////////////////////
  
  var Xt = function(group, options, defaults) {
    this.group = group;
    this.settings = $.extend({}, defaults, options);
    this.init();
  };
  
  var XtToggle = function(group, options, defaults) {
    Xt.call(this, group, options, defaults);
  };
  XtToggle.prototype = Object.create(Xt.prototype);
  XtToggle.prototype.constructor = XtToggle;
  $.fn.xtToggle = function(options) {
    var defaults = {
      'name': 'xt-toggle',
      'elements': null,
      'targets': null,
      'multiple': false,
      'class': 'active',
      'on': 'click',
      'off': null,
      'min': 0,
      'max': 1,
    };
    return this.each(function() {
      if (!$.data(this, defaults.name)) {
        $.data(this, defaults.name, new XtToggle(this, options, defaults));
      }
    });
  };
  
  var XtOverlay = function(group, options, defaults) {
    Xt.call(this, group, options, defaults);
  };
  XtOverlay.prototype = Object.create(Xt.prototype);
  XtOverlay.prototype.constructor = XtOverlay;
  $.fn.xtOverlay = function(options) {
    var defaults = {
      'name': 'xt-overlay',
      'targets': '',
      'multiple': true,
      'on': 'click',
      'class': 'overlay',
      'min': 0,
      'max': 1,
    };
    return this.each(function() {
      if (!$.data(this, defaults.name)) {
        $.data(this, defaults.name, new XtOverlay(this, options, defaults));
      }
    });
  };
  
  var XtScroll = function(group, options, defaults) {
    Xt.call(this, group, options, defaults);
  };
  XtScroll.prototype = Object.create(Xt.prototype);
  XtScroll.prototype.constructor = XtScroll;
  $.fn.xtScroll = function(options) {
    var defaults = {
      'name': 'xt-scroll',
      'on': 'scroll',
      'class': 'scroll',
      'min': 0,
      'max': 1,
    };
    return this.each(function() {
      if (!$.data(this, defaults.name)) {
        $.data(this, defaults.name, new XtScroll(this, options, defaults));
      }
    });
  };
  
  var XtAjax = function(group, options, defaults) {
    Xt.call(this, group, options, defaults);
  };
  XtAjax.prototype = Object.create(Xt.prototype);
  XtAjax.prototype.constructor = XtAjax;
  $.fn.xtAjax = function(options) {
    var defaults = {
      'name': 'xt-ajax',
      'targets': null,
      'on': 'click',
      'class': 'active',
      'url': null,
    };
    return this.each(function() {
      if (!$.data(this, defaults.name)) {
        $.data(this, defaults.name, new XtAjax(this, options, defaults));
      }
    });
  };
  
  
  //////////////////////
  // init
  //////////////////////
  
  $.fn.xt = {
    'uid': 0
  };
  
  $.fn.xtInitAll = function(deep) {
    return this.each(function() {
      if ($(this).is('[data-xt-toggle]')) {
        $(this).xtToggle();
      }
      if ($(this).is('[data-xt-overlay]')) {
        $(this).xtOverlay();
      }
      if ($(this).is('[data-xt-scroll]')) {
        $(this).xtScroll();
      }
      if ($(this).is('[data-xt-ajax]')) {
        $(this).xtAjax();
      }
      if (deep) {
        $(this).find('[data-xt-toggle]').xtToggle();
        $(this).find('[data-xt-overlay]').xtOverlay();
        $(this).find('[data-xt-scroll]').xtScroll();
        $(this).find('[data-xt-ajax]').xtAjax();
      }
    });
  };
  
  //////////////////////
  // init methods
  //////////////////////

  Xt.prototype.init = function() {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // variables
    if ($group.attr('debug') || $group.attr('debug') === '') {
      settings.debug = true;
    }
    // override with html settings
    $.extend(settings, $group.data(settings.name));
    // setup
    object.scoping(); // scoping before setup
    object.setup();
    object.events(); // events after setup
  };
  
  Xt.prototype.scoping = function() {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // $elements
    if (settings.elements) {
      if (settings.elements.indexOf('#') !== -1) {
        settings.$elements = $(settings.elements).filter(':parents(.xt-ignore)');
      } else {
        settings.$elements = $group.find(settings.elements).filter(':parents(.xt-ignore)');
        if (!settings.$elements.length) {
          settings.$elements = $group.parent().find(settings.elements).filter(':parents(.xt-ignore)');
        }
      }
    } else {
      settings.$elements = $group;
    }
    // $targets
    if (settings.name === 'xt-scroll') {
      // xt-scroll $targets
      $group.wrap($('<div class="xt-container"></div>'));
      settings.$targets = $group.clone().addClass('xt-clone xt-ignore').css('visibility', 'hidden');
      $.each(settings.$targets.data(), function (i) {
        settings.$targets.removeAttr("data-" + i);
      });
      settings.$targets.insertAfter($group);
      // stuff
      if (settings.mode === 'absolute') {
        $group.css('position', 'absolute');
      } else if (settings.mode === 'fixed') {
        $group.css('position', 'fixed');
      }
      if ($group.is(':fixed') || $group.is(':absolute')) {
        $group.css('z-index', 70);
        settings.$targets.css('display', 'block');
      } else {
        settings.$targets.css('display', 'none');
      }
    } else if(settings.targets) {
      if (settings.targets.indexOf('#') !== -1) {
        settings.$targets = $(settings.targets).filter(':parents(.xt-ignore)');
      } else {
        settings.$targets = $group.find(settings.targets).filter(':parents(.xt-ignore)');
        if (!settings.$targets.length) {
          settings.$targets = $group.parent().find(settings.targets).filter(':parents(.xt-ignore)');
        }
      }
    }
    // namespace
    if (settings.targets && settings.targets.indexOf('#') !== -1) {
      settings.uid = settings.targets;
    } else if($group.attr('id')) {
      settings.uid = $group.attr('id');
    } else {
      settings.uid = 'unique' + $.fn.xt.uid++;
    }
    settings.namespace = settings.name + '_' + settings.uid + '_' + settings.class;
    $group.attr('data-xt-namespace', settings.namespace);
  };
  
  Xt.prototype.setup = function() {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // initial activations
    if (settings.name === 'xt-ajax') {
      var url;
      var found;
      if (history.state && history.state.url) {
        // detect from history
        url = history.state.url;
      } else {
        // detect from url location (absolute url without domain name)
        var loc = window.location.href.split('#')[0];
        url = loc.replace(/https?:\/\/[^\/]+/i, '');
      }
      settings.$elements.each(function() {
        if ($(this).attr('href') === url) {
          found = $(this);
          return false;
        }
      });
      if (found) {
        // set ajaxified
        settings.$targets.attr('data-xt-ajaxified', url);
        object.pushstate(url, document.title);
        // then show
        object.show(found);
        // api
        settings.$targets.trigger('ajax.init.xt', [object]);
      }
    } else {
      // automatic reinit if has class
      if (settings.$elements) {
        settings.$elements.each(function() {
          if ($(this).hasClass(settings.class)) {
            $(this).removeClass(settings.class);
            object.show($(this));
          }
        });
        // automatic init if $shown < min
        var min = settings.min;
        var $currents = object.getCurrents();
        if ($currents.length < min) {
          object.show(settings.$elements.eq(0));
        }
      }
    }
  };
  
  Xt.prototype.events = function() {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // events
    if (settings.name === 'xt-scroll') {
      object.eventsScroll();
    } else {
      object.eventsDefault();
    }
  };
  
  Xt.prototype.eventsDefault = function() {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // $elements events
    if (settings.$elements) {
      // on off events
      if (settings.on) {
        settings.$elements.off(settings.on).on(settings.on, function(e) {
          object.toggle($(this));
          if (settings.name === 'xt-ajax') {
            e.preventDefault();
          }
        });
      }
      if (settings.off) {
        settings.$elements.off(settings.off).on(settings.off, function(e) {
          object.toggle($(this));
        });
      }
      // remove html classes on remove
      settings.$elements.on('xtRemoved', function(e) {
        if ($(this).is('[data-xt-reset]') || settings.targets === 'html') {
          object.hide($(this), false, true, true);
        }
      });
      // api
      settings.$elements.on('on.xt', function(e, obj, triggered) {
        if (!triggered && e.target === this) {
          object.show($(this), true);
        }
      });
      settings.$elements.on('off.xt', function(e, obj, triggered) {
        if (!triggered && e.target === this) {
          object.hide($(this), true);
        }
      });
    }
    // ajax events
    if (settings.name === 'xt-ajax') {
      // popstate
      $(window).off('popstate.xt.' + settings.namespace);
      $(window).on('popstate.xt.' + settings.namespace, function(e) {
        if (history.state && history.state.url) {
          object.ajax(history.state.url, history.state.title);
        }
      });
    }
  };
  
  //////////////////////
  // events methods
  //////////////////////

  Xt.prototype.eventsScroll = function() {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // scroll events
    var scrollNamespace = 'scroll.xt.' + settings.namespace;
    $(window).off(scrollNamespace);
    $(window).on(scrollNamespace, function(e) {
      var scrollTop = $(this).scrollTop();
      // show or hide
      var top = settings.$targets.parents('.xt-container').offset().top;
      var bottom = Infinity;
      if (settings.top) {
        if (!isNaN(parseFloat(settings.top))) {
          top = settings.top;
        } else {
          top = $(settings.top).offset().top;
        }
      }
      if (settings.bottom) {
        if (!isNaN(parseFloat(settings.bottom))) {
          bottom = settings.bottom;
        } else if ($(settings.bottom).length) {
          bottom = $(settings.bottom).offset().top;
        }
      }
      if (scrollTop > top && scrollTop < bottom) {
        if (!$group.hasClass(settings.class)) {
          window.xtRequestAnimationFrame(function() {
            object.show($group);
          });
          // direction classes
          $group.removeClass('scroll-off-top scroll-off-bottom');
          if (settings.scrollTopOld > scrollTop) {
            $group.removeClass('scroll-on-top');
            window.xtRequestAnimationFrame(function() {
              $group.addClass('scroll-on-bottom');
            });
          } else {
            $group.removeClass('scroll-on-bottom');
            window.xtRequestAnimationFrame(function() {
              $group.addClass('scroll-on-top');
            });
          }
        }
      } else {
        if ($group.hasClass(settings.class)) {
          window.xtRequestAnimationFrame(function() {
            object.hide($group);
          });
          // direction classes
          $group.removeClass('scroll-on-top scroll-on-bottom');
          if (settings.scrollTopOld > scrollTop) {
            $group.removeClass('scroll-off-top');
            window.xtRequestAnimationFrame(function() {
              $group.addClass('scroll-off-bottom');
            });
          } else {
            $group.removeClass('scroll-off-bottom');
            window.xtRequestAnimationFrame(function() {
              $group.addClass('scroll-off-top');
            });
          }
        }
      }
      settings.scrollTopOld = scrollTop;
    });
    $(window).trigger(scrollNamespace);
    // remove window event on remove
    $group.on('xtRemoved', function(e) {
      $(window).off(scrollNamespace);
    });
  };
  
  //////////////////////
  // toggle methods
  //////////////////////

  Xt.prototype.toggle = function($element, triggered, isSync, skipState) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // choose based on state
    if (!$element.hasClass(settings.class)) {
      object.show($element, triggered, isSync, skipState);
    } else {
      object.hide($element, triggered, isSync, skipState);
    }
  };
  
  Xt.prototype.show = function($element, triggered, isSync, skipState) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // activate $element
    if ($element) {
      // show and add in $currents
      if (!$element.hasClass(settings.class)) {
        object.on(object.getElements(settings.$elements, $element), triggered);
        var $currents = object.getCurrents();
        $currents = object.setCurrents($currents.pushElement($element));
        // linked
        if (!isSync) {
          var $linked = $('[data-xt-namespace="' + settings.namespace + '"]').filter(':parents(.xt-ignore)').not($group);
          $linked.each(function() {
            var xt = $(this).data(settings.name);
            xt.show($(this), true, true);
          });
        }
        // control over activated
        if (settings.name === 'xt-ajax') {
          // [disabled]
          object.checkDisabled($element, 'disable');
          // ajax
          object.ajax($element.attr('href'));
        } else {
          // [disabled]
          object.checkDisabled($element);
          // hide max or differents
          if (!isSync) {
            if ($currents.length > settings.max) {
              var $first = $currents.first();
              var g = $first.attr('data-group');
              object.hide($first);
            }
          }
        }
      }
    }
    // activate $target
    if (settings.$targets) {
      var $target = object.getTargets(settings.$elements, $element, settings.$targets);
      if (!$target.hasClass(settings.class)) {
        object.on($target, triggered);
        // stuff
        if (settings.name === 'xt-overlay') {
          $('html').addClass(settings.class);
          // add paddings
          object.onFixed($('*:fixed').not($target).add('html'));
          // activate $group
          if (!$group.hasClass(settings.class)) {
            object.on($group, triggered);
          }
        }
      }
    }
  };
  
  Xt.prototype.hide = function($element, triggered, isSync, skipState) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // deactivate $element
    if ($element) {
      var $currents = object.getCurrents();
      if ($element.hasClass(settings.class)) {
        if (isSync || settings.name === 'xt-ajax' || $currents.length > settings.min) {
          object.off(object.getElements(settings.$elements, $element), triggered);
          if ($element.attr('data-group')) {
            $currents = object.setCurrents($currents.not('[data-group=' + $element.attr('data-group') + ']'));
          } else {
            $currents = object.setCurrents($currents.not($element.get(0)));
          }
          // linked
          if (!isSync) {
            var $linked = $('[data-xt-namespace="' + settings.namespace + '"]').filter(':parents(.xt-ignore)').not($group);
            $linked.each(function() {
              var xt = $(this).data(settings.name);
              xt.hide($(this), true, true);
            });
          }
        }
        // [disabled]
        if (isSync || settings.name === 'xt-ajax') {
          object.checkDisabled($element, 'enable');
        } else {
          object.checkDisabled($element);
        }
      }
    }
    // deactivate $target
    if (settings.$targets) {
      var $target = object.getTargets(settings.$elements, $element, settings.$targets);
      if ($target.hasClass(settings.class)) {
        object.off($target, triggered);
        // stuff
        if (settings.name === 'xt-overlay') {
          $('html').removeClass(settings.class);
          // remove paddings
          object.offFixed($('.xt-fixed, html'));
          // deactivate $group
          if ($group.hasClass(settings.class)) {
            object.off($group, triggered);
          }
        }
      }
    }
  };
  
  //////////////////////
  // on and off methods
  //////////////////////
  
  Xt.prototype.on = function($el, triggered) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // on
    $el.addClass(settings.class);
    $el.removeClass('fadeout');
    clearTimeout($el.data('fadeout.timeout'));
    $el.off('transitionend.xt');
    // fadein
    if (settings.fadein || $el.css('transitionDuration') !== '0s') {
      window.xtRequestAnimationFrame(function() {
        $el.addClass('fadein');
        // api
        if (!triggered) {
          $el.trigger('fadein.xt', [object, true]);
        }
      });
    }
    // collapse-height fadein
    if ($el.hasClass('collapse-height')) {
      var $inside = $el.find('.collapse-height-inside');
      if (!$inside.length) {
        $el.wrapInner('<div class="collapse-height-inside"></div>');
        $inside = $el.find('.collapse-height-inside');
      }
      var h = $inside.outerHeight();
      $el.css('height', h);
      $el.parents('.collapse-top').css("margin-top", -h);
      $el.parents('.collapse-bottom').css("margin-bottom", -h);
    }
    // api
    if (!triggered) {
      $el.trigger('on.xt', [object, true]);
    }
  };
  
  Xt.prototype.off = function($el, triggered) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // off
    var realoff = function() {
      $el.removeClass(settings.class);
      $el.removeClass('fadeout');
      // api
      if (!triggered) {
        $el.trigger('fadeout.xt', [object, true]);
      }
    };
    $el.removeClass('fadein');
    $el.addClass('fadeout');
    // fadeout
    clearTimeout($el.data('fadeout.timeout'));
    if (settings.fadeout) {
      var timeout = window.setTimeout(function() {
        realoff();
      }, settings.fadeout);
      $el.data('fadeout.timeout', timeout);
    } else if ($el.css('transitionDuration') !== '0s') {
      $el.off('transitionend.xt').on('transitionend.xt', function(e) {
        if (e.target === this) {
          console.log($el, $el.css('transitionDuration'));
          realoff();
        }
      });
    } else {
      realoff();
    }
    /* only with setTimeout
    clearTimeout($el.data('fadeout.timeout'));
    var time;
    if (settings.fadeout) {
      time = settings.fadeout;
    } else if ($el.css('transitionDuration') !== '0s') {
      time = object.getTime($el.css('transitionDuration'));
    }
    if (time) {
      var timeout = window.setTimeout(function() {
        realoff();
      }, time);
      $el.data('fadeout.timeout', timeout);
    } else {
      realoff();
    }
    */
    // collapse-height fadeout
    if ($el.hasClass('collapse-height')) {
      $el.css('height', 0);
      $el.parents('.collapse-top').css("margin-top", 0);
      $el.parents('.collapse-bottom').css("margin-bottom", 0);
    }
    // api
    if (!triggered) {
      $el.trigger('off.xt', [object, true]);
    }
  };
  
  //////////////////////
  // utils methods
  //////////////////////

  Xt.prototype.getCurrents = function() {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // get $currents on $group data
    var $currents = $group.data('$currents_' + settings.namespace) || $([]);
    return $currents;
  };
  
  Xt.prototype.setCurrents = function($currents) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // set $currents on $group data
    $group.data('$currents_' + settings.namespace, $currents);
    return $currents;
  };
  
  Xt.prototype.getElements = function($elements, $element) {
    if ($element.is('[data-group]')) {
      // with [data-group]
      var group = $element.attr('data-group');
      return $elements.filter('[data-group="' + group + '"]');
    } else {
      // without [data-group]
      return $element;
    }
  };
  
  Xt.prototype.getTargets = function($elements, $element, $group) {
    if ($element.is('[data-group]')) {
      // with [data-group]
      var group = $element.attr('data-group');
      return $group.filter('[data-group="' + group + '"]');
    } else {
      // without [data-group]
      var index = this.getIndex($elements.not('[data-group]'), $element);
      return $group.not('[data-group]').eq(index);
    }
  };
  
  Xt.prototype.onFixed = function($el) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // add scrollbar padding
    var w = object.scrollbarWidth($el);
    w = $el.css('overflow-y') === 'hidden' ? 0 : w;
    $el.addClass('xt-fixed').css('padding-right', w).css('background-clip', 'content-box');
  };
  
  Xt.prototype.offFixed = function($el) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // remove scrollbar padding
    $el.removeClass('xt-fixed').css('padding-right', 0).css('background-clip', '');
  };
  
  Xt.prototype.getIndex = function($elements, $element) {
    var index = 0;
    if ($elements && $element) {
      $elements.each(function(i) {
        if ($(this).is($element.get(0))) {
          index = i;
          return false;
        }
      });
    }
    return index;
  };
  
  Xt.prototype.checkDisabled = function($element, force) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // manage [disabled] attribute
    if (settings.on === 'click') {
      if (!force) {
        // automatic based on max
        var $currents = object.getCurrents();
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
  
  Xt.prototype.scrollbarWidth = function($el) {
    var parent, child, width;
    if(width === undefined) {
      parent = $('<div style="width:50px; height:50px; overflow:auto;"><div /></div>').appendTo($el);
      child = parent.children();
      width = child.innerWidth() - child.height(99).innerWidth();
      parent.remove();
    }
    console.log(width);
    return width;
  };
  
  //////////////////////
  // ajax methods
  //////////////////////
  
  Xt.prototype.ajax = function(url, title) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // do ajax only one time
    if (settings.$targets.attr('data-xt-ajaxified') !== url) {
      // ajax
      $.ajax({
        type: 'GET',
        url: url,
        success: function(data, textStatus, jqXHR) {
          var $data = $('<div />').html(data);
          // api
          settings.$targets.trigger('ajax.success.xt', [object, $data]);
          // populate
          var $html = $data.find(settings.targets).contents();
          title = !title ? $data.find('title').text() : title;
          settings.$targets.html($html);
          settings.$targets.attr('data-xt-ajaxified', url);
          // reinit $elements and events
          object.scoping();
          object.events();
          // pushstate
          object.pushstate(url, title);
          // api
          settings.$targets.trigger('ajax.populated.xt', [object, $data]);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error('ajax error url:' + url + ' ' + errorThrown);
        }
      });
    }
  };
  
  Xt.prototype.pushstate = function(url, title) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // also when on popstate
    document.title = title;
    // trigger on registered
    settings.$elements.filter('[href="' + url + '"]').each(function(i) {
      object.show($(this), true, false, true);
    });
    // push object state
    if (!history.state || !history.state.url || history.state.url !== url) {
      history.pushState({'url': url, 'title': title}, title, url);
    }
  };
  
  //////////////////////
  // utils
  //////////////////////
  
  // https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.xtRequestAnimationFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();
  
  // http://stackoverflow.com/questions/13281897/how-to-preserve-order-of-items-added-to-jquery-matched-set
  // push jquery group inside jquery query, use $([]) for empty query
  // usage: $groups.pushElement($group)
  $.fn.pushElement = function($el) {
    Array.prototype.push.apply(this, $el);
    return this;
  };
  
  // http://stackoverflow.com/questions/2200494/jquery-trigger-event-when-an-group-is-removed-from-the-dom
  // xtRemoved event fired when an group is removed from DOM
  $.event.special.xtRemoved = {
    remove: function(o) {
      if (o.handler) { o.handler(); }
    }
  };
  
  // http://stackoverflow.com/questions/965816/what-jquery-selector-excludes-items-with-a-parent-that-matches-a-given-selector
  // filter out $groups with :parents(.classname)
  // usage: $groups.filter(':parents(.xt-ignore)')
  $.expr[':'].parents = function(a, i, m){
    return $(a).parents(m[3]).length < 1;
  };
  
  // select all elements with position: fixed;
  // usage: $('*:fixed')
  $.expr[':'].fixed = function(a, i, m){
    return $(a).css('position') === 'fixed';
  };
  
  // select all elements with position: absolute;
  // usage: $('*:absolute')
  $.expr[':'].absolute = function(a, i, m){
    return $(a).css('position') === 'absolute';
  };
  
})(jQuery, window, document);