/*! xtend v0.0.6 (http://www.minimit.com/xtend/)
@copyright (c) 2016 - 2017 Riccardo Caroli
@license MIT (https://github.com/minimit/xtend/blob/master/LICENSE) */

;( function($, window, document, undefined) {

  'use strict';
  
  //////////////////////
  // constructor
  //////////////////////

  var Xt = function(group, defaults, options) {
    this.group = group;
    this.init(defaults, options);
  };
  
  var XtToggle = function(group, defaults, options) {
    Xt.call(this, group, defaults, options);
  };
  XtToggle.prototype = Object.create(Xt.prototype);
  XtToggle.prototype.constructor = XtToggle;
  $.fn.xtToggle = function(options) {
    var defaults = {
      'name': 'xt-toggle',
      'elements': null,
      'targets': '.toggle-flex, .toggle-block, .toggle-inline-block, .toggle-inline, .toggle-none',
      'class': 'active',
      'on': 'click',
      'off': null,
      'min': 0,
      'max': 1,
      'animated': null,
    };
    return this.each( function() {
      if (!$.data(this, defaults.name)) {
        $.data(this, defaults.name, new XtToggle(this, defaults, options));
      }
    });
  };
  
  var XtOverlay = function(group, defaults, options) {
    Xt.call(this, group, defaults, options);
  };
  XtOverlay.prototype = Object.create(Xt.prototype);
  XtOverlay.prototype.constructor = XtOverlay;
  $.fn.xtOverlay = function(options) {
    var defaults = {
      'name': 'xt-overlay',
      'targets': '',
      'on': 'click',
      'class': 'active',
      'min': 0,
      'max': 1,
      'animated': '.inside .content',
    };
    return this.each( function() {
      if (!$.data(this, defaults.name)) {
        $.data(this, defaults.name, new XtOverlay(this, defaults, options));
      }
    });
  };
  
  var XtScroll = function(group, defaults, options) {
    Xt.call(this, group, defaults, options);
  };
  XtScroll.prototype = Object.create(Xt.prototype);
  XtScroll.prototype.constructor = XtScroll;
  $.fn.xtScroll = function(options) {
    var defaults = {
      'name': 'xt-scroll',
      'on': 'scroll',
      'class': 'active',
      'min': 0,
      'max': 1,
    };
    return this.each( function() {
      if (!$.data(this, defaults.name)) {
        $.data(this, defaults.name, new XtScroll(this, defaults, options));
      }
    });
  };
  
  var XtAjax = function(group, defaults, options) {
    Xt.call(this, group, defaults, options);
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
        $.data(this, defaults.name, new XtAjax(this, defaults, options));
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
  // init methods
  //////////////////////

  Xt.prototype.init = function(defaults, options) {
    var object = this;
    var settings = this.settings = {};
    var group = this.group;
    var $group = $(this.group);
    // override with js settings
    settings = $.extend(settings, defaults, options);
    // override with html settings
    $.extend(settings, $group.data(settings.name));
    // defaults.class
    var arr = settings.class.split(' ');
    if (arr.indexOf(defaults.class) === -1) {
      settings.class += ' ' + defaults.class;
    }
    object.defaultClass = defaults.class;
    // debug
    if ($group.attr('debug') || $group.attr('debug') === '') {
      settings.debug = true;
    }
    // setup
    object.scope();
    object.namespace();
    object.setup();
    object.events();
  };
  
  Xt.prototype.namespace = function() {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
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
  
  Xt.prototype.scope = function() {
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
        /*
        if (!settings.$elements.length) {
          settings.$elements = $group.parent().find(settings.elements).filter(':parents(.xt-ignore)');
        }
        */
      }
    } else {
      settings.$elements = $group;
    }
    // $targets
    if (settings.name === 'xt-scroll') {
      // wrapper
      var $outside = $group.parent('.xt-container.xt-position');
      if (!$outside.length) {
        $outside = $group.wrap($('<div class="xt-container xt-position"></div>'));
      }
      // xt-scroll $targets
      settings.$targets = $outside.find('.xt-clone.xt-ignore');
      if (!settings.$targets.length) {
        settings.$targets = $group.clone().addClass('xt-clone xt-ignore').css('visibility', 'hidden');
        $.each(settings.$targets.data(), function(i) {
          settings.$targets.removeAttr('data-' + i);
        });
        settings.$targets.insertAfter($group);
      }
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
        settings.$targets = $group.find(settings.targets).filter(':parents(.xt-ignore)').filter(':parents(' + settings.targets + ')');
        /*
        if (!settings.$targets.length) {
          settings.$targets = $group.parent().find(settings.targets).filter(':parents(.xt-ignore)');
        }
        */
      }
    }
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
      settings.$elements.each( function() {
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
        settings.$elements.each( function() {
          if ($(this).hasClass(object.defaultClass)) {
            $(this).removeClass(settings.class);
            object.show($(this));
          }
        });
        // automatic init if $currents < min
        var $currents = object.getCurrents();
        var todo = settings.min - $currents.length;
        if (todo) {
          for (var i = 0; i < todo; i++) {
            object.show(settings.$elements.eq(i));
          }
        }
      }
      if (settings.name === 'xt-overlay') {
        settings.$targets.appendTo('body');
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
      // remove html classes
      settings.$elements.on('xtRemoved', function(e) {
        if (settings.name === 'xt-overlay') { // also this $group.is('[data-xt-reset]')
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
    // resize
    var $outside = settings.$targets.parent('.xt-container.xt-position');
    var resizeNamespace = 'resize.xt.' + settings.namespace;
    $(window).off(resizeNamespace);
    $(window).on(resizeNamespace, function(e) {
      $outside.css('width', $outside.parent().width()); // fix fixed width
    });
    $(window).trigger(resizeNamespace);
    // scroll
    var scrollNamespace = 'scroll.xt.' + settings.namespace;
    $(window).off(scrollNamespace);
    $(window).on(scrollNamespace, function(e) {
      var scrollTop = $(this).scrollTop();
      if (scrollTop !== settings.scrollTopOld) {
        // show or hide
        var top = $outside.offset().top;
        var bottom = Infinity;
        if (settings.top !== undefined) {
          if (!isNaN(parseFloat(settings.top))) {
            top = settings.top;
          } else {
            top = $(settings.top).offset().top;
          }
        }
        if (settings.bottom !== undefined) {
          if (!isNaN(parseFloat(settings.bottom))) {
            bottom = settings.bottom;
          } else if ($(settings.bottom).length) {
            bottom = $(settings.bottom).offset().top;
          }
        }
        if (scrollTop >= top && scrollTop < bottom) {
          if (!$group.hasClass(object.defaultClass)) {
            window.xtRequestAnimationFrame( function() {
              object.show($group);
            });
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
          if ($group.hasClass(object.defaultClass)) {
            window.xtRequestAnimationFrame( function() {
              object.hide($group);
            });
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
      }
      settings.scrollTopOld = scrollTop;
    });
    $(window).trigger(scrollNamespace);
    // remove window event on remove
    $group.on('xtRemoved', function(e) {
      $(window).off(resizeNamespace);
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
    if (!$element.hasClass(object.defaultClass)) {
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
      if (!$element.hasClass(object.defaultClass)) {
        var $elements = object.getElements(settings.$elements, $element);
        object.showAfter($elements, triggered);
        var $currents = object.getCurrents();
        $currents = object.setCurrents($currents.pushElement($element));
        // linked
        if (!isSync) {
          window.xtRequestAnimationFrame( function() {
            var $linked = $('[data-xt-namespace="' + settings.namespace + '"]').filter(':parents(.xt-ignore)').not($group);
            $linked.each( function() {
              var xt = $(this).data(settings.name);
              xt.show($(this), true, true);
            });
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
              object.hide($first);
            }
          }
        }
      }
    }
    // activate $target
    if (settings.$targets) {
      var $target = object.getTargets(settings.$elements, $element, settings.$targets);
      if (!$target.hasClass(object.defaultClass)) {
        object.showAfter($target, triggered);
        // stuff
        if (settings.name === 'xt-overlay') {
          // add paddings
          object.onFixed($('html')); // $('*:fixed').not($target).add('html')
          // activate $additional with $group time
          var $additional = $('html');
          if (!$additional.hasClass(object.defaultClass)) {
            $additional.addClass(settings.class);
            window.xtRequestAnimationFrame( function() {
              $additional.addClass('fade-in');
            });
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
      if ($element.hasClass(object.defaultClass)) {
        if (isSync || settings.name === 'xt-ajax' || $currents.length > settings.min) {
          var $elements = object.getElements(settings.$elements, $element);
          object.hideAfter($elements, triggered);
          if ($element.attr('data-group')) {
            $currents = object.setCurrents($currents.not('[data-group=' + $element.attr('data-group') + ']'));
          } else {
            $currents = object.setCurrents($currents.not($element.get(0)));
          }
          // linked
          if (!isSync) {
            window.xtRequestAnimationFrame( function() {
              var $linked = $('[data-xt-namespace="' + settings.namespace + '"]').filter(':parents(.xt-ignore)').not($group);
              $linked.each( function() {
                var xt = $(this).data(settings.name);
                xt.hide($(this), true, true);
              });
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
      if ($target.hasClass(object.defaultClass)) {
        object.hideAfter($target, triggered);
        // stuff
        if (settings.name === 'xt-overlay') {
          // remove paddings
          object.offFixed($('html')); // $('.xt-fixed-vertical').add('html')
          // deactivate $additional with $group time
          var $additional = $('html');
          if ($additional.hasClass(object.defaultClass)) {
            $additional.removeClass(settings.class);
            $additional.removeClass('fade-in');
            $additional.addClass('fade-out');
            settings.$targets.off('hide.xt.done.additional').one('hide.xt.done.additional', function() {
              $additional.removeClass('fade-out');
            });
          }
        }
      }
    }
  };
  
  //////////////////////
  // on and off methods
  //////////////////////
  
  Xt.prototype.showAfter = function($elements, triggered) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // $animated
    var $el = $elements.slice(0);
    var $animated = $el;
    if (settings.animated) {
      $animated = $el.find(settings.animated);
      $el = $el.pushElement($animated);
    }
    // on
    $el.addClass(settings.class).removeClass('fade-out');
    object.animationDelayClear($el, 'anim');
    // in
    object.animationMultiple($el, triggered, object.showDone, 'fade-in');
    // animations
    if ($el.hasClass('backdrop')) {
      object.onBackdrop($animated, triggered);
    }
    object.onWidth($el, triggered);
    object.onHeight($el, triggered);
    object.onMiddle($el, triggered);
    object.onCenter($el, triggered);
    // events
    if ($group.hasClass('drop')) {
      // close on document click
      $(document).off('click.xt.' + settings.namespace).on('click.xt.' + settings.namespace, function(e) {
        var $target = $(e.target);
        if (!$group.is($target) && !$group.has($target).length) {
          object.hide(settings.$elements, true, true, true);
        }
      });
    } else if ($el.hasClass('overlay')) {
      // close on .overlay-close
      $el.find('.overlay-close').off('click.xt.' + settings.namespace).on('click.xt.' + settings.namespace, function(e) {
        object.hide(settings.$elements, true, true, true);
      });
    }
    // api
    if (!triggered) {
      $el.trigger('show.xt', [object, true]);
    }
  };
  Xt.prototype.showDone = function($el, triggered) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // when animation is done
    // anim-width and anim-height
    if ($el.hasClass('anim-height')) {
      $el.css('height', 'auto');
    }
    if ($el.hasClass('anim-width')) {
      $el.css('width', 'auto');
    }
    // api
    if (!triggered) {
      $el.trigger('fadein.xt.done', [object, true]);
    }
  };
  
  Xt.prototype.hideAfter = function($elements, triggered) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // $animated
    var $el = $elements.slice(0);
    var $animated = $el;
    if ($el.hasClass('overlay')) {
      $animated = $el.find('.inside .content');
      $el = $el.pushElement($animated);
    }
    // off
    $el.removeClass(settings.class).removeClass('fade-in').addClass('fade-out');
    object.animationDelayClear($el, 'anim');
    // out
    object.animationMultiple($el, triggered, object.hideDone);
    // animations
    object.onWidth($el, triggered);
    object.onHeight($el, triggered);
    window.xtRequestAnimationFrame( function() {
      if ($el.hasClass('backdrop')) {
        object.offBackdrop($animated, triggered);
      }
      object.offWidth($el, triggered);
      object.offHeight($el, triggered);
    });
    // close on document click
    if ($group.hasClass('drop')) {
      $(document).off('click.xt.' + settings.namespace);
    }
    // api
    if (!triggered) {
      $el.trigger('hide.xt', [object, true]);
    }
  };
  Xt.prototype.hideDone = function($el, triggered) {
    var object = this;
    var settings = this.settings;
    // when animation is done
    $el.removeClass('fade-out');
    // anim-width and anim-height
    if ($el.hasClass('anim-height') || $el.hasClass('anim-width')) {
      object.removeWrap($el);
    }
    // api
    if (!triggered) {
      $el.trigger('fadeout.xt', [object, true]);
    }
  };
  
  Xt.prototype.animationMultiple = function($el, triggered, callout, add) {
    var object = this;
    // animationMultiple
    $el.each( function() {
      var $single = $(this);
      var done = 0;
      window.xtCancelAnimationFrame($single.data('frame.timeout'));
      var frame = window.xtRequestAnimationFrame( function() {
        if (add) {
          $single.addClass(add);
        }
        object.animationDelay($single, 'anim', function() {
          if (++done < $el.length) {
            return false;
          }
          callout.apply(object, [$el, triggered]);
        });
      });
      $single.data('frame.timeout', frame);
    });
  };
  Xt.prototype.animationDelay = function($el, ns, callout) {
    var object = this;
    var settings = this.settings;
    // delay for animations
    if (settings.timing === undefined && $el.css('transitionDuration') !== '0s') {
      $el.on('transitionend.xt.' + ns, function(e) {
        callout();
      });
    } else if (settings.timing) {
      var timeout = window.setTimeout( function(object) {
        callout();
      }, settings.timing);
      $el.data('fade.timeout.' + ns, timeout);
    } else {
      callout();
    }
  };
  Xt.prototype.animationDelayClear = function($el, ns) {
    clearTimeout($el.data('fade.timeout.' + ns));
    $el.off('transitionend.xt.' + ns);
    clearTimeout($el.data('fade.timeout.' + ns));
    $el.off('transitionend.xt.' + ns);
  };
  
  //////////////////////
  // animations methods
  //////////////////////
  
  Xt.prototype.onBackdrop = function($animated, triggered) {
    var object = this;
    var settings = this.settings;
    // animation in
    var $position = $animated.parent();
    var $backdrop = $position.find('> .xt-backdrop');
    if (!$backdrop.length) {
      $backdrop = $('<div class="xt-backdrop"></div>').appendTo($position);
    }
    // animations
    object.animationDelayClear($backdrop, 'backdrop');
    window.xtRequestAnimationFrame( function() {
      $backdrop.addClass('fade-in');
      $backdrop.removeClass('fade-out');
    });
    // events
    $backdrop.on('click', function(e) {
      object.hide(object.settings.$elements, true, true, true);
    });
    // backdrop resize
    var $inside = $backdrop.parent('.inside');
    if ($inside.length) {
      var resizeNamespace = 'resize.xt.backdrop.' + settings.namespace;
      $(window).off(resizeNamespace).on(resizeNamespace, function(e) {
        $backdrop.css('width', $inside.width()); // fix fixed width
        $backdrop.css('height', $inside.height()); // fix fixed height
      });
      $(window).trigger(resizeNamespace);
    }
  };
  Xt.prototype.offBackdrop = function($animated, triggered) {
    var object = this;
    var settings = this.settings;
    // animation out
    var $position = $animated.parent();
    var $backdrop = $position.find('> .xt-backdrop');
    if ($backdrop.length) {
      // animations
      $backdrop.removeClass('fade-in');
      window.xtRequestAnimationFrame( function() {
        $backdrop.addClass('fade-out');
        object.animationDelay($backdrop, 'backdrop', function() {
          $backdrop.removeClass('fade-out').remove();
        });
      });
    }
    // backdrop resize
    var $inside = $backdrop.parent('.inside');
    if ($inside.length) {
      var resizeNamespace = 'resize.xt.backdrop.' + settings.namespace;
      $(window).off(resizeNamespace);
    }
  };
    
  Xt.prototype.onWidth = function($el) {
    var object = this;
    // animation in
    $el.each( function() {
      var $single = $(this);
      if ($single.hasClass('anim-width')) {
        object.addWrap($single);
        var $outside = $single.parent('.xt-container');
        var $inside = $single.find('> .xt-position');
        var w = $outside.outerWidth();
        $inside.css('width', w);
        $single.css('width', w);
        $single.parents('.anim-width-left').css('margin-left', -w);
        $single.parents('.anim-width-right').css('margin-right', -w);
      }
    });
  };
  Xt.prototype.offWidth = function($el) {
    // animation out
    $el.each( function() {
      var $single = $(this);
      if ($single.hasClass('anim-width')) {
        $single.css('width', 0);
        $single.parents('.anim-width-left').css('margin-left', 0);
        $single.parents('.anim-width-right').css('margin-right', 0);
      }
    });
  };
  
  Xt.prototype.onHeight = function($el) {
    var object = this;
    // animation in
    $el.each( function() {
      var $single = $(this);
      if ($single.hasClass('anim-height')) {
        object.addWrap($single);
        var $inside = $single.find('> .xt-position');
        var h = $inside.outerHeight();
        $single.css('height', h);
        $single.parents('.anim-height-top').css('margin-top', -h);
        $single.parents('.anim-height-bottom').css('margin-bottom', -h);
      }
    });
  };
  Xt.prototype.offHeight = function($el) {
    // animation out
    $el.each( function() {
      var $single = $(this);
      if ($single.hasClass('anim-height')) {
        $single.css('height', 0);
        $single.parents('.anim-height-top').css('margin-top', 0);
        $single.parents('.anim-height-bottom').css('margin-bottom', 0);
      }
    });
  };
  
  Xt.prototype.onMiddle = function($el) {
    // animation out
    $el.each( function() {
      var $single = $(this);
      if ($single.hasClass('middle')) {
        var $outside = $single.parent();
        var add = $outside.outerHeight() / 2;
        var remove = $single.outerHeight() / 2;
        $single.css('top', add - remove);
      }
    });
  };
  Xt.prototype.onCenter = function($el) {
    // animation out
    $el.each( function() {
      var $single = $(this);
      if ($single.hasClass('center')) {
        var $outside = $single.parent();
        var add = $outside.outerWidth() / 2;
        var remove = $single.outerWidth() / 2;
        $single.css('left', add - remove);
      }
    });
  };
  
  Xt.prototype.addWrap = function($el) {
    var $outside = $el.parent('.xt-container');
    if (!$outside.length) {
      $el.wrap('<div class="xt-container"></div>');
    }
    var $inside = $el.find('> .xt-position');
    if (!$inside.length) {
      $el.wrapInner('<div class="xt-position"></div>');
    }
  };
  Xt.prototype.removeWrap = function($el) {
    var $outside = $el.parent('.xt-container');
    if ($outside.length) {
      $outside.contents().unwrap();
    }
    var $inside = $el.find('> .xt-position');
    if ($inside.length) {
      $inside.contents().unwrap();
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
    var $currents = $group.data('$currents.' + settings.namespace) || $([]);
    return $currents;
  };
  
  Xt.prototype.setCurrents = function($currents) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // set $currents on $group data
    $group.data('$currents.' + settings.namespace, $currents);
    return $currents;
  };
  
  Xt.prototype.getElements = function($elements, $element) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // $elements and $element
    if ($elements.is($group)) {
      return $elements;
    } else if ($element.is('[data-group]')) {
      // with [data-group]
      var g = $element.attr('data-group');
      return $elements.filter('[data-group="' + g + '"]');
    } else {
      // without [data-group]
      return $element;
    }
  };
  
  Xt.prototype.getTargets = function($elements, $element, $g) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // targets from $elements and $element
    if ($elements.is($group)) {
      return $g;
    } else if ($element.is('[data-group]')) {
      // with [data-group]
      var g = $element.attr('data-group');
      return $g.filter('[data-group="' + g + '"]');
    } else {
      // without [data-group]
      var index = object.getIndex($elements.not('[data-group]'), $element);
      return $g.not('[data-group]').eq(index);
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
    $el.addClass('xt-fixed-vertical').css('padding-right', w).css('background-clip', 'content-box');
  };
  
  Xt.prototype.offFixed = function($el) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // remove scrollbar padding
    $el.removeClass('xt-fixed-vertical').css('padding-right', 0).css('background-clip', '');
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
  
  Xt.prototype.checkDisabled = function($el, force) {
    var object = this;
    var settings = this.settings;
    var group = this.group;
    var $group = $(this.group);
    // manage [disabled] attribute
    var str = 'disabled';
    if (settings.on === 'click') {
      if (!force) {
        // automatic based on max
        var $currents = object.getCurrents();
        var min = settings.min;
        var add;
        if ($currents.length === min) {
          add = true;
          $currents.attr(str, str);
        } else {
          $currents.removeAttr(str);
        }
        // sync data-group
        $currents.filter('[data-group]').each( function() {
          var g = $(this).attr('data-group');
          var $dataGroup = settings.$elements.not(this).filter('[data-group="' + g + '"]');
          if (add) {
            $dataGroup.attr(str, str);
          } else {
            $dataGroup.removeAttr(str);
          }
        });
      } else if (force === 'disable') {
        // force disable
        $el.attr(str, str);
      } else if (force === 'enable') {
        // force enable
        $el.removeAttr(str);
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
          object.scope();
          object.events();
          // pushstate
          object.pushstate(url, title);
          // api
          settings.$targets.trigger('ajax.populated.xt', [object, $data]);
          settings.$targets.xtInitAll(true); // init xt
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
    settings.$elements.filter('[href="' + url + '"]').each( function() {
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
  window.xtRequestAnimationFrame = ( function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();
  window.xtCancelAnimationFrame = ( function(id) {
    return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || function(callback) {
      window.clearTimeout(id);
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