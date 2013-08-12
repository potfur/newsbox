var Treemap = Treemap || {};

(function(Treemap) {

	/**
	 * Builds DOM element representing tree map leaf
	 * @type {Function}
	 */
	var buildEntry = (function() {
		var options = {
			ratio:{ min:0, max:0.8 },
			font:{ min:8, max:100, height:1.25, width:0.75 }
		};

		/**
		 * Calculates elements proportions based on its weight
		 * @param {Number} weight
		 * @return {Number}
		 */
		function calculateRatio(weight) {
			var ratio = 1 - weight / 1000;

			if(ratio > options.ratio.max) {
				ratio = options.ratio.max;
			}

			if(ratio < options.ratio.min) {
				ratio = options.ratio.min;
			}

			return ratio;
		}

		/**
		 * Calculates font size in element according to its size (tries to fit text in container)
		 * Returns font size
		 * @param {String} text
		 * @param {Number} width
		 * @param {Number} height
		 * @return {Number}
		 */
		function calculateFontSize(text, width, height) {
			// styled margin
			width -= 10;
			height -= 10;

			var fontSize = options.font.max,
				tArr = text.split(' '),
				i,
				strWidth = 1,
				strHeight = tArr.length;

			while((strHeight * fontSize * options.font.height >= height || strWidth * fontSize * options.font.width >= width) && fontSize > options.font.min) {
				fontSize--;
				strHeight = 1;

				for(i = 0; i < tArr.length; i++) {
					strWidth += tArr[i].length;
					if(strWidth * fontSize * options.font.width >= width) {
						strWidth = 0;
						strHeight += 1;
					}
				}
			}

			return fontSize;
		}

		/**
		 * Builds DOM element with all inner dependencies representing tree map leaf
		 */
		return function(parent, entry, x, y, width, height) {
			if(!entry.title || !entry.link || entry.x == undefined || entry.y == undefined) {
				return undefined;
			}

			x = Math.ceil(x) - parseInt(parent.style.left);
			y = Math.ceil(y) - parseInt(parent.style.top);

			if(width <= 0 || height <= 0 || x < 0 || y < 0) {
				return undefined;
			}

			var fontSize = calculateFontSize(entry.title, width, height);
			var Node = DOM.build(
				'article',
				{
					'data-guid':entry.guid,
					style:{
						position:'absolute',
						display:'block',
						left:x + 'px',
						top:y + 'px',
						width:width + 'px',
						height:height + 'px',
						fontSize:fontSize + 'px',
						background:'rgba(0, 0, 0, ' + calculateRatio(entry.weight) + ')',
						borderTop:'1px solid rgba(0, 0, 0, 0.33)',
						borderLeft:'1px solid rgba(0, 0, 0, 0.33)'
					}
				},
				[
					DOM.build('h2', { text:entry.title })
				]
			);


			Storage.store('entry'+entry.guid, entry);

			return Node;
		};
	})();

	Treemap.Builder = Treemap.Builder || {};
	Treemap.Builder.entry = buildEntry;

	return Treemap;
})(Treemap);