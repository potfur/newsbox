var Profile = Profile || {};
(function(Profile) {
	var key = 'feeds';

	function buildForm(container) {
		var i,
			values = Profile.read(),
			fieldset = DOM.build('ul');

		for(i = 0; i < 10; i++) {
			fieldset.appendChild(DOM.build('li', {}, [
				DOM.build('input', {
					placeholder: 'Feed URL',
					type: 'url',
					name: 'feed[]',
					value: values[i] && values[i]['url'] ? values[i]['url'] : ''
				})
			]));
		}

		fieldset.appendChild(DOM.build('input', { type: 'submit', value: 'Save' }));
		fieldset.appendChild(DOM.build('input', { type: 'button', value: 'Cancel' }));
		fieldset.appendChild(DOM.build('input', { type: 'reset', value: 'Reset' }));

//		container.innerHTML = '';
		container.appendChild(DOM.build('form', { action: '#' }, [ fieldset ]));

		container.addEventListener('click', function(evt) {
			var submit = DOM.find(evt.target, 'input[type=submit]'),
				reset = DOM.find(evt.target, 'input[type=reset]'),
				cancel = DOM.find(evt.target, 'input[type=button]');

			if(submit) {
				evt.preventDefault();
				Profile.submit(container);
				Profile.close();
				return;
			}

			if(reset) {
				evt.preventDefault();
				Profile.reset();
				Profile.close();
				return;
			}

			if(cancel) {
				evt.preventDefault();
				Profile.close();
			}
		})
	}

	Profile.show = function(container) {
		if(container.querySelectorAll('form').length) {
			return;
		}
		buildForm(container)
	};

	Profile.submit = function(container) {
		var i, feeds = [], nodes = container.querySelectorAll('input[name*=feed]');
		for(i = 0; i < nodes.length; i++) {
			feeds.push({ url: nodes[i].value });
		}

		this.write(feeds);

		Event.fire('source:reload');
	};

	Profile.close = function() {
		Event.fire('source:loaded');
	};

	Profile.write = function(feeds) {
		Cookie.set(key, JSON.stringify(feeds));
	};

	Profile.read = function() {
		var feeds = Cookie.get(key);

		if(!feeds) {
			return [];
		}

		return JSON.parse(feeds);
	};

	Profile.reset = function() {
		Cookie.erase(key);
	};


	return Profile;
}(Profile));