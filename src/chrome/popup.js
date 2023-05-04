(function (window) {
	function setAVIMConfig(key, value) {
		var obj = { 'save_prefs': 'all' };
		if (key == 'method') {
			obj = { 'save_prefs': 'all', 'method': value, 'onOff': 1 };
		}
		if (key == 'onOff') {
			obj = { 'save_prefs': 'all', 'onOff': value };
		}
		if (key == 'enabledList') {
			obj = { 'save_prefs': 'all', 'enabledList': value };
		}
		chrome.extension.sendMessage(obj, function (response) {
			window.location.reload();
		});
	}

	function getI18n(message) {
		return chrome.i18n.getMessage(message);
	}

	function loadText() {
		var keys = ["Sel", "Telex", "Off", "EnabledList"]; // "Tips", "TipsCtrl", "Demo", "DemoCopy",
		for (var k in keys) {
			$g("txt" + keys[k]).innerHTML = getI18n("extPopup" + keys[k]);
		}
	}

	function hightlightDemo() {
		$g("inputDemo").focus();
		$g("inputDemo").select();
	}

	function $g(id) {
		return document.getElementById(id);
	}

	function init() {
		loadText();

		var offEle = $g("off");
		var telexEle = $g("telex");
		var enabledListEle = $g("enabledList");
		var saveEle = $g("save");

		chrome.extension.sendMessage({ 'get_prefs': 'all' }, function (response) {
			if (response.onOff === 0) {
				offEle.checked = true;
			} else {
				telexEle.checked = true;
			}
			console.log(response)
			enabledListEle.value = response.enabledList || "";
		});

		offEle.addEventListener("click", function () { setAVIMConfig('onOff', 0); });
		telexEle.addEventListener("click", function () { setAVIMConfig('method', 1); });
		saveEle.addEventListener("click", function () {
			setAVIMConfig('enabledList', enabledListEle.value);
		});
		// $g("demoCopy").addEventListener("click", hightlightDemo);
	}

	//	window.onload = init;
	init();
})(window);
