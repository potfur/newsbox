#Newsbox
Treemap visualization used for feed aggregation similar to (newsmap.jp)[http://newsmap.jp/].

## Methods

Initialization:

	NB = new Newsbox({
		container: 'section', // tree map container
		loader: '#loader', // animated loader
		messenger: '#messenger', // message container
		profile: 'header > nav > a:nth-child(1)', // button controlling profile view
		clearcache: 'header > nav > a:nth-child(2)'  // button clearing local storage (calling reload() method)
	});

Send messages to view

	NB.message('error', 'Error message');
	NB.message('info', 'Info message');
	NB.message('log', 'Log message');

To load data from bridge (something that reads data from external sources)
Data from bridge are cached in local storage, so if bridge is unavailable in further requests - stored dada is used.

	NB.bridge('http://bridge.com/aggregate/feeds');
	NB.load();

To clear local storage and refresh bridge data

	NB.reload();

To load data from JSON

	NB.read(json);

To rebuild tree map from current data

	NB.rebuild()

## Events

Communication between components bases on custom events eg.

	Event.fire('source:loaded');

All events:

 * `dom:loaded` - dom structure loaded, can manipulate

 * `loader:start` - begins loader animation (if already started, event is ignored)
 * `loader:stop` - stops loader animation

 * `source:loaded` - json data loaded
 * `source:failed` - unable to load data or json has wrong structure

 * `message:error` - an error message occurred, message body is passed as event memo
 * `message:info` - same as above but info,
 * `message:log` - ...