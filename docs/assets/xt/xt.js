/*! xtend v0.0.5 (http://)
@copyright (c) 2016 - 2017 Riccardo Caroli
@license MIT (https://github.com/minimit/xtend/blob/master/LICENSE) */

;(function($, window, document, undefined) {

  'use strict';
  
  //////////////////////
  // settings
  //////////////////////
  
  var pluginName = 'xt';
  var defaults = {
    'type': null,
    'on': 'click',
    'target': '',
    'class': 'active',
    'group': '',
    'grouping': 'xt',
    'min': 1,
    'max': 1,
    'ajax': null,
    'url': null,
    'groupIndex': null,
  };
  
  //////////////////////
  // constructor
  //////////////////////
  
  function Plugin (element, options) {
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  $.extend(Plugin.prototype, {
    
    // init
    
    init: function() {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // override
      var override = $element.data('xt');
      // override with type settings
      if (override && override.type) {
        if (override.type === "ajax") {
          $.extend(settings, {
            'ajax': {
              'url': 'href',
            },
          });
          $.extend(settings, $element.data('xt-ajax'));
        } else if (override.type === "toggle") {
          $.extend(settings, {
            'min': 0,
            'max': 1,
          });
          $.extend(settings, $element.data('xt-toggle'));
        }
      }
      // override with html settings
      if ($element.is('[data-xt]')) {
        $.extend(settings, override);
      }
      // [data-xt] required
      if (!$element.attr('data-xt')) {
        $element.attr('data-xt', '');
      }
      // debug
      if ($element.attr('debug') || $element.attr('debug') === '') {
        settings.debug = true;
      }
      // scoping before setup
      object.scoping();
      object.events();
      // setup and events when groups are formed
      window.requestAnimFrame( function() {
        object.setup();
      });
    },
    
    scoping: function() {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // automatic $group and target
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
      if (settings.target) {
        settings.$target.attr('data-xt-target', settings.namespace);
      }
    },
    
    setup: function() {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // ajax url
      if (settings.ajax && settings.ajax.url === 'href') {
        settings.ajax.url = $element.attr('href');
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
      // init if has class
      if ($element.hasClass(settings.class)) {
        this.show();
      }
      // automatic init
      if (settings.ajax) {
        // register data-xt-pushstate on element
        $element.attr('data-xt-pushstate', 'true');
        // init with settings.ajax.url
        var found;
        if (history.state && history.state.url) {
          // detect from history
          if (settings.ajax.url === history.state.url) {
            found = true;
          }
        } else {
          // detect from url location
          var loc = window.location.href.split('#')[0];
          if (loc.match(settings.ajax.url + '$')) {
            found = true;
          }
        }
        if (found) {
          // set ajaxified
          settings.ajax.title = settings.ajax.title ? settings.ajax.title : document.title;
          settings.$target.attr('data-xt-ajaxified', settings.ajax.url);
          this.pushstate();
          // then show
          this.show();
          // api
          settings.$target.trigger('xt.ajax.init', [object]);
        }
      } else {
        // init if $shown < min
        var min = settings.min;
        var $shown = $buttons.filter('.' + settings.class);
        if ($shown.length < min) {
          this.show();
        }
      }
      // TESTING
      //console.log(':setup', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
    },
    
    events: function() {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // toggle events
      $element.on(settings.on, function(e) {
        object.toggle();
        if (settings.ajax) {
          e.preventDefault();
        }
      });
    },
    
    // methods
    
    getButtons: function() {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // get $buttons on $group based on namespace
      var $buttons = settings.$group.find('[data-xt-button="' + settings.namespace + '"]');
      return $buttons;
    },
    
    getCurrents: function() {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // get $currents on $group data
      var $currents = settings.$group.data('$currents_' + settings.namespace) || $([]);
      return $currents;
    },
    
    setCurrents: function($currents) {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // set $currents on $group data
      settings.$group.data('$currents_' + settings.namespace, $currents);
      return $currents;
    },
    
    // toggle
    
    toggle: function(triggered, skipstate) {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // choose based on state
      if (!$element.hasClass(settings.class)) {
        this.show(triggered, skipstate);
      } else {
        if (!settings.ajax) {
          this.hide(triggered, skipstate);
        }
      }
      // api
      if (!triggered) {
        $element.trigger('xt.toggle', [object]);
        if (settings.target) {
          settings.$target.trigger('xt.toggle', [object]);
        }
      }
    },
    
    show: function(triggered, skipstate) {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // filter
      if (!$element.hasClass(settings.class)) {
        var $currents = this.getCurrents();
        // show and add in $currents
        $element.addClass(settings.class);
        $currents = this.setCurrents($currents.pushElement($element));
        if (settings.$target) {
          settings.$target.addClass(settings.class);
        }
        // control over activated
        if (settings.ajax) {
          // [disabled]
          this.checkDisabled('disable');
          // ajax
          object.ajax(skipstate);
        } else {
          // [disabled]
          this.checkDisabled();
          // hide max or differents
          var max = settings.max;
          if ($currents.length > max) {
            var old = $currents.first().data('plugin_xt');
            if (old) {
              old.hide();
            }
          }
        }
        // api
        if (!triggered) {
          $element.trigger('xt.show', [object]);
          if (settings.target) {
            settings.$target.trigger('xt.show', [object]);
          }
        }
        // TESTING
        //console.log(':show', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
      }
    },
    
    hide: function(triggered, skipstate) {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // filter
      if ($element.hasClass(settings.class)) {
        var $currents = this.getCurrents();
        // hide and remove from $currents
        var min = settings.min;
        if ($currents.length > min || settings.ajax) {
          $element.removeClass(settings.class);
          $currents = this.setCurrents($currents.not(element));
          if (settings.$target) {
            settings.$target.removeClass(settings.class);
          }
        }
        // [disabled]
        if (settings.ajax) {
          this.checkDisabled('enable');
        } else {
          this.checkDisabled();
        }
        // api
        if (!triggered) {
          $element.trigger('xt.hide', [object]);
          if (settings.target) {
            settings.$target.trigger('xt.hide', [object]);
          }
        }
        // TESTING
        //console.log(':hide', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
      }
    },
    
    checkDisabled: function(force) {
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
    },
    
    // ajax and pushstate
    
    ajax: function(skipstate) {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // do ajax only one time
      if (settings.$target.attr('data-xt-ajaxified') !== settings.ajax.url) {
        $.ajax({
          type: 'GET',
          url: settings.ajax.url,
          success: function(data, textStatus, jqXHR) {
            var $data = $('<div />').html(data);
            settings.$target.attr('data-xt-ajaxified', settings.ajax.url);
            // populate
            var $html = $data.find(settings.target).contents();
            settings.$target.html($html);
            // pushstate
            if (!skipstate) {
              settings.ajax.title = settings.ajax.title ? settings.ajax.title : $data.find('title').text();
              object.pushstate(true);
            }
            // api
            settings.$target.trigger('xt.ajax.done', [object, $data]);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.error('ajax error url:' + settings.ajax.url + ' ' + errorThrown);
          }
        });
      }
    },
    
    pushstate: function(triggered) {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // if no state or if the state is new
      var title = settings.ajax.title;
      if (!history.state || !history.state.url || history.state.url !== settings.ajax.url) {
        var url = settings.ajax.url;
        // push this object state
        history.pushState({'url': url, 'title': title}, title, url);
        // trigger on registered data-xt-pushstate
        $(document).find('[data-xt-pushstate]').each( function(i) {
          var xt = $(this).data('plugin_xt');
          xt.pushstateListener(url, triggered);
        });
      }
      document.title = title; // also when no history.state
    },
    
    pushstateListener: function(url, triggered) {
      var object = this;
      var settings = this.settings;
      var element = this.element;
      var $element = $(this.element);
      // triggered pushstate
      if (settings.ajax.url === url) {
        object.show(triggered, true);
        // TESTING
        //console.log(':push:show', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
      } else {
        object.hide(triggered, true);
        // TESTING
        //console.log(':push:hide', $element.text().replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+|\s+$|\s+(?=\s)/g, ""), $element.hasClass(settings.class));
      }
    },
    
  });
  
  //////////////////////
  // jquery plugin
  //////////////////////
  
  $.fn[pluginName] = function(options) {
    return this.each( function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
      }
    });
  };
  
  //////////////////////
  // utils
  //////////////////////
  
  // onpopstate trigger window.pushstate
  window.onpopstate = function(history) {
    if (history.state && history.state.url) {
      document.title = history.state.title;
      // trigger on registered data-xt-pushstate
      $(document).find('[data-xt-pushstate]').each( function(i, element) {
        var xt = $(this).data('plugin_xt');
        xt.pushstateListener(history.state.url, false);
      });
    }
  };
  
  // https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();
  
  // http://stackoverflow.com/questions/13281897/how-to-preserve-order-of-items-added-to-jquery-matched-set
  $.fn.pushElement = function($element) {
    Array.prototype.push.apply(this, $element);
    return this;
  };
  
  // init if not manualInit
  $(document).ready(function () {
    if (!$.fn[pluginName].manualInit) {
      $('[data-' + [pluginName] + ']')[pluginName]();
    }
  });

})(jQuery, window, document);