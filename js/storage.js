var Storage = Storage || {};
(function(Storage) {
	var local = ('localStorage' in window) && window['localStorage'] !== null;
	var buffer = {};

	Storage.store = function(key, data) {
		if(local) {
			localStorage[key] = JSON.stringify(data);
			return;
		}

		buffer[key] = data;
	};

	Storage.fetch = function(key) {
		if(local) {
			return JSON.parse(localStorage[key]);
		}

		return buffer[key];
	};

	Storage.clear = function() {
		if(local) {
			localStorage.clear();
		}

		buffer = {};
	};

	Storage.exists = function(key) {
		if(local) {
			return localStorage[key] ? true : false;
		}

		return buffer[key] ? true : false;
	};

	return Storage;
})(Storage);