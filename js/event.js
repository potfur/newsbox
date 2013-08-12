var Event = Event || {};
(function(Event) {

	/**
	 * Fires custom event
	 * @param {String} name event name
	 * @param {String} [memo] additional info eg. message
	 */
	Event.fire = function(name, memo) {
		if(!memo) {
			memo = name;
		}

		var event = document.createEvent('HTMLEvents');
		event.initEvent(name, true, true);
		event.eventName = name;
		event.memo = memo;
		document.dispatchEvent(event);

	};

	/**
	 * Adds event listener method to object if missing
	 */
	if(!typeof Object.addEventListener) {
		Object.prototype.addEventListener = function addEvent(type, fn) {
			this['e' + type + fn] = fn;
			this[type + fn] = function() {
				this['e' + type + fn](window.event);
			};
			this.attachEvent('on' + type, this[type + fn]);
		}
	}

	/**
	 * Fires custom event when DOM is loaded
	 */
	document.addEventListener('readystatechange', function() {
		document.loaded = document.readyState == 'complete';

		if(document.loaded) {
			Event.fire('dom:loaded');
		}
	});

	return Event;
})(Event);