/** 全局变量的定义 */
var userKind;//用户类型
var dataSource;//用于构件触发的CDT弹窗

/** VIEW的定义 */
var topView;
var menuView;
var solutionView;
var componentView;
var solutionWindowView;
var solutionFavView;
var workingView;
var isotopeView;
var messageCenter;


/** 方法的定义 */
/**
 * 消息中心
 */
var MessageCenter = function() {

	/**
	 * 呼叫消息
	 * @param message消息
	 * @param jsonData json对象数据
	 */
	this.callMessage = function(message, jsonData) {
		switch(message) {
			case 'EDIT_MODE' ://编辑模式
				menuView.chageToEditMode();
				break;
			case 'SHOW_MODE' ://展现模式
				menuView.chageToShowMode();
				break;
			case 'CHANGE_MENU' :
				solutionView.bindSolutionControlClick();
				break;
			case 'RESIZE_WORKING' :
				workingView.resizeWorking(jsonData);
				break;
			case 'CREATE_IFRAME':
				workingView.createIframeForUrl(jsonData);
				break;
			case 'RELOAD_IFRAME':
				workingView.reloadIframeForUrl(jsonData);
				break;
			case 'UPDATE_DESCRIBE' :
				solutionView.updateDescribeById(jsonData);
				break;
			case 'ENTER_SYSTEMMANAGER'://进入系统管理
				solutionView.enterSystemManager();
				break;
			case 'OUTER_SYSTEMMANAGER'://退出系统管理
				solutionView.outerSystemManager();
				break;
			case 'OUTER_SYSTEMMANAGER_TO_HOME'://退出系统管理进入到首页
				solutionView.outerSystemManagerToHome();
				break;
			case 'ADD_APP_USED_LOG'://构件使用记录
				componentView.addAppUsedLog(jsonData);
				break;
			case 'CREATE_TEMPLATE'://创建模板
				workingView.createTemplate(jsonData);
				break;
			case 'POPUP_FAVORITE_SETTING'://弹出解决方案喜好设置
				solutionFavView.popUpFavSetting();
				break;
			case 'CLOSE_FAVORITE_SETTING'://关闭解决方案喜好设置
				solutionFavView.closeFavSetting();
				break;
			case 'REFLASH_SOLUTION'://保存解决方案喜好设置,刷新解决方案数据
				solutionView.outerSystemManager();
				break;
			case 'SORT_SOLUTION_ENABLE'://开启解决方案拖动
				solutionView.sortSolutionEnable();
				break;
			case 'SORT_SOLUTION_DISABLE'://停止解决方案拖动
				solutionView.sortSolutionDisable();
				break;
			case 'POST_PANEL_MESSAGE' ://传递给其他面板的消息
				workingView.postPanelMessage(jsonData);
				break;
			case 'POST_RETURN_MESSAGE' ://传递给自身面板的消息
				workingView.postReturnMessage(jsonData);
				break;
			default:
				break;
		}
	};
};

/** 弹出提示框 */
var showTipMessage = function(msg) {
	$.messager.show({
		title:'信息提示',
		msg:msg,
		timeout:5000,
		showType:'slide',
		width: document.body.clientWidth,
		width:300,
		height:100,
		right:0
	});
};
/**
 * 窗口resize调整宽和高
 */
var resize = function(){
	if (menuView && workingView && isotopeView) {
		menuView.resize();
		workingView.resize();
		if ($(".index_content_div").height() != 0 && $(".index_content_div").width() != 0) {
			isotopeView.resizeIndexPage();
		}
	}
};

/**
 * 工作区定位滚动
 * @param offset
 * @returns
 */
var gotoPos = function(offset) {
	$('#working').animate({
		scrollTop: offset
	}, 500);
};


/** 接收到消息后传递给其他的iframe */
var onMessage = function(e) {
	var data = JSON2.parse(e.data);//数据结构必须遵循{message:"",data:传递的数据参数}
	var message;
	data.source = e.source;
	if ((message = data.message) != undefined) {//有消息KEY传递
		switch(message) {
			case 'POP_UP_SINGLE_WINDOW'://弹出单个窗口
				WindowUtil.openSingleWindow(data);
				break;
			case 'POST_PANEL_MESSAGE' ://传递给其他面板的消息
				messageCenter.callMessage('POST_PANEL_MESSAGE', data);
				break;
			case 'SELECT_SOLUTION' : //选择左侧某个解决方案
				//数据结构必须遵循{message:"",data:传递的数据参数}，其中的data的数据格式为{name:"解决方案名称",params:{}},params为可选参数，后续将会支持
				//如果不传递该参数则表示只切换解决方案，若传递该参数的内容，则只针对切换过去的是URL方式的解决方案的后面添加参数进行传递
				solutionView.chageToSelectSolution(data.data);
				break;
			default:
				break;
		}
	}
	else {//兼容以前的方式
		messageCenter.callMessage('POST_PANEL_MESSAGE', data);
	}
};

/******* 定义end ***********/

/******* 页面处理start ***********/

/**
 * 窗口resize时间
 */
window.onresize = function(){
	resize();
};

/** 监听postMessage消息事件 */ 
if (typeof window.addEventListener != 'undefined') {
	window.addEventListener('message', onMessage, false);
}
else if (typeof window.attachEvent != 'undefined') {
	window.attachEvent('onmessage', onMessage);
}

/**
 * 页面加载后入口
 */
$(function(){
	if (isFromOrm) {//外部JSAPI方式
		//调用判断是否登录
		getUserStatus(userName,false,init);//并初始化页面
	}
	if(isFromOutOm){//权限是否从外部权限系统来
		getOutOmPerssion.getOutOmPermission(init);
	}
	else {
		if (!isLogined) {//验证是否 登录状态
			$("body").show();
			$("body").empty();
			$.messager.alert("操作提示", "您未登录或离开系统过久,请重新登录!","error", function() {
				 window.location.href = path == "" ? "/" : path;
			});
			return;
		}
		//判断用户的权限信息
		getUrlPerssion.cdtGetUrlPermission(init);//并初始化页面
	}
});


/**
 * 初始化
 */
function init(){
	document.title = sysName;
	messageCenter = new MessageCenter();
	topView = new TopView();
	menuView = new MenuView();
	solutionWindowView = new SolutionWindowView();
	solutionFavView = new SolutionFavView();
	workingView = new WorkingView();
	isotopeView = new IsotopeView();
	topView.init();
	menuView.init();
	workingView.initVariable();	
	$("#menu_ul_parent").mCustomScrollbar();
}
