let map = {};

(function (window) {
	var localStorage = window.localStorage;

	function setLocalStorageItem(key, value) {
		if (localStorage)
			localStorage[key] = value;
	}

	function getLocalStorageItem(key) {
		if (localStorage)
			return localStorage.getItem(key);

		return;
	}

	function getPrefs(callback) {
		if (!getLocalStorageItem('method')) {
			init();
		}
		var prefs = {
			'method': parseInt(getLocalStorageItem('method')),
			'onOff': parseInt(getLocalStorageItem('onOff')),
			'ckSpell': parseInt(getLocalStorageItem('ckSpell')),
			'oldAccent': parseInt(getLocalStorageItem('oldAccent')),
			'enabledList': getLocalStorageItem('enabledList') || '',
		};

		var m = prefs.enabledList.split('\n');
		for (var i = 0; i < m.length; i++) {
			map[m[i].trim()] = true;
		}

		callback.call(this, prefs);
	}

	function turnAvim(callback) {
		if (!getLocalStorageItem('method')) {
			init();
		}

		var onOff = getLocalStorageItem('onOff');
		setLocalStorageItem('onOff', onOff == '1' ? '0' : '1');

		chrome.tabs.query({ active: true }, tabs => {
			const tab = tabs[0];
			const hostname = new URL(tab.url).hostname;
			map[hostname] = onOff ? '1' : '0';
		});

		getPrefs(function (prefs) {
			updateAllTabs(prefs);
			callback.call(this);
		});
	}

	function updateAllTabs(prefs) {
		chrome.tabs.query({}, function (tabs) {
			for (var i = 0; i < tabs.length; i++) {
				var tab = tabs[i];
				chrome.tabs.sendMessage(tab.id, prefs);
			}
		});

		updateIcon(prefs);
	}

	function update() {
		chrome.tabs.query({ active: true }, tabs => {
			const tab = tabs[0];
			const hostname = new URL(tab.url).hostname;

			var onOff = map[hostname] ? '1' : '0';
			setLocalStorageItem('onOff', onOff);

			getPrefs(function (prefs) {
				updateAllTabs(prefs);
				callback.call(this);
			});
		});
	}

	chrome.tabs.onActivated.addListener(function (activeInfo) {
		update();
	});

	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		update();
	});

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

	function savePrefs(request, callback) {
		if (typeof request.method != 'undefined') {
			setLocalStorageItem("method", request.method);
		}
		if (typeof request.onOff != 'undefined') {
			setLocalStorageItem("onOff", request.onOff);
		}
		if (typeof request.ckSpell != 'undefined') {
			setLocalStorageItem("ckSpell", request.ckSpell);
		}
		if (typeof request.oldAccent != 'undefined') {
			setLocalStorageItem("oldAccent", request.oldAccent);
		}
		if (typeof request.enabledList != 'undefined') {
			setLocalStorageItem("enabledList", request.enabledList);
		}

		getPrefs(function (prefs) {
			updateAllTabs(prefs);
			callback.call(this);
		});
	}

	function processRequest(request, sender, sendResponse) {
		if (request.get_prefs) {
			getPrefs(sendResponse);
			return;
		}

		if (request.save_prefs) {
			savePrefs(request, sendResponse);
			return;
		}

		if (request.turn_avim) {
			turnAvim(sendResponse);
			return;
		}
	}

	function genericOnClick() {
		alert("demo");
	}

	function createMenus() {
		var parentId = chrome.contextMenus.create({ "title": "AVIM", "contexts": ["selection"] });
		var demo = chrome.contextMenus.create({ "title": "AVIM Demo", "contexts": ["selection"], "parentId": parentId, "onclick": genericOnClick });
	}

	function init() {
		if (!getLocalStorageItem('method')) {
			setLocalStorageItem('method', '0');
		}

		if (!getLocalStorageItem('onOff')) {
			setLocalStorageItem('onOff', '1');
		}

		if (!getLocalStorageItem('ckSpell')) {
			setLocalStorageItem('ckSpell', '1');
		}

		if (!getLocalStorageItem('oldAccent')) {
			setLocalStorageItem('oldAccent', '1');
		}

		if (!getLocalStorageItem('enabledList')) {
			setLocalStorageItem('enabledList', '');
		}

		getPrefs(updateIcon);

		chrome.extension.onMessage.addListener(processRequest);

		//createMenus();
	}

	init();

})(window);
