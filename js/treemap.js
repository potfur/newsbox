var Treemap = Treemap || {};
(function(Treemap) {
	var options = {
		ratio: 2.8,
		width: 0,
		height: 0,
		min: { width: 48, height: 20, weight: 1 },
		max: { width: 480, height: 200, weight: 99999 }
	};

	/**
	 * Generates multidimensional array containing tree map structure
	 * Splits received array into smaller parts according to weight of elements
	 * @param {Array} items
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 */
	function splitTreeMap(items, x, y, width, height) {
		var weight,
			widthA,
			heightA,
			widthB,
			heightB;

		if(!items || !items.length) {
			return;
		}

		if(items.length == 1) {
			items[0].x = x;
			items[0].y = y;
			items[0].width = width;
			items[0].height = height;

			if(items[0].content && items[0].content.length) {
				splitTreeMap(items[0].content, x, y, width, height);
			}

			return;
		}

		items = splitItems(items);
		weight = calculateWeight(items[0]) + calculateWeight(items[1]);

		widthA = Math.ceil(width * calculateWeight(items[0]) / weight);
		heightA = Math.ceil(height * calculateWeight(items[0]) / weight);

		widthB = width - widthA;
		heightB = height - heightA;

		if(widthA < options.min.width || heightA < options.min.height) {
			splitTreeMap(items[1], x, y, width, height);
			return;
		}

		if(widthB < options.min.width || heightB < options.min.height) {
			splitTreeMap(items[0], x, y, width, height);
			return;
		}

		if(width / height > options.ratio) {
			splitTreeMap(items[0], x, y, widthA, height);
			splitTreeMap(items[1], x + widthA, y, widthB, height);
			return;
		}

		splitTreeMap(items[0], x, y, width, heightA);
		splitTreeMap(items[1], x, y + heightA, width, heightB);

	}

	/**
	 * Splits array into two arrays according to weight
	 * @param {Array} items
	 * @return {Array}
	 */
	function splitItems(items) {
		var i,
			listA = [],
			listB = [],
			weightA = 0, half = calculateWeight(items) / 2,
			tmp;

		for(i = 0; i < items.length; i++) {
			items[i].x = items[i].y = undefined;
			tmp = weightA + items[i].weight;

			if(Math.abs(half - tmp) > Math.abs(half - weightA)) {
				listB.push(items[i]);
				continue;
			}

			listA.push(items[i]);
			weightA = tmp;
		}

		if(!listA.length) {
			return listB;
		}

		if(!listB.length) {
			return listA;
		}

		return [ listA, listB ];
	}

	/**
	 * Calculates total weight of passed array
	 * @param {Array} items
	 * @return {Number}
	 */
	function calculateWeight(items) {
		var i,
			weight = 0;

		if(!items.length) {
			return 0;
		}

		for(i = 0; i < items.length; i++) {
			calculateFixedWeight(items[i]);
			weight += parseInt(items[i].weight);
		}

		if(!weight) {
			Event.fire('message:error', 'Weight must be greater than 0');
		}

		return weight;
	}

	/**
	 * Calculates weight for item with fixed size
	 * @param item
	 */
	function calculateFixedWeight(item) {
		if(!item.fixed) {
			return;
		}

		var is = item.fixed.width * item.fixed.height,
			cs = options.container.offsetWidth * options.container.offsetHeight;

		item.weight = parseInt(is * options.weight / (cs - is));
	}

	/**
	 * Builds DOM structure representing tree map
	 * @param {HTMLElement} parentNode
	 * @param {Array} items
	 */
	function buildTreeMap(parentNode, items) {
		var i,
			Node;

		for(i = 0; i < items.length; i++) {
			if(!Treemap.Builder[items[i].type]) {
				throw 'No builder defined for type "' + items[i].type;
			}

			Node = Treemap.Builder[items[i].type](parentNode, items[i], items[i].x, items[i].y, items[i].width, items[i].height);

			if(!Node) {
				continue;
			}

			parentNode.appendChild(Node);

			if(items[i].content && items[i].content.length) {
				buildTreeMap(Node, items[i].content)
			}
		}
	}

	function clear(container) {
		container.innerHTML = '';
	}

	/**
	 * Builds tree map structure and draws its DOM representation
	 * @param {HTMLElement} container
	 * @param {Array} items
	 * @return {Number}
	 */
	function draw(container, items) {
		Event.fire('loader:start');

		options.container = container;
		options.width = container.offsetWidth;
		options.height = container.offsetHeight;
		options.weight = 0;

		if(!options.width || !options.height) {
			Event.fire('message:error', 'Unable to read container dimensions');
			Event.fire('loader:stop');
			return 0;
		}

		if(items.length == 0 || !items[0].content || !items[0].content.length) {
			Event.fire('message:error', 'No items to map');
			Event.fire('loader:stop');
			return 0;
		}

		for(var i = 0, l = items.length; i < l; i++) {
			options.weight += items[i].weight;
		}

		clear(container);

		splitTreeMap(items, 0, 0, options.width, options.height);
		buildTreeMap(options.container, items, builders);

		Event.fire('loader:stop');

		return items.length;
	}

	/**
	 * OnClick handler
	 * Called when onClick event occurred on tree map leaf
	 * Toggles visibility of description contained in leaf
	 *
	 * @type {Function}
	 */
	var desc = (function() {
		function cumulativeOffset(element) {
			var valueT = 0,
				valueL = 0;

			if(element.parentNode) {
				do {
					valueT += element.offsetTop || 0;
					valueL += element.offsetLeft || 0;
					element = element.offsetParent;
				} while(element);
			}
			return [valueL, valueT];
		}

		/**
		 * Recalculates descriptions position to fit on screen
		 * @param {HTMLElement} element
		 */
		function position(element) {
			var dn = element.querySelector('.desc');
			if(!dn) {
				return;
			}

			var ep = cumulativeOffset(element),
				dp = [ 0, 0 ],
				es = [ element.offsetWidth, element.offsetHeight],
				ds = [ dn.offsetWidth, dn.offsetHeight ],
				dc = [ 'desc' ],
				cs = [ options.container.offsetWidth, options.container.offsetHeight ];

			if(ep[0] + es[0] / 2 < cs[0] / 2) {
				dc.push('left');
				dp[0] = ep[0] + es[0] > cs[0] - ds[0] ? cs[0] - ep[0] - ds[0] : es[0];
			}
			else {
				dc.push('right');
				dp[0] = ep[0] - ds[0] < 0 ? -ds[0] - (ep[0] - ds[0]) : -ds[0];
			}

			if(ep[1] + es[1] / 2 < cs[1] / 2) {
				dc.push('top');
				dp[1] = 0;
			}
			else {
				dc.push('bottom');
				dp[1] = es[1] - ds[1];
			}

			dn.className = dc.join(' ');
			dn.style.left = dp[0] + 'px';
			dn.style.top = dp[1] + 'px';
		}

		/**
		 * Shows elements description (if exists)
		 * @param {HTMLElement} element
		 */
		function show(element) {
			var entry, desc = element.querySelector('.desc');
			if(desc) {
				position(element);
				desc.style.visibility = 'visible';
				return;
			}

			entry = Storage.fetch('entry' + element.getAttribute('data-guid'));
			if(!entry) {
				return;
			}

			desc = Treemap.Builder.desc(entry);
			element.appendChild(desc);
			position(element);
			desc.style.visibility = 'visible';
		}

		/**
		 * Hides elements description (if exists)
		 * @param {HTMLElement} element
		 */
		function hide(element) {
			var desc = element.querySelector('.desc');
			if(!desc) {
				return;
			}

			desc.style.visibility = 'hidden';
		}

		/**
		 * OnClick handler
		 */
		return function(evt) {
			var i,
				element,
				elements = document.querySelectorAll('article');

			for(i = 0; i < elements.length; i++) {
				hide(elements[i]);
			}

			if(DOM.match(evt.target, '.desc a') || DOM.match(evt.target, '.desc a img') || DOM.match(evt.target, 'article .click')) {
				return;
			}

			element = DOM.find(evt.target, 'article');
			if(!element) {
				return;
			}

			show(element);
		};
	})();

	Treemap.draw = draw;
	Treemap.clear = clear;
	Treemap.desc = desc;

	return Treemap;
})(Treemap);