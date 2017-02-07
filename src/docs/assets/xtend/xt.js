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
    return this.each( function() {
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
      'targets': 'html',
      'multiple': true,
      'on': 'click',
      'class': 'overlay',
      'min': 0,
      'max': 1,
    };
    return this.each( function() {
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
    return this.each( function() {
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
    return this.each( function() {
      if (!$.data(this, defaults.name)) {
        $.data(this, defaults.name, new XtAjax(this, options, defaults));
      }
    });
  };
  
  
  //////////////////////
  // init
  //////////////////////
  
  $.fn.xtInitAll = function(deep) {
    return this.each( function() {
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
  // methods
  //////////////////////

  // init
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
    this.scoping(); // scoping before setup
    this.setup();
    this.events(); // events after setup
  };
  
  Xt.prototype.scoping = function() {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // $group
    if (settings.name === 'xt-scroll') {
      $group.wrap($('<div class="xt-container"></div>'));
      $group.addClass('xt-fixed');
    }
    // $elements
    if (settings.elements) {
      settings.$elements = $group.find(settings.elements).filter(':parents(.xt-ignore)');
      if (!settings.$elements.length) {
        settings.$elements = $(settings.elements).filter(':parents(.xt-ignore)');
      }
    } else {
      settings.$elements = $group;
    }
    // $targets
    if (settings.name === 'xt-scroll') {
      settings.$targets = $group.clone().addClass('xt-clone xt-ignore');
      $.each(settings.$targets.data(), function (i) {
        settings.$targets.removeAttr("data-" + i);
      });
      settings.$targets.insertAfter($group);
    } else if(settings.targets) {
      settings.$targets = $group.find(settings.targets).filter(':parents(.xt-ignore)');
      if (!settings.$targets.length) {
        settings.$targets = $(settings.targets).filter(':parents(.xt-ignore)');
      }
    }
    // initialized
    $group.attr('data-xt-initialized', settings.name);
    // $group unique id
		window.xtUniqueId = window.xtUniqueId ? window.xtUniqueId : 0;
    var xtUniqueId = $group.attr('id') ? $group.attr('id') : 'xtUniqueId' + window.xtUniqueId++;
    $group.attr('id', xtUniqueId);
    // namespace
    settings.namespace = settings.name + '_' + xtUniqueId + '_' + settings.class;
    $group.attr('data-xt-group-' + settings.name, settings.namespace);
  };
  
  Xt.prototype.setup = function() {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // xt-height
    if (settings.$targets) {
      settings.$targets.each( function() {
        if ($(this).hasClass('xt-height')) {
          $(this).wrapInner('<div class="xt-height-inside"></div>');
        }
      });
    }
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
      settings.$elements.each( function() {
        if ($(this).attr('href') === url) {
          found = $(this);
          return false;
        }
      });
      if (found) {
        // set ajaxified
        settings.$targets.attr('data-xt-ajaxified', url);
        this.pushstate(url, document.title);
        // then show
        this.show(found);
        // api
        settings.$targets.trigger('ajax.init.xt', [object]);
      }
    } else {
      // reinit if has class
      if (settings.$elements) {
        settings.$elements.each( function() {
          if ($(this).hasClass(settings.class)) {
            $(this).removeClass(settings.class);
            object.show($(this));
          }
        });
        // init if $shown < min
        var min = settings.min;
        var $currents = this.getCurrents();
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
      this.eventsScroll();
    } else {
      this.eventsDefault();
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
        settings.$elements.on(settings.on, function(e) {
          object.toggle($(this));
          if (settings.name === 'xt-ajax') {
            e.preventDefault();
          }
        });
      }
      if (settings.off) {
        settings.$elements.on(settings.off, function(e) {
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
      settings.$elements.on('show.xt', function(e, obj, triggered) {
        if (!triggered && e.target === this) {
          object.show($(this), true);
        }
      });
      settings.$elements.on('hide.xt', function(e, obj, triggered) {
        if (!triggered && e.target === this) {
          object.hide($(this), true);
        }
      });
    }
    // $targets events
    if (settings.$targets) {
      // custom events
      if (settings.name === 'xt-overlay') {
        // .xt-fixed scrollbar padding
        settings.$targets.on('show.xt hide.xt', function(e, obj, $data) {
          if (e.target === this) {
            $(this).find('.xt-fixed').css('padding-right', window.xtScrollbarWidth($group));
          }
        });
      }
    }
    // ajax events
    if (settings.name === 'xt-ajax') {
      // popstate
      $(window).off('popstate.xt.' + settings.namespace);
      $(window).on('popstate.xt.' + settings.namespace, function(e) {
        if (history.state && history.state.url) {
          object.ajax(history.state.url, history.state.title);
          console.log(history.state.url);
        }
      });
    }
  };
  
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
      var top = settings.$targets.offset().top;
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
        } else {
          bottom = $(settings.bottom).offset().top;
        }
      }
      if (scrollTop > top && scrollTop < bottom) {
        if (!$group.hasClass(settings.class)) {
          object.show($group);
          // direction classes
          $group.removeClass('scroll-off-top scroll-off-bottom');
          if (settings.scrollTopOld > scrollTop) {
            $group.removeClass('scroll-on-top');
            window.xtRequestAnimationFrame( function() {
              $group.addClass('scroll-on-bottom');
            });
          } else {
            $group.removeClass('scroll-on-bottom');
            window.xtRequestAnimationFrame( function() {
              $group.addClass('scroll-on-top');
            });
          }
        }
      } else {
        if ($group.hasClass(settings.class)) {
          object.hide($group);
          // direction classes
          $group.removeClass('scroll-on-top scroll-on-bottom');
          if (settings.scrollTopOld > scrollTop) {
            $group.removeClass('scroll-off-top');
            window.xtRequestAnimationFrame( function() {
              $group.addClass('scroll-off-bottom');
            });
          } else {
            $group.removeClass('scroll-off-bottom');
            window.xtRequestAnimationFrame( function() {
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
  
  // methods
  
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
  
  // toggle
  
  Xt.prototype.toggle = function($element, triggered, isSync, skipState) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // choose based on state
    if (!$element.hasClass(settings.class)) {
      if (settings.multiple) {
        settings.$elements.each( function(i) {
          object.show($(this), triggered, true, skipState);
        });
      } else {
        this.show($element, triggered, isSync, skipState);
      }
    } else {
      if (settings.multiple) {
        settings.$elements.each( function(i) {
          object.hide($(this), triggered, true, skipState);
        });
      } else {
        this.hide($element, triggered, isSync, skipState);
      }
    }
  };
  
  Xt.prototype.show = function($element, triggered, isSync, skipState) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // activate $element
    var triggerElement;
    if ($element) {
      // show and add in $currents
      if (!$element.hasClass(settings.class)) {
        triggerElement = true;
        var $currents = this.getCurrents();
        $element.addClass(settings.class);
        $currents = this.setCurrents($currents.xtPushElement($element));
        // control over activated
        if (settings.name === 'xt-ajax') {
          // [disabled]
          this.checkDisabled($element, 'disable');
          // ajax
          object.ajax($element.attr('href'));
        } else {
          // [disabled]
          this.checkDisabled($element);
          // hide max or differents
          if (!isSync) {
            if ($currents.length > settings.max) {
              this.hide($currents.first());
            }
          }
        }
      }
    }
    // activate $target
    var $target;
    var triggerTarget;
    if (settings.$targets) {
      var index = this.getIndex(settings.$elements, $element);
      index = index >= settings.$targets.length ? settings.$targets.length - 1 : index;
      $target = settings.$targets.eq(index);
      if (!$target.hasClass(settings.class)) {
        triggerTarget = true;
        $target.addClass(settings.class);
        if ($target.hasClass('xt-height')) {
          var h = $target.find('.xt-height-inside').outerHeight();
          $target.css("height", h);
          $target.parents('.xt-height-top').css("margin-top", -h);
          $target.parents('.xt-height-bottom').css("margin-bottom", -h);
        }
      }
    }
    // api
    if (!triggered) {
      if (triggerElement) {
        $element.trigger('show.xt', [object, true]);
      }
      if (triggerTarget) {
        $target.trigger('show.xt', [object, true]);
      }
    }
  };
  
  Xt.prototype.hide = function($element, triggered, isSync, skipState) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // activate $element
    var triggerElement;
    if ($element) {
      if ($element.hasClass(settings.class)) {
        var $currents = this.getCurrents();
        if (isSync || settings.name === 'xt-ajax' || $currents.length > settings.min) {
          triggerElement = true;
          $element.removeClass(settings.class);
          $currents = this.setCurrents($currents.not($element.get(0)));
        }
        // [disabled]
        if (isSync || settings.name === 'xt-ajax') {
          this.checkDisabled($element, 'enable');
        } else {
          this.checkDisabled($element);
        }
        // api
        if (!triggered) {
          $element.trigger('hide.xt', [object, true]);
        }
      }
    }
    // activate $target
    var $target;
    var triggerTarget;
    if (settings.$targets) {
      var index = this.getIndex(settings.$elements, $element);
      index = index >= settings.$targets.length ? settings.$targets.length - 1 : index;
      $target = settings.$targets.eq(index);
      if ($target.hasClass(settings.class)) {
        triggerTarget = true;
        $target.removeClass(settings.class);
        if ($target.hasClass('xt-height')) {
          $target.css("height", 0);
          $target.parents('.xt-height-top').css("margin-top", 0);
          $target.parents('.xt-height-bottom').css("margin-bottom", 0);
        }
      }
    }
    // api
    if (!triggered) {
      if (triggerElement) {
        $element.trigger('hide.xt', [object, true]);
      }
      if (triggerTarget) {
        $target.trigger('hide.xt', [object, true]);
      }
    }
  };
  
  Xt.prototype.getIndex = function($elements, $element) {
    var index = 0;
    if ($elements && $element) {
      $elements.each( function(i) {
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
    settings.$elements.filter('[href="' + url + '"]').each( function(i) {
      object.show($(this), true, false, true);
    });
    // push this object state
    if (!history.state || !history.state.url || history.state.url !== url) {
      history.pushState({'url': url, 'title': title}, title, url);
    }
  };
  
  //////////////////////
  // utils
  //////////////////////
  
  // xtScrollbarWidth
  window.xtScrollbarWidth = function($el) {
    var parent, child, width;
    if(width === undefined) {
      parent = $('<div style="width:50px; height:50px; overflow:auto;"><div /></div>').appendTo($el);
      child = parent.children();
      width = child.innerWidth() - child.height(99).innerWidth();
      parent.remove();
    }
    return width;
  };
  
  // https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.xtRequestAnimationFrame = ( function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();
  
  // http://stackoverflow.com/questions/13281897/how-to-preserve-order-of-items-added-to-jquery-matched-set
  // push jquery group inside jquery query, use $([]) for empty query
  // usage: $groups.xtPushElement($group)
  $.fn.xtPushElement = function($el) {
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
  
})(jQuery, window, document);