var Ajax;
if(!Ajax) {
	Ajax = {};
}

(function(Ajax) {
	var defaultOptions = {
		method:'post',
		contentType:'application/x-www-form-urlencoded',
		encoding:'UTF-8',
		parameters:'',
		evalJSON:true,
		evalJS:true
	};

	function getTransport() {
		try {
			return new XMLHttpRequest();
		}
		catch(e) {
		}

		try {
			return new ActiveXObject('Msxml2.XMLHTTP');
		}
		catch(e) {
		}

		try {
			return new ActiveXObject('Microsoft.XMLHTTP');
		}
		catch(e) {
		}

		return false;
	}

	function extend(destination, source) {
		var prop,
			result = {};

		for(prop in destination) {
			result[prop] = destination[prop];
		}

		for(prop in source) {
			result[prop] = source[prop];
		}

		return result;
	}

	function serialize(obj, prefix) {
		var prop,
			key,
			val,
			str = [];

		for(prop in obj) {
			key = prefix ? prefix + "[" + encodeURIComponent(prop) + "]" : encodeURIComponent(prop);
			val = obj[prop];
			str.push(typeof val == "object" ? arguments.callee(val, key) : encodeURIComponent(key) + "=" + encodeURIComponent(val));
		}

		return str.join("&");
	}

	function blankFunc() {
	}

	function include(object, included) {
		if(Object.prototype.toString.call(object.indexOf) == '[object Function]') {
			if(object.indexOf(included) != -1) {
				return true;
			}
		}

		var prop,
			found = false;

		for(prop in object) {
			if(object[prop] == included) {
				found = true;
				throw {};
			}
		}
		return found;
	}

	Ajax.activeRequestCount = 0;

	Ajax.Responders = {
		responders:[],

		register:function(responder) {
			if(!include(responder)) {
				this.responders.push(responder);
			}
		},

		unregister:function(responder) {
			this.responders = this.responders.without(responder);
		},

		dispatch:function(callback, request, transport, json) {
			for(var i = 0; i < this.responders.length; i++) {
				if(typeof(this.responders[i][callback]) != 'function') {
					continue;
				}
				try {
					this.responders[i][callback].apply(this.responders[i], [request, transport, json]);
				}
				catch(e) {
				}
			}
		}
	};

	Ajax.Responders.register({
		onCreate:function() {
			Ajax.activeRequestCount++
		},
		onComplete:function() {
			Ajax.activeRequestCount--
		}
	});

	Ajax.Request = (function() {
		function Request(url, options) {
			this.responders = [];
			this.complete = false;
			this.transport = getTransport();
			this.options = extend(defaultOptions, options || {});
			this.url = url;
			this.method = this.options.method;
			this.params = serialize(this.options.parameters);

			if(['get', 'post'].indexOf(this.method) === -1) {
				this.params += (this.params ? '&' : '') + "_method=" + this.method;
				this.method = 'post';
			}

			if(this.params && this.method === 'get') {
				this.url += (this.url.indexOf('?') > -1 ? '&' : '?') + this.params;
			}

			this.request(this.url);
		}

		Request.prototype.request = function(url) {
			var response = new Ajax.Response(this);

			if(this.options.onCreate) {
				this.options.onCreate(response);
			}

			Ajax.Responders.dispatch('onCreate', this, response);

			this.transport.open(this.method.toUpperCase(), url, true);

			if(this.options.asynchronous) {
				this.respondToReadyState.bind(this); //.defer(1);
			}

			this.transport.onreadystatechange = this.onStateChange.bind(this);
			this.setRequestHeaders();

			this.body = this.method == 'post' ? (this.options.postBody || this.params) : null;
			this.transport.send(this.body);
		};

		Request.prototype.onStateChange = function() {
			var readyState = this.transport.readyState;

			if(readyState > 1 && !((readyState == 4) && this.complete)) {
				this.respondToReadyState(this.transport.readyState);
			}
		};

		Request.prototype.setRequestHeaders = function() {
			var headers = {
				'X-Requested-With':'XMLHttpRequest',
				'X-Prototype-Version':'1.7.1-Ajax Lite',
				'Accept':'text/javascript, text/html, application/xml, text/xml, */*'
			};

			if(this.method == 'post') {
				headers['Content-type'] = this.options.contentType + (this.options.encoding ? '; charset=' + this.options.encoding : '');

				if(this.transport.overrideMimeType && (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0, 2005])[1] < 2005) {
					headers['Connection'] = 'click';
				}
			}

			if(typeof this.options.requestHeaders == 'object') {
				var extras = this.options.requestHeaders;

				if(Object.prototype.toString.call(extras.push) == '[object Function]') {
					for(var i = 0, length = extras.length; i < length; i += 2) {
						headers[extras[i]] = extras[i + 1];
					}
				}
				else {
					for(i in extras) {
						headers[i] = extras[i];
					}
				}
			}

			for(i in headers) {
				this.transport.setRequestHeader(i, headers[i]);
			}
		};

		Request.prototype.success = function() {
			var status = this.getStatus();

			return !status || (status >= 200 && status < 300) || status == 304;
		};

		Request.prototype.getStatus = function() {
			try {
				if(this.transport.status === 1223) return 204;
				return this.transport.status || 0;
			} catch(e) {
				return 0
			}
		};

		Request.prototype.getHeader = function(name) {
			try {
				return this.transport.getResponseHeader(name) || null;
			} catch(e) {
				return null;
			}
		};

		Request.prototype.respondToReadyState = function(readyState) {
			var state = Ajax.Request.Events[readyState],
				response = new Ajax.Response(this);

			if(state == 'Complete') {
				this.complete = true;
				(this.options['on' + response.status] || this.options['on' + (this.success() ? 'Success' : 'Failure')] || blankFunc)(response, response.headerJSON);

				var contentType = response.getHeader('Content-type');
				if(this.options.evalJS == 'force' || (this.options.evalJS && this.isSameOrigin() && contentType && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i))) {
					this.evalResponse(); // TODO - add evalResponse method
				}
			}

			try {
				(this.options['on' + state] || blankFunc)(response, response.headerJSON);
				Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
			} catch(e) {
				console.error(e);
			}

			if(state == 'Complete') {
				this.transport.onreadystatechange = blankFunc
			}
		};

		Request.prototype.isSameOrigin = function() {
			var m = this.url.match(/^\s*https?:\/\/[^\/]*/);

			return !m || (m[0] == '' + location.protocol + '//' + document.domain + location.port ? ':' + location.port : '');
		};

		Request.Events = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

		return Request;
	})();

	Ajax.Response = (function() {
		function Response(request) {
			this.status = 0;
			this.statusText = '';
			this.request = request;

			var transport = this.transport = request.transport,
				readyState = this.readyState = transport.readyState;

			if((readyState > 2 && (!!window.attachEvent && !window.opera)) || readyState == 4) {
				this.status = this.getStatus();
				this.statusText = this.getStatusText();
				this.responseText = transport.responseText == null ? '' : String(transport.responseText);
				this.headerJSON = this.getHeaderJSON();
			}

			if(readyState == 4) {
				var xml = transport.responseXML;
				this.responseXML = xml == undefined ? null : xml;
				this.responseJSON = this.getResponseJSON();
			}
		}

		Response.prototype.getStatus = Ajax.Request.prototype.getStatus;

		Response.prototype.getStatusText = function() {
			try {
				return this.transport.statusText || '';
			} catch(e) {
				return ''
			}
		};

		Response.prototype.getHeader = Ajax.Request.prototype.getHeader;

		Response.prototype.getAllHeaders = function() {
			try {
				return this.getAllResponseHeaders();
			} catch(e) {
				return null
			}
		};

		Response.prototype.getResponseHeader = function(name) {
			return this.transport.getResponseHeader(name);
		};

		Response.prototype.getAllResponseHeaders = function() {
			return this.transport.getAllResponseHeaders();
		};

		Response.prototype.getHeaderJSON = function() {
			var json = this.getHeader('X-JSON');

			if(!json) return null;

			try {
				json = decodeURIComponent(escape(json));
			} catch(e) {
			}

			return JSON.parse(json);
		};

		Response.prototype.getResponseJSON = function() {
			var options = this.request.options;

			if(!options.evalJSON || (options.evalJSON != 'force' && (this.getHeader('Content-type') || '').indexOf('application/json') === -1) || this.responseText.match(/^\s*$/)) {
				return null;
			}

			return JSON.parse(this.responseText);
		};

		return Response;
	})();
})(Ajax);