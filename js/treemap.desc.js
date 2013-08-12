var Treemap = Treemap || {};

(function(Treemap) {

	function buildDesc(entry) {
		var date = new Date(entry.pubdate * 1000),
			image = entry.image ? DOM.build('a', { className:'img', href:entry.link }, [ DOM.build('img', { src:entry.image })]) : undefined;

		return DOM.build('div', { className:'desc' }, [
			DOM.build('h3', { text:entry.title }, [
				DOM.build('a', { href:entry.link })
			]),
			image,
			DOM.build('a', { className:'close' }),
			DOM.build('p', { text:entry.text }),
			DOM.build('ul', {}, [
				DOM.build('li', { text:date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDay() + ' ' + date.getHours() + ':' + date.getMinutes() }),
				DOM.build('li', {}, [
					DOM.build('a', { text:'» » » »', href:entry.link })
				])
			])
		]);
	}

	Treemap.Builder = Treemap.Builder || {};
	Treemap.Builder.desc = buildDesc;

	return Treemap;
})(Treemap);