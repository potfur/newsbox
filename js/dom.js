var DOM = DOM || {};
(function(DOM) {
	/**
	 * Creates DOM element with set properties
	 * If style property set - its values will be assigned as elements styles
	 * If className property set - will be set as elements classes
	 * If text property set - its value will be set as elements innerHTML
	 *
	 * @param {String} tag
	 * @param {Object} [properties]
	 * @param {Array} [children]
	 * @return {HTMLElement}
	 * @constructor
	 */
	DOM.build = function(tag, properties, children) {
		var i,
			j,
			l,
			node = document.createElement(tag);

		if(properties) {
			for(i in properties) {
				switch(i) {
					case 'style':
						break;
					case 'className':
						node.className = properties[i];
						break;
					case 'text':
						node.innerHTML = properties[i]
						break;
					default:
						node.setAttribute(i, properties[i]);
				}
			}

			if(properties.style) {
				for(j in properties['style']) {
					node.style[j] = properties['style'][j];
				}
			}
		}

		if(!children) {
			return node;
		}

		for(i = 0, l = children.length; i < l; i++) {
			if(!children[i]) {
				continue;
			}

			node.appendChild(children[i]);
		}

		return node;
	};

	/**
	 * Iterates over passed elements parents to match css selector
	 * Returns first element matching css selector
	 * @param {HTMLElement} element
	 * @param {String} selector css selector
	 * @return {HTMLElement|undefined}
	 */
	DOM.find = function(element, selector) {
		if(!element.parentNode) {
			return undefined;
		}

		if(DOM.match(element, selector)) {
			return element;
		}

		while(element = element.parentNode) {
			if(DOM.match(element, selector)) {
				return element;
			}
		}

		return undefined;
	};

	/**
	 * Matches element to css selector
	 * @param {HTMLElement} element
	 * @param {String} selector
	 * @return {Boolean}
	 */
	DOM.match = function(element, selector) {
		if(!element.parentNode) {
			return false;
		}

		var i,
			l,
			nodes = element.parentNode.querySelectorAll(selector);

		if(!nodes.length) {
			return false;
		}

		for(i = 0, l = nodes.length; i < l; i++) {
			if(nodes[i] != element) {
				continue;
			}

			return true;
		}

		return false;
	};

	return DOM;
})(DOM);