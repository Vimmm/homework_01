// 定义的一个命名空间
window.my = {};
// 封装的动画过渡结束事件
my.transitionEnd = function(dom, callback) {
	if (!dom || typeof dom != "object") {
		// 没dom的时候或者不是一个对象的时候，程序停止
		return false;
	}
	// transitionend 事件在 CSS 完成过渡后触发。
	dom.addEventListener("transitionEnd", function() {
		callback && callback();
	});
	// Safari 3.1 到 6.0 版本才支持该事件, 使用webkitTransitionEnd前缀
	dom.addEventListener("webkitTransitionEnd", function() {
		callback && callback();
	});
};

// 封装一个tap 事件
my.tap = function(dom, callback) {
	if (!dom || typeof dom != "object") {
		// 没dom的时候或者不是一个对象的时候，程序停止
		return false;
	}

	var isMove = false; //是否滑动过
	var time = 0; //刚刚触摸屏幕的时间  touchstart的触发时间

	dom.addEventListener("touchdtart", function() {
		time = Date.now(); //时间戳，返回毫秒数
	});
	dom.addEventListener("touchmove", function() {
		isMove = true;
	});
	dom.addEventListener("touchend", function(e) {
		// 1.没有滑动过
		// 2.响应时间在150ms以内
		if (!isMove && Date.now() - time < 150) {
			callback && callback(e);
		}
		//重置参数
		isMove = false;
		time = 0;
	});
};

window.onload = function() {
	//轮播图最外层的盒子
	var banner = document.querySelector(".banner");
	//图片盒子
	var imageBox = banner.querySelector(".imageBox");
	//轮播图片的数量
	// var imageCount = 8;
	var imageCount = imageBox.querySelectorAll("li").length - 2;
	console.log(imageCount);
	//图片的宽度
	var width = banner.offsetWidth;
	//下面点点的盒子
	var pointBox = banner.querySelector(".pointBox");
	var liStr = "";
	for (var i = 0; i < imageCount; i++) {
		liStr += "<li></li>";
	}
	pointBox.innerHTML = liStr;
	console.log(pointBox);
	pointBox.querySelector("li").className = "now";
	//所有的点
	var points = pointBox.querySelectorAll("li");

	//共用方法
	//加过渡动画
	var addTransition = function() {
		imageBox.style.transition = "all .3s";
		imageBox.style.webkitTransition = "all .3s"; //做兼容
	};
	//清除过渡动画
	var removeTransition = function() {
		imageBox.style.transition = "none";
		imageBox.style.webkitTransition = "none"; //做兼容
	};
	//定位
	var setTranslateX = function(translateX) {
		imageBox.style.transform = "translateX(" + translateX + "px)";
		imageBox.style.webkitTransform = "translateX(" + translateX + "px)";
	};

	//功能实现：自动轮播，定时器，最前最后图片的无缝衔接，动画结束瞬间定位
	var index = 1;
	var timer = setInterval(function() {
		//自动轮播到下一张
		index++;
		//定位
		setTranslateX(-index * width);
		//加过渡动画
		addTransition();
	}, 3000);
	//设置圆点点的样式
	var setPoint = function() {
		for (var i = 0; i < points.length; i++) {
			points[i].className = " ";
		}
		points[index - 1].className = "now";
	};

	// 过渡结束之后来做无缝衔接
	my.transitionEnd(imageBox, function() {
		if (index > imageCount) {
			index = 1;
		} else if (index <= 0) {
			index = imageCount;
		}
		//定位
		setTranslateX(-index * width);
		//清除过渡
		removeTransition();
		//设置底部圆角的样式
		setPoint();
	});

	/**
	 * 手指滑动的时候让轮播图滑动   touch事件  记录坐标轴的改变 改变轮播图的定位（位移css3）
     当滑动的距离不超过一定的距离的时候  需要吸附回去  过渡的形式去做
     当滑动超过了一定的距离  需要 跳到 下一张或者上一张  （滑动的方向） 一定的距离（屏幕的三分之一）
	 */
	//touch事件
	//记录起始时刚触摸的点的位置——x的坐标
	var startX = 0;
	//滑动的时候x的位置
	var moveX = 0;
	//滑动的距离
	var distanceX = 0;
	//是否滑动过
	var isMove = false;

	imageBox.addEventListener("touchstart", function(e) {
		clearInterval(timer); //清除定时器
		startX = e.touches[0].clientX; //记录起始点的横坐标x
	});
	imageBox.addEventListener("touchmove", function(e) {
		moveX = e.touches[0].clientX; //记录滑动点滑动后的横坐标x
		distanceX = moveX - startX; //计算移动的距离
		removeTransition(); //清除过渡
		setTranslateX(-index * width + distanceX); //实时的定位
		isMove = true; //滑动过
	});
	imageBox.addEventListener("touchend", function(e) {
		//滑动超过1/3即为有效滑动，否则为无效，图片会被吸附回去
		if (isMove && Math.abs(distanceX) > width / 3) {
			if (distanceX > 0) {
				//上一张
				index--;
			} else {
				//下一张
				index++;
			}
		}
		//家过渡动画
		addTransition();
		//定位
		setTranslateX(-index * width);

		if (index > imageCount) {
			index = 1;
		} else if (index <= 0) {
			index = imageCount;
		}
		setPoint();

		//重置参数
		startX = 0;
		moveX = 0;
		distanceX = 0;
		isMove = false;
		//加定时器
		clearInterval(timer); //这里再删除一次定时器
		timer = setInterval(function() {
			index++; //自动轮播至下一张
			addTransition(); //加过渡动画
			setTranslateX(-index * width); //定位
		}, 3000);
	});
};
