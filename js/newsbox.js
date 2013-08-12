var Newsbox = (function() {
	var bridgeUri,
		nodes = {
			container: undefined,
			loader: undefined,
			messenger: undefined,
			clearcache: undefined,
			profile: undefined
		},
		loader = (function() {
			var PE;

			/**
			 * Executes animation
			 */
			function animate() {
				var counter = nodes.loader.style.backgroundPosition;

				if(!counter) {
					counter = '0% 0%';
				}

				counter = parseInt(counter.replace(/([\d]+%|px|pt) ([\d]+%|px|pt)/, '$1'));
				counter = parseInt(counter) + 1;

				nodes.loader.style.backgroundPosition = counter + 'px 0';
			}

			loader = {
				/**
				 * Starts animation
				 */
				start: function() {
					if(PE) {
						PE.stop();
						PE = undefined;
					}

					nodes.loader.style.display = 'block';
					PE = new PeriodicalExecutor(animate, 0.01);
				},

				/**
				 * Stops animation
				 */
				stop: function() {
					if(!PE) {
						return;
					}

					PE.stop();
					nodes.loader.style.display = 'none';
				}
			};

			return loader;
		})(),
		message = {
			/**
			 * Shows new message of set type
			 * @param type
			 * @param msg
			 */
			show: function(type, msg) {
				if(console) {
					switch(type) {
						case 'error':
							console.error(msg);
							break;
						case 'info':
							console.info(msg);
							break;
						default:
							console.log(msg);
					}
				}

				nodes.messenger.appendChild(DOM.build('article', { className: 'message ' + type }, [ DOM.build('p', { text: msg}) ]));
			},
			/**
			 * Removes message from DOM
			 * @param msg
			 */
			hide: function(msg) {
				msg.parentNode.removeChild(msg);
			}
		};

	function load() {
		new Ajax.Request(bridgeUri, {
			method: 'post',
			parameters: {
				feeds: Profile.read()
			},
			onCreate: function() {
				Event.fire('loader:start');
			},
			onFailure: function(t) {
				Event.fire('source:failed');
				Event.fire('message:error', 'Unable to read fresh data from bridge: ' + t.getStatus());
				Event.fire('message:info', 'Trying to retrieve last copy from local storage');
				if(Storage.exists('json')) {
					Event.fire('source:loaded');
					return;
				}

				Event.fire('message:error', 'Local storage is empty, no data to map');
			},
			onSuccess: function(t) {
				if(!t.responseJSON || !t.responseJSON.feeds.length) {
					Event.fire('source:failed');
					Event.fire('message:error', 'Unable to retrieve JSON: ' + t.responseText);

					return;
				}

				var i, json = t.responseJSON;
				for(i = 0; i < json.messages.length; i++) {
					Event.fire('message:error', json.messages[i]);
				}

				Storage.store('json', json.feeds);
				Event.fire('source:loaded');
			},
			onComplete: function() {
				Event.fire('loader:stop');
			}
		});
	}

	/**
	 * Newsbox
	 * Requires css selectors for container, loader and messenger
	 *
	 * @param {Object} ops
	 * @constructor
	 */
	function Newsbox(ops) {
		nodes.container = document.querySelector(ops.container);
		nodes.loader = document.querySelector(ops.loader);
		nodes.messenger = document.querySelector(ops.messenger);

		window.addEventListener('source:reload', this.reload);
		window.addEventListener('source:loaded', this.rebuild);
		window.addEventListener('resize', this.rebuild);
		window.addEventListener('orientationchange', this.rebuild);

		document.addEventListener('loader:start', loader.start);
		document.addEventListener('loader:stop', loader.stop);

		nodes.container.addEventListener('click', function(evt) {
			Treemap.desc(evt)
		});

		document.addEventListener('message:log', function(evt) {
			message.show('log', evt.memo);
		});

		document.addEventListener('message:info', function(evt) {
			message.show('info', evt.memo);
		});

		document.addEventListener('message:error', function(evt) {
			message.show('error', evt.memo);
		});

		nodes.messenger.addEventListener('click', function(evt) {
			var node = DOM.find(evt.target, 'article');
			if(!node) {
				return;
			}

			message.hide(node);
		});

		if(ops.clearcache && (nodes.clearcache = document.querySelector(ops.clearcache))) {
			nodes.clearcache.addEventListener('click', function(evt) {
				evt.preventDefault();
				Storage.clear();
				load();
			});
		}

		if(ops.profile && (nodes.profile = document.querySelector(ops.profile))) {
			nodes.profile.addEventListener('click', function(evt) {
				evt.preventDefault();
				Profile.show(nodes.container);
			});
		}
	}

	/**
	 * Sets bridge URI for loading data
	 * @param {String} uri
	 */
	Newsbox.prototype.bridge = function(uri) {
		bridgeUri = uri;
		return this;
	};

	/**
	 * Loads data from feeds and draws tree map
	 */
	Newsbox.prototype.load = function() {
		load();

		return this;
	};

	/**
	 * Clears cache and loads data from feeds
	 */
	Newsbox.prototype.reload = function() {
		Storage.clear();
		load();

		return this;
	};

	/**
	 * Rebuilds tree map structure without reloading data from feeds
	 */
	Newsbox.prototype.rebuild = function() {
		Treemap.draw(nodes.container, Storage.fetch('json'));

		return this;
	};

	/**
	 * Displays HTML message of set type and content
	 * @param type
	 * @param msg
	 */
	Newsbox.prototype.message = message.show;

	return Newsbox;
})();