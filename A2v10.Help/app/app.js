/* Copyright © 2017-2018 Alex Kukhtin. All rights reserved. */

(function () {

	const popup = require('std:popup');
	const eventBus = require('std:eventBus');

	function makeUrl(url) {
		if (url.startsWith('/'))
			return url; /* root-based */
		let cUrl = window.location.pathname.split('/').filter(x => !!x);
		cUrl.splice(cUrl.length - 1, 1);
		let nUrl = url.split('/').filter(x => !!x);
		let xUrl = [];
		nUrl.forEach(x => {
			if (x === '..') {
				cUrl.splice(cUrl.length - 1, 1);
			} else {
				xUrl.push(x);
			}
		});
		let newUrl = cUrl.concat(xUrl);
		return '/' + newUrl.join('/');
	}

	const vm = new Vue({
		el: '#app',
		data: {
			content: '',
			activeTab: 'content',
			searchText: ''
		},
		methods: {
			navigate(url) {
				url = makeUrl(url);
				if (this.content === url)
					return;
				window.history.pushState(null, null, url);
				this.content = url;
				this.$emit('navigated', this.content);
			},
			tab(name) {
				this.activeTab = name;
				this.$emit('activateTab', name);
			},
			isActive(name) {
				return name === this.activeTab;
			},
			doSearch() {
				if (!this.searchText) return;
				this.tab('fts');
				this.$emit('doSearch', this.searchText);
				this.searchText = '';
			}
		},
		created() {
			let me = this;
			window.vm = this;
			window.addEventListener('popstate', function () {
				me.content = window.location.pathname;
				me.$emit('navigated', me.content);
			}, false);

			this.$on('navigate', function (url) {
				me.navigate(url);
			});

			this.$on('navigateFile', function (index) {
				let files = window.helpapp.files;
				let file = files[index];
				me.navigate(file.url);
			});
			popup.startService();
			eventBus.$on('closeAllPopups', popup.closeAll);
		},
		mounted() {
			let url = window.location.pathname;
			if (url === '/')
				url = '/index';
			this.navigate(url);
		}
	});
})();