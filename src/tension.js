var vi_list = [
	"https://chat.zalo.me",
	"https://www.facebook.com",
	//"edge://extensions/"
];

var prefs = {};

var tabsOnOff = {};

function onCurrentTab(callback) {
	chrome.tabs.query({active: true, lastFocusedWindow: true}, ([tab]) => {
		callback.call(this, tab);
	});
}

function withPrefs(callback) {
	// console.log('withPrefs(callback): ', callback);
	if (prefs['method'] == undefined) {
		init();
	}

	// onCurrentTab(tab => {
	// 	console.log(tab);
	// 	prefs['onOff'] = tabsOnOff[tab.id];
	// 	console.log('prefs: ', prefs);
	// 	callback.call(this, prefs);
	// });
	//prefs['onOff'] = tabsOnOff[tab.id];
	console.log('prefs: ', prefs);
	callback.call(this, prefs);
}

// function saveOnOff

// function turnAvim(callback) {
// 	console.log('turnAvim(callback): ', callback);
// 	if (prefs['method'] == undefined) {
// 		init();
// 	}

// 	withPrefs(prefs => {
// 		prefs['onOff'] = prefs['onOff']=='1'?'0':'1';
// 		updateCurrentTab(prefs);
// 		callback.call(this);
// 	});
// }

// function updateAllTabs(prefs) {
// 	console.log('updateAllTabs(prefs): ', prefs);
// 	chrome.tabs.query({}, function(tabs){
// 		for (var i=0; i<tabs.length; i++) {
// 			var tab = tabs[i];
// 			chrome.tabs.sendMessage(tab.id, prefs);
// 		}
// 	});

// 	updateIcon(prefs);
// }

function updateCurrentTab(prefs) {
	console.log('updateCurrentTab(prefs): ', prefs);
	onCurrentTab(tab => {
		chrome.tabs.sendMessage(tab.id, prefs);
	});

	updateIcon(prefs);
}

function updateIcon(prefs) {
	var txt = {};
	var bg = {};

	if (prefs.onOff == 1) {
		txt.text = "on";
		bg.color = [0, 255, 0, 255];
	} else {
		txt.text = "off";
		bg.color = [255, 0, 0, 255];
	}

	chrome.browserAction.setBadgeText(txt);
	chrome.browserAction.setBadgeBackgroundColor(bg);
}

function processRequest(request, sender, sendResponse) {
	console.log('processRequest: ', request, sender, sendResponse);
	if (request.get_prefs) {
		withPrefs(sendResponse);
		return;
	}

	if (request.turn_avim) {
		turnAvim(sendResponse);
		return;
	}
}

function init() {

	prefs = {
		'method': 1,
		'onOff': 0,
		'ckSpell': 0,
		'oldAccent': 1
	};

	chrome.tabs.query({}, function(tabs) {
		for (var i=0; i<tabs.length; i++) {
			var tab = tabs[i];
			for (vi_site of vi_list) {
				if (tab.url.startsWith(vi_site)) {
					tabsOnOff[tab.id] = 1;
					break;
				}
			}
			if (!tabsOnOff[tab.id]) {
				tabsOnOff[tab.id] = 0;
			}
		}
		console.log('init: tabsOnOff: ', tabsOnOff);
	});

	withPrefs(updateCurrentTab);

	chrome.extension.onMessage.addListener(processRequest);
}

chrome.runtime.onInstalled.addListener(() => {
	chrome.runtime.onStartup.addListener(() => {
		init();
	});

	chrome.tabs.onActivated.addListener(() => {
		// withPrefs(function(prefs){
		// 	updateCurrentTab(prefs);
		// });
	});

	chrome.tabs.onUpdated.addListener(() => {
		//console.log('Tab reload:', chrome.tabs);
	});
});

init();
