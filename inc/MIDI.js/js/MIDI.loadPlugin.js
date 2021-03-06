/*

	MIDI.loadPlugin(callback, type);
	-------------------------------------
	https://github.com/mudx/MIDI.js
	-------------------------------------

*/

if (typeof (MIDI) === "undefined") var MIDI = {};
if (typeof (MIDI.Soundfont) === "undefined") MIDI.Soundfont = {};

(function() { "use strict";

var plugins = { "#webaudio": true, "#html5": true, "#java": true, "#flash": true };

MIDI.loadPlugin = function(callback, instrument, directory) {
	var type, loader;
	var instrument = instrument || "";
	MIDI.audioDetect(function(types) {
		// use the most appropriate plugin if not specified
		if (typeof(type) === 'undefined') {
			if (plugins[window.location.hash]) {
				type = window.location.hash;
			} else {
				type = "";
			}
		}
		if (type === "") {
			var isSafari = navigator.userAgent.toLowerCase().indexOf("safari") !== -1;
			if (window.webkitAudioContext) { // Chrome
				type = "#webaudio";
			} else if (window.Audio && isSafari === false) { // Firefox
				type = "#html5";
			} else { // Safari and Internet Explorer
				type = "#flash";
			}
		}
		// use audio/ogg when supported
		var filetype = types["audio/ogg"] ? "ogg" : "mp3";
		// load the specified plugin
		switch (type) {
			case "#java":
				// works well cross-browser, and highly featured, but required Java machine to startup
				if (loader) loader.message("Soundfont (500KB)<br>Java Interface...");
				MIDI.Java.connect(callback);
				break;
			case "#flash":
				// fairly quick, but requires loading of individual MP3s
				if (loader) loader.message("Soundfont (2MB)<br>Flash Interface...");
				DOMLoader.script.add({
					src: "./inc/SoundManager2/script/soundmanager2.js",
					verify: "SoundManager",
					callback: function () {
						MIDI.Flash.connect(callback);
					}
				});
				break;
			case "#html5":
				// works well in Firefox
				DOMLoader.sendRequest({
					url: directory + "/soundfont/soundfont-" + filetype + "-" + instrument + ".js",
					callback: function (response) {
						MIDI.Soundfont = JSON.parse(response.responseText);
						if (loader) loader.message("Downloading: 100%<br>Processing...");
						MIDI.HTML5.connect(callback);
					}, 
					progress: function (evt) {
						var percent = evt.loaded / 1719931 * 100 >> 0;
						if (loader) loader.message("Downloading: " + (percent + "%"));
					}
				});
				break;
			case "#webaudio":
				// works well in Chrome
				DOMLoader.sendRequest({
					url: directory + "/soundfont/soundfont-" + filetype + "-" + instrument + ".js",
					callback: function(response) {
						MIDI.Soundfont = JSON.parse(response.responseText);
						if (loader) loader.message("Downloading: 100%<br>Processing...");
						MIDI.WebAudioAPI.connect(callback);
					}, 
					progress: function (evt) {
						var percent = evt.loaded / 1719931 * 100 >> 0;
						if (loader) loader.message("Downloading: " + (percent + "%"));
					}
				});
				break;
			default:
				break;
		}
	});
};

})();