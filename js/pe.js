var PeriodicalExecutor = (function() {
	var options = {
		timer:null,
		currentlyExecuting:false,
		frequency:null,
		callback:undefined
	};

	/**
	 * Calls set function
	 * Prevents multiple simultaneous calls
	 */
	function onTimerEvent() {
		if(!options.currentlyExecuting) {
			try {
				options.currentlyExecuting = true;
				options.callback();
				options.currentlyExecuting = false;
			} catch(e) {
				options.currentlyExecuting = false;
				throw e;
			}
		}
	}

	/**
	 * Registers timer callback
	 */
	function registerCallback() {
		options.timer = setInterval(onTimerEvent, this.frequency * 1000);
	}

	/**
	 * Creates periodical executor
	 * @param {Function} callback function
	 * @param {Integer} frequency callback frequency in seconds
	 * @constructor
	 */
	function PeriodicalExecuter(callback, frequency) {
		options.callback = callback;
		options.frequency = frequency;
		options.currentlyExecuting = false;

		registerCallback();
	}

	/**
	 * Stops execution
	 */
	PeriodicalExecuter.prototype.stop = function() {
		if(!options.timer) {
			return;
		}

		clearInterval(options.timer);
		options.timer = null;
	};

	return PeriodicalExecuter;
})();