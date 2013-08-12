var Treemap = Treemap || {};

(function(Treemap) {

	/**
	 * Builds DOM element representing category container
	 * @param {HTMLElement} parent
	 * @param {Object} entry
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 * @return {Function}
	 */
	var buildCategory = function(parent, entry, x, y, width, height) {
		if(!entry.title || entry.x == undefined || entry.y == undefined) {
			return undefined;
		}

		x = Math.ceil(x);
		y = Math.ceil(y);

		if(width <= 0 || height <= 0 || x < 0 || y < 0) {
			return undefined;
		}

		var Node = DOM.build('section', { style:{
			position:'absolute',
			display:'block',
			left:x + 'px',
			top:y + 'px',
			width:width + 'px',
			height:height + 'px'
		}}, [
			DOM.build('h1', { text:entry.title })
		]);

		if(entry.color) {
			Node.style.background = entry.color;
		}

		return Node;
	};

	Treemap.Builder = Treemap.Builder || {};
	Treemap.Builder.category = buildCategory;

	return Treemap;
})(Treemap);