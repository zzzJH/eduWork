var edu = {};



// 工具对象
edu.tool = {};
// 封装cookie方法
edu.tool.CookieUtil = {

	// 获取 cookie
	get: function(name) {
		var cookieName = encodeURIComponent(name) + '=',
			cookieStart = document.cookie.indexOf(cookieName),
			cookieValue = null;

		if (cookieStart > -1) {
			var cookieEnd = document.cookie.indexOf(';', cookieStart);
			if (cookieEnd == -1) {
				cookieEnd = document.cookie.length;
			}
			cookieValue = encodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
		}

		return cookieValue;
	},
	// 设置 cookie
	set: function(name, value, expires, path, domain, secure) {
		var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);
		if (expires instanceof Date) {
			cookieText += '; expires=' + expires.toGMTString();
		}

		if (path) {
			cookieText += '; path=' + path;
		}

		if (domain) {
			cookieText += '; domain=' + domain;
		}

		if (secure) {
			cookieText += '; secure';
		}

		document.cookie = cookieText;
	},

	// 重设 cookie
	unset: function(name, path, domain, secure) {
		this.set(name, '', new Date(0), path, domain, secure);
	}
};

edu.tool.EventUtil = {
	// 添加事件
	addHandler: function(element, type, handler) {
		if (element.addEventListener) {
			element.addEventListener(type, handler, false);
		} else if (element.attachEvent) {
			element.attachEvent('on' + type, handler);
		} else {
			element['on' + type] = handler;
		}
	},
	getEvent: function(event) {
		return event || window.event;
	},
	getTarget: function(event) {
		return event.target || event.srcElement;
	},
	// 移除事件
	// removeHandler: function(element, type, handler) {
	// 	if (element.removeEventListener) {
	// 		element.removeEventListener(type, handler, false);
	// 	} else if (element.detachEvent) {
	// 		element.detachEvent('on' + type, handler);
	// 	} else {
	// 		element['on' + type] = null;
	// 	}
	// }
	delegateEvent: function(element, tag, eventtype, handler) {
		edu.tool.EventUtil.addHandler(element, eventtype, function(e) {
			var event = edu.tool.EventUtil.getEvent(e);
			var target = edu.tool.EventUtil.getTarget(e);
			if (target && target.tagName === tag.toUpperCase()) {
				handler.call(target, event);
			}
		});
	}
};
// ajax 封装
edu.tool.ajax = function ajax(obj) {
	var xhr = (function() {
		/*创建XMLHttpRequest对象*/
		if (XMLHttpRequest) {
			// code for IE7+, Firefox, Chrome, Opera, Safari
			return new XMLHttpRequest();
		} else if (ActiveXObject) {
			// code for IE6, IE5
			var version = [
				'MSXML2.XMLHttp.6.0',
				'MSXML2.XMLHttp.3.0',
				'MSXML2.XMLHttp'
			];
			for (var i = 0; version.length; i++) {
				try {
					return new ActiveXObject(version[i]);
				} catch (e) {
					//跳过
				}
			}
		} else {
			throw new Error('您的系统或浏览器不支持XHR对象！');
		}
	})();
	// url加随机参数，防止缓存
	obj.url = obj.url + '?rand=' + Math.random();
	// 请求参数格式化，encodeURIComponent编码参数可以出现&
	obj.data = (function(data) {
		var arr = [];
		for (var i in data) {
			arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
		}
		return arr.join('&');
	})(obj.data);
	if (obj.method === 'get')
		obj.url += obj.url.indexOf('?') == -1 ? '?' + obj.data : '&' + obj.data;
	if (obj.async === true) {
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				callback();
			}
		};
	}
	xhr.open(obj.method, obj.url, obj.async);
	if (obj.method === 'post') {
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(obj.data);
	} else {
		xhr.send(null);
	}
	if (obj.async === false) {
		callback();
	}

	function callback() {
		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
			obj.success(xhr.responseText); // 回调传递参数
		} else {
			alert('获取数据错误！错误代号：' + xhr.status + '，错误信息：' + xhr.statusText);
		}
	}
}

edu.ui = {};

// 获取主课程列表方法，根据传入的对象的 pageNo、psize、type 属性获得数据
edu.ui.getMainClass = function(obj) {
	var pageSize;
	edu.tool.ajax({
		method: 'get',
		url: 'http://study.163.com/webDev/couresByCategory.htm',
		data: {
			'pageNo': obj.pageNo,
			'psize': obj.psize,
			'type': obj.type
		},
		success: function(data) {
			var _data = JSON.parse(data);



			// pageSize 每页的数据个数
			pageSize = _data.pagination.pageSize;


			var oDiv = document.querySelector('#main_class_list');
			// _data.pagination.pageSize每页显示的课程数
			for (i = 0; i < pageSize; i++) {
				var oLi = document.createElement('li');
				var class_wrap = document.createElement('div');
				oDiv.appendChild(oLi);
				oLi.appendChild(class_wrap);
				class_wrap.setAttribute('class', 'class_wrap');

				var _img = document.createElement('img');
				var _class_name = document.createElement('p');
				var _provider = document.createElement('p');
				var _learnerCount = document.createElement('p');
				var _price = document.createElement('p');


				_img.setAttribute('src', _data.list[i].middlePhotoUrl);
				// 课程名称
				_class_name.setAttribute('class', 'class_name');
				_class_name.innerHTML = _data.list[i].name;
				// 课程提供者
				_provider.setAttribute('class', 'provider');
				_provider.innerHTML = _data.list[i].provider;
				// 学习人数
				_learnerCount.setAttribute('class', 'learnerCount');
				_learnerCount.innerHTML = _data.list[i].learnerCount;
				// 课程价格
				_price.setAttribute('class', 'price');
				_price.innerHTML = '价格：' + _data.list[i].price;

				class_wrap.appendChild(_img);
				class_wrap.appendChild(_class_name);
				class_wrap.appendChild(_provider);
				class_wrap.appendChild(_learnerCount);
				class_wrap.appendChild(_price);


				// 课程详情
				var details = document.createElement('div');
				var details_img = document.createElement('img');
				var details_class_name = document.createElement('p');
				var details_learnerCount = document.createElement('p');
				var details_provider = document.createElement('p');
				var details_categoryName = document.createElement('p');
				var details_description = document.createElement('p');

				oLi.appendChild(details);
				details.setAttribute('class', 'details');
				details_img.setAttribute('src', _data.list[i].middlePhotoUrl);
				// 课程名称
				details_class_name.setAttribute('class', 'class_name');
				details_class_name.innerHTML = _data.list[i].name;
				// 学习人数
				details_learnerCount.setAttribute('class', 'learnerCount');
				details_learnerCount.innerHTML = _data.list[i].learnerCount + ' 人在学';
				// 发布者
				details_provider.setAttribute('class', 'provider');
				details_provider.innerHTML = '发布者：' + _data.list[i].provider;
				//分类
				details_categoryName.setAttribute('class', 'categoryName');
				details_categoryName.innerHTML = _data.list[i].categoryName;
				// 课程描述
				details_description.setAttribute('class', 'description');
				details_description.innerHTML = _data.list[i].description;

				details.appendChild(details_img);
				details.appendChild(details_class_name);
				details.appendChild(details_learnerCount);
				details.appendChild(details_provider);
				details.appendChild(details_categoryName);
				details.appendChild(details_description);

			}

		},
		async: true
	});

}

// 应用对象
edu.app = {};
// 提示模块
edu.app.toPromet = (function() {
	var promet = document.querySelector('#promet');
	var promet_close = document.querySelector('#promet span');
	if (edu.tool.CookieUtil.get('apromet')) {
		promet.style.display = 'none';
	}
	edu.tool.EventUtil.addHandler(promet_close, 'click', function() {
		edu.tool.CookieUtil.set('apromet', 'exist');
		promet.style.marginTop = '-30px';
	});
})();

// 关注模块
edu.app.toFollow = (function() {
	var follow_btn = document.querySelector('.follow_btn');
	var loginArea = document.querySelector('.login-area');
	var closeBtn = document.querySelector('.login-content .close-btn');
	var followed = document.querySelector('.followed');

	edu.tool.EventUtil.addHandler(follow_btn, 'click', function() {
		loginArea.style.display = 'block';
	});


	if (edu.tool.CookieUtil.get('loginSuc') && edu.tool.CookieUtil.get('loginSuc')) {
		follow_btn.style.display = 'none';
		followed.style.display = 'block';
	}


	edu.tool.EventUtil.addHandler(closeBtn, 'click', function() {
		loginArea.style.display = 'none';
	});
})();

// 为关注按钮添加点击事件

var follow_btn = document.querySelector('.follow_btn');
edu.tool.EventUtil.addHandler(follow_btn, 'click', function() {
	edu.app.toFollow;
});



// 登录模块
edu.app.login = (function() {
	var submitBtn = document.querySelector('#submit-btn');
	edu.tool.EventUtil.addHandler(submitBtn, 'click', function(e) {
		// 阻止表单提交的默认行为 ，防止 xhr.status 为0的情况出现
		e = e || window.event;
		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		var account = document.querySelector('#account').value.toString();
		var pwd = document.querySelector('#pwd').value.toString();
		if (!account || !pwd) {
			alert('请完整填写！');
		} else {
			edu.tool.ajax({
				method: 'get',
				url: 'http://study.163.com/webDev/login.htm',
				data: {
					'userName': md5(account),
					'password': md5(pwd)
				},
				success: function(data) {
					if (data == 1) {
						alert('关注成功！');
						var loginArea = document.querySelector('.login-area');
						var followed = document.querySelector('.followed');
						loginArea.style.display = 'none';
						edu.tool.CookieUtil.set('loginSuc', 'loginSuc');
						edu.tool.CookieUtil.set('followSuc', 'followSuc');
						follow_btn.style.display = 'none';
						followed.style.display = 'block';
					} else {
						alert('用户名与密码不匹配，请重新输入');
					}
				},
				async: true
			});
		}
	});
})();


// 视频模块
edu.app.toVideo = (function() {
	var videoArea = document.querySelector('.video-area');
	var videoImg = document.querySelector('.video-img');
	var video = document.querySelector('.video-area video');
	edu.tool.EventUtil.addHandler(videoImg, 'click', function() {
		videoArea.style.display = 'block';
	});
	var closeBtn = document.querySelector('.video-content .close-btn');
	edu.tool.EventUtil.addHandler(closeBtn, 'click', function() {
		// 暂停播放视频
		video.pause();
		// 关闭视频区域
		videoArea.style.display = 'none';
	});
})();

// 轮播图模块
edu.app.toBanner = (function() {
	var banner = document.querySelector('#banner');
	var bannerLi = banner.querySelectorAll('li');
	var bannerImg = banner.querySelectorAll('img');
	var point = banner.querySelector('.point');
	var pointI = point.querySelectorAll('i');
	var len = bannerImg.length;

	var inNow = 0;

	// 初始化
	bannerImg[inNow].style.opacity = '1';
	bannerLi[inNow].style.zIndex = '1';
	pointI[inNow].className = 'active';
	clearInterval(timer);
	var timer = setInterval(auto, 5000);

	// 自动切换方法
	function auto() {
		if (inNow >= len - 1) {
			inNow = 0;
		} else {
			inNow++;
		}

		for (var i = 0; i < len; i++) {
			bannerLi[i].style.zIndex = '0';
			bannerImg[i].style.opacity = '0';
			pointI[i].className = '';
		}
		bannerImg[inNow].style.opacity = '1';
		bannerLi[inNow].style.zIndex = '1';
		pointI[inNow].className = 'active';
	}
	// 鼠标移入停止轮播
	edu.tool.EventUtil.addHandler(banner, 'mouseover', function() {
		clearInterval(timer);
	});

	// 鼠标移出开始轮播
	edu.tool.EventUtil.addHandler(banner, 'mouseout', function() {
		clearInterval(timer);
		timer = setInterval(auto, 5000);
	});

	// 为引导小点添加点击事件
	var pointAddClickEvent = (function() {
		var bannerLi = banner.querySelectorAll('li');
		var point = banner.querySelector('.point');
		var pointI = point.querySelectorAll('i');
		var bannerImg = banner.querySelectorAll('img');
		var len = pointI.length;
		edu.tool.EventUtil.addHandler(point, 'click', function(e) {
			e = e || window.event;
			target = e.target || e.srcElement;
			if (target && target.tagName.toUpperCase() == "I") {
				for (var i = 0; i < len; i++) {
					bannerImg[i].style.opacity = '0';
					bannerLi[i].style.zIndex = '0';
					pointI[i].className = '';
				}
				var index = target.innerHTML;
				pointI[index].className = 'active';
				bannerImg[index].style.opacity = '1';
				bannerLi[index].style.zIndex = '1';
				inNow = index;
			}
		});
	})();

})();



// 课程tab切换 
var classType;
edu.app.toTab = (function() {
	var design = document.querySelector('.design');
	var program = document.querySelector('.program');
	var oDiv = document.querySelector('#main_class_list');
	var tabBtnArea = document.querySelector('.tab-btn-area');
	var tab_Li = tabBtnArea.querySelectorAll('li');
	var _designClass = design.className;
	var _programClass = program.className;

	var pages = document.querySelector(".pages");
	var lis = pages.getElementsByTagName('li');
	var spans = pages.getElementsByTagName('span');
	
	classType = 10;
	oDiv.innerHTML = '';
	lis[0].className = "select_index";
	edu.ui.getMainClass({
		pageNo: 1,
		psize: 20,
		type: classType
	});


	design.className += ' active';
	design.onclick = function() {
		for (var i = 0, len = tab_Li.length; i < len; i++) {
			design.className = _designClass;
			program.className = _programClass;
		}
		classType = 10;
		design.className += ' active';
		oDiv.innerHTML = '';
		edu.ui.getMainClass({
			pageNo: 1,
			psize: 20,
			type: classType
		});
	}
	program.onclick = function() {
		for (var i = 0, len = tab_Li.length; i < len; i++) {
			design.className = _designClass;
			program.className = _programClass;
		}
		classType = 20;
		program.className += ' active';
		oDiv.innerHTML = '';
		edu.ui.getMainClass({
			pageNo: 1,
			psize: 20,
			type: classType
		});
	}

	// 页码切换
	edu.app.toPages = (function() {

		var pagesIndex = document.querySelector('#pages_index');

		edu.tool.EventUtil.addHandler(pagesIndex, 'click', function(e) {

			var e = e || window.event;
			var target = e.target || e.srcElement;
			if (target && target.tagName.toUpperCase() == "LI") {
				var index = target.innerHTML;
				if (/\d/.test(index)) {
					oDiv.innerHTML = '';
					edu.ui.getMainClass({
						pageNo: index,
						psize: 20,
						type: classType
					});
					var pageLi = document.querySelectorAll('#pages_index li');

					for (var i = 0; i < pageLi.length; i++) {
						pageLi[i].className = '';
					}
					target.className = 'select_index';
				}

			}
		});
	})();

	

	edu.tool.EventUtil.addHandler(spans[0], "click", function (e) {
		var nowpage = document.querySelector('.select_index');
		var event = edu.tool.EventUtil.getEvent(e);
		var target = edu.tool.EventUtil.getTarget(e);
		var nowvalue = parseInt(nowpage.innerHTML);
		console.log(nowvalue);
		if (nowvalue == 1) {
			return;
		} else {
			nowpage.className = "";
			lis[nowvalue - 2].className = "select_index";
			oDiv.innerHTML = '';
			edu.ui.getMainClass({
				pageNo: nowvalue - 2,
				psize: 20,
				type: classType
			});
		}
	});

	edu.tool.EventUtil.addHandler(spans[1], "click", function (e) {
		var nowpage = document.querySelector('.select_index');
		var event = edu.tool.EventUtil.getEvent(e);
		var target = edu.tool.EventUtil.getTarget(e);
		var nowvalue = parseInt(nowpage.innerHTML);
		if (nowvalue == 8) {
			return;
		} else {
			nowpage.className = "";
			lis[nowvalue].className = "select_index";
			oDiv.innerHTML = '';
			edu.ui.getMainClass({
				pageNo: nowvalue,
				psize: 20,
				type: classType
			});
		}
	});


	// zuo you change
	// edu.app.toChange = (function () {
	// 	var pages = document.querySelector(".pages");
	// 	var lis = pages.getElementsByTagName('li');
	// 	edu.tool.EventUtil.delegateEvent(pages, "span", "click", function(e) {
	// 		var nowpage = document.querySelector('.select_index');
	// 		var event = e || window.e;
	// 		var target = event.target || event.srcElement;
	// 		console.log(target.innerHTML);
	// 		if (target.innerHTML == "&lt;") {
	// 			if (nowpage.innerHTML == 1) {
	// 				return;
	// 			} else {
	// 				nowpage.className = "";
	// 				lis[nowpage.innerHTML - 1].className = "select_index";
	// 				oDiv.innerHTML = '';
	// 				edu.ui.getMainClass({
	// 					pageNo: nowpage.innerHTML - 1,
	// 					psize: 20,
	// 					type: classType
	// 				});
	// 			}
	// 		} else {
	// 			if (nowpage.innerHTML == 8) {
	// 				return;
	// 			} else {
	// 				nowpage.className = '';
	// 				lis[nowpage.innerHTML].className = "select_index";
	// 				oDiv.innerHTML = "";
	// 				edu.ui.getMainClass({
	// 					pageNo: nowpage.innerHTML,
	// 					psize: 20,
	// 					type: classType
	// 				});
	// 			}
	// 		}
	// 	});
	// });

})();

// 最热排行
edu.app.toHotList = (function() {
	var hotList = document.querySelector('.hot_list');
	edu.tool.ajax({
		method: 'get',
		url: 'http://study.163.com/webDev/hotcouresByCategory.htm',
		data: {},
		success: function(data) {
			var _data = JSON.parse(data);
			// console.log(_data);
			for (var i = 0, len = _data.length; i < len; i++) {
				var oHotLi = document.createElement('li');
				var oHotImg = document.createElement('img');
				var oHotTie = document.createElement('p');
				var oHotNum = document.createElement('p');
				oHotLi.setAttribute('class', 'aside_list clearfix');

				oHotImg.setAttribute('class', 'hot_list_img');
				oHotImg.setAttribute('src', _data[i].smallPhotoUrl);

				oHotTie.setAttribute('class', 'hot_list_tit');
				oHotTie.innerHTML = _data[i].name;

				oHotNum.setAttribute('class', 'hot_list_num');
				oHotNum.innerHTML = _data[i].learnerCount;

				oHotLi.appendChild(oHotImg);
				oHotLi.appendChild(oHotTie);
				oHotLi.appendChild(oHotNum);

				hotList.appendChild(oHotLi);

			}

			clearInterval(timer);
			var timer = setInterval(move, 5000);
			var iNow = 0;

			function move() {
				var asideLi = document.querySelectorAll('.aside_list');
				var hot_list = document.querySelector('.hot_list');
				// 每一次移动的高度是 liHeight 加上20px
				var liHeight = asideLi[0].offsetHeight + 20;
				if (iNow == _data.length / 2) {
					iNow = 0;
					hot_list.style.top = 0;
				}
				iNow++;
				hot_list.style.top = -liHeight * iNow + 'px';
			}

		},
		async: true
	});
})();