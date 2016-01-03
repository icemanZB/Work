// 公共对象
Common = $.extend(window['Common'], {});


// 切换页面
Common.togglePage = function(params) {
	var defaults = {
		show: '',
		hide: '',
		onBeforeToggle: '',
		onToggle: ''
	};
	var options;
	
	var args = arguments;
	if (args.length > 1) {
		// 多个分开的参数
		options = $.extend({}, defaults);
		var i = 0;
		$.each(options, function(key, val) {
			if (i >= args.length) return false;
			options[key] = args[i];
			i++;
		});
	}
	else {
		// 单一对象参数
		options = params;
	}
	
	var beforeScroll = {
		X: window.scrollX,
		Y: window.scrollY
	};
	
	options.onBeforeToggle && options.onBeforeToggle(beforeScroll);
	
	$(options.hide).hide();
	$(options.show).show();
	window.scrollTo(beforeScroll.X > 0 ? 1 : 0, beforeScroll.Y > 0 ? 1 : 0);
	
	options.onToggle && options.onToggle(beforeScroll);
};

// 添加喜欢
Common.like = function(link, likeClass, likeUrl, unLikeUrl) {
	var $link = $(link);
	var like = !$link.hasClass(likeClass);
	likeUrl = likeUrl || $link.data('url-like');
	unLikeUrl = unLikeUrl || $link.data('url-unlike');
	var url = like ? likeUrl : unLikeUrl;
	$.ajax({
		url: url,
		type: 'GET',
		dataType: 'json',
		timeout: 10000,
		success: function(data) {
			if (data && data.success) {
				$link.toggleClass(likeClass, like);
				$('<div class="tip-fliter"><div class="tip-content"><span class="icon tick-icon"></span><span>' + (like ? '添加喜欢成功' : '取消成功') + '</span></div></div>').appendTo('body').fadeIn().delay(2000).fadeOut(function() {
					$(this).remove();
				});
			}
		},
		error: function(request, error, thrown) {
			// ...
		}
	});
};

// 查看图片
Common.viewImg = function(element) {
	var $element = $(element);
	var img = $element.data('img');
	if (!img) return;
	$element.addClass('loading').text('');
	var $img = $('<img />').one('load', function() {
		$element.replaceWith($img);
	}).attr('src', img);
};

// 弹出层
Common.popup = function(options) {
	// 选项
	var options = $.extend({
		modal: true,
		content: '',
		button: [],
		showClose: true,
		open: null,
		close: null
	}, options);
	
	var $popup;
	var $wrap;
	var $con;
		
	// popup对象
	var popup = {
		ui: null,
		options: options,
		close: function() {
			if ($popup.data('static')) {
				$popup.hide();
			}
			else {
				$popup.remove();
			}
			setTimeout(function() {
				$(window).scrollTop($(window).scrollTop());
			}, 1);
			options.close && options.close(popup);
		}
	};
	
	if (typeof(options.content) == 'string') {
		// 创建ui
		$popup = $('<div class="popup"></div>');
		if (options.modal) {
			$popup.addClass('modal');
		}
		
		$wrap = $('<div class="tip-float" style="position:absolute; left:-9999px; top:-9999px;"></div>').appendTo($popup);
		if (options.showClose) {
			var $close = $('<a href="#" class="icon close" role="close"></a>').appendTo($wrap);
			$close.click(function() {
				popup.close();
				return false;
			});
		}
		$con = $('<div class="tip-content"></div>').appendTo($wrap);
		$con.append('<div class="tip-text">' + options.content + '</div>');
		
		// 创建按钮
		var $btn = $([]);
		$.each(options.button, function(i, n) {
			if (!n) return;
			var $b = $('<button class="btn ' + (n.class || '') + '">' + n.text + '</button>');
			if (n.click) {
				$b.click(function() {
					n.click.call(this, popup);
				});	
			}
			$btn = $btn.add($b);
		});
		if ($btn.length) {
			var $btc = $('<div class="btn-con clearfix"></div>');
			$btc.append($btn);
			$con.append($btc);
		}
		
		$popup.appendTo('body');
	}
	else {
		$popup = $(options.content);
		if ($popup.parent().hasClass('popup')) {
			$popup = $popup.parent();
		}
		else if (!$popup.hasClass('popup')) {
			$popup.wrap('<div class="popup"></div>');
			$popup = $popup.parent();
		}
		if (options.modal) {
			$popup.addClass('modal');
		}
		$wrap = $popup.find('.tip-float:first').show();
		$con = $wrap.find('.tip-content:first');
		if (!$popup.data('static')) {
			$popup.data('static', true);
			$popup.find('[role=close], [role=cancel]').click(function() {
				popup.close();
				return false;
			});
		}
	}
	
	popup.ui = $popup;
	$popup.show();
	$wrap.css({left: '50%', top: '50%', margin: '-' + $con.outerHeight()/2 + 'px 0 0 -' + $con.outerWidth()/2 + 'px'});
	
	// 触发open事件
	options.open && options.open(popup);
	
	// 修正位置
	setTimeout(function() {
		$(window).scrollTop($(window).scrollTop());
	}, 1);
	
	// 返回popup对象，包含ui、options、close方法
	return popup;
};

// 带确定按钮的对话框
Common.popup.ok = function(content, btnClick, btnText, btnClass) {
	Common.popup({
		content: '<center>' + content + '</center>',
		showClose: false,
		button: [
			{
				class: btnClass || 'btn',
				text: btnText || '确 定',
				click: function(popup) {
					(btnClick && btnClick(popup)) || popup.close();
				}
			}
		]
	});
};

// tip
Common.popup.showTip = function(options) {

	if (typeof(options) == 'string' || options.jquery) {
		options = {content: options};
	}

	var $wrap = $('<div class="tip-float tip-fliter" style="display:block; top:-9999px;"><div class="tip-content"></div></div>').appendTo('body');
	$wrap.find('.tip-content').append(options.content);

	return Common.popup({
		content: $wrap,
		showClose: false,
		open: function(popup) {
			popup.ui.addClass('modalTip').find('.tip-float').removeClass('tip-float');
			popup.ui.hide().fadeIn(500, function() {
				options.open && options.open(popup);
				popup.close = function() {
					popup.ui.fadeOut(500, function() {
						popup.ui.remove();
						options.close && options.close(popup);
					});
				};
				if (options.autoClose || typeof(options.autoClose) == 'undefined') {
					setTimeout(function() {
						popup.close();
					}, 2000);
				}
			});
		}
	});

};

// 推荐产品滑动
Common.recommendSlide = function(slider, options) {
	var $swiper = $(slider);
	if (!$swiper.length) {
		return;
	}

	var $scroller = $swiper.children().eq(0);
	var $snaps = $scroller.children();

	$scroller.width( $snaps.length * $snaps.eq(0).outerWidth(true) );

	$swiper.iScroll($.extend({
		hScroll: true,
		vScroll: false,
		hScrollbar: false,
		vScrollbar: false,
		bounce: true,
		momentum: true,
		snap: 'li'
	}, options)).css('overflow', 'visible');
	
	var iScroll = $swiper.data('iScroll');
	iScroll._refresh_fix = iScroll.refresh;
	iScroll.refresh = function() {
		this._refresh_fix();
		this.scrollToPage(this.currPageX, 0);
	};
};

function FormatNumber(srcStr,nAfterDot){
	var srcStr,nAfterDot;
	var resultStr,nTen;
	srcStr = ""+srcStr+"";
	strLen = srcStr.length;
	dotPos = srcStr.indexOf(".",0);
	if (dotPos == -1){
		resultStr = srcStr+".";
		for (i=0;i<nAfterDot;i++){
			resultStr = resultStr+"0";
		}
		return resultStr;
	}
	else{
		if ((strLen - dotPos - 1) >= nAfterDot){
			nAfter = dotPos + nAfterDot + 1;
			nTen =1;
			for(j=0;j<nAfterDot;j++){
				nTen = nTen*10;
			}
			resultStr = Math.round(parseFloat(srcStr)*nTen)/nTen;
			return resultStr;
		}
		else{
			resultStr = srcStr;
			for (i=0;i<(nAfterDot - strLen + dotPos + 1);i++){
				resultStr = resultStr+"0";
			}
			return resultStr;
		}
	}
}

$(function() {
	/*
	// 判断android版本
	var match = navigator.userAgent.match(/android ([0-9])/i);
	if (match && match.length) {
		var ver = parseInt(match.pop());
		if (ver < 4) {
			$('body').addClass('nofixed');
		}
	}
	*/
});

