/**
 * iScroll jQuery plugin
 * @require iScroll & jQuery
 * @author Jason (wangyongsheng@cmbchina.com/big.cat@qq.com)
 */

(function($){

// 重写_resize方法，修复bug
!iScroll.prototype._resize_fix && $.extend(iScroll.prototype, {
	_resize_fix: iScroll.prototype._resize,
	_resize: function() {
		if ($(this.wrapper).is(':visible')) {
			this._resize_fix();
		}
	}
});

$.fn.iScroll = function(options) {
	return this.each(function() {
		var $this = $(this);
		var $scroller = $this.children().eq(0);
		var $slides = $scroller.children();
		if (options.hScroll && options.pager) {
			$scroller.width( $slides.length * $this.width() );
		}
		
		var that = new iScroll(this, options);
		$this.data('iScroll', that);
		
		if (options.snap && options.pager){
			// 翻页功能扩展
			(function(){
				var $pager;
				if ('object string'.indexOf(typeof options.pager) != -1) {
					$pager = $(options.pager);
				}
				else {
					$pager = $('<div class="pager"></div>').insertAfter($scroller);
				}
				
				$pager.html( (function(num){ // 创建指示器
					var html = '';
					for (var i=1; i<=num; i++) {
						html += '<a href="#" class="' + (i == 1 ? 'current' : '') + '">' + i + '</a>';
					}
					return html;
				})($slides.length) );
				
				var $pages = $pager.children();
				
				$pager.on('click', 'a', function(){ // 指示器事件
					var page = $(this).index();
					$pages.removeClass('current').eq(page).addClass('current');
					that.scrollToPage(page, 0);
					return false;
				});
				
				that.options.onBeforeScrollStart = function(event) {
					if (!event.touches) {
						event.preventDefault();
					}
					options.onBeforeScrollStart && options.onBeforeScrollStart.call(this);
				};
				
				that.options.onScrollMove = function(event) {
					// 阻止页面滚动
					if (that.options.hScroll && that.dirX != 0) {
						event.preventDefault();
					}
					if (that.options.vScroll && that.dirY != 0) {
						event.preventDefault();
					}
					options.onScrollMove && options.onScrollMove.call(this);
				};
				
				that.options.onScrollEnd = function() {
					$pages.removeClass('current').eq(this.currPageX).addClass('current');
					options.onScrollEnd && options.onScrollEnd.call(this);
				};
			})();
		}
	});
};

})(jQuery);
