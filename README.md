Newsbox
Treemap visualization used for feed agregation similar to (newsmap.jp)[http://newsmap.jp/].

Usage:

	var NB = new Newsbox({
	    container: 'section', // element containing aggregater entries
	    loader: '#loader', // element acting as loader
	    messenger: '#messenger', // element containing treemap messages
	    profile: 'header > nav > a:nth-child(1)', // profile button
	    clearcache: 'header > nav > a:nth-child(2)' // clear cache button
	});

	NB.message('info', 'This page uses Cookies... blah blah blah.'); // sample message
	NB.bridge('http://your-feed.src').load();

