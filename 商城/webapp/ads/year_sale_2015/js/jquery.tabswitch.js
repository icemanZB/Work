/*!
 * jQuery tabSwitch v1.0.0
 *
 * Copyright 2012, Joying E-Commerce
 * http://trip.cmbchina.com/
 *
 * Author: Jason.Wang
 *
 */
 
(function($){
	$.fn.tabswitch = $.fn.tabSwitch = function(options){	//tab切换
		var options = $.extend({
			tabs: '', //string
			event: 'click',
			eventReturn: false, //boolean, function
			selected: null, //number, string, object. show selected tab on init.
			activeClass: 'current', //string, function
			inactiveClass: '',
			target: 'href', //string, object
			onselect: $.noop
		}, options);
		
		var $tabs = options.tabs ? $(options.tabs, this) : this;
		var $targets = typeof(options.target) == 'string' ? $(
			$tabs.map(function(){
				return $(this).attr(options.target);
			}).get().join(',')
		) : options.target;
		
		var _switch = function(tab){
			var $this = $(tab);
			if (!$this.length) return;
			$this.removeClass(getClass(options.inactiveClass, $this)).addClass(getClass(options.activeClass, $this)).show();
			$tabs.not($this).each(function(){
				$(this).removeClass(getClass(options.activeClass, $(this))).addClass(getClass(options.inactiveClass, $(this)));
			});
			var $target = (typeof(options.target) == 'string' ? $($this.attr(options.target)) : $targets.eq($tabs.index($this))).show();
			$targets.not($target).hide();
			options.onselect($this, $target, $tabs, $targets);
			return (typeof(options.eventReturn) == 'function' ? options.eventReturn($this) : options.eventReturn);
		}
		
		$tabs.bind(options.event, function(){
			return _switch(this);
		});
		
		var getClass = function(activeClass, $target){
			if ($.isFunction(activeClass)){
				return activeClass($target);
			}
			else {
				return activeClass;
			}
		};
		
		if (typeof(options.selected) == 'number'){
			_switch($tabs.eq(options.selected));
		}
		else if (options.selected != null && (typeof(options.selected) == 'string' || typeof(options.selected) == 'object')){
			_switch($tabs.filter(options.selected));
		}
		
		return this;
	};
})(jQuery);
