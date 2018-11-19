/* Copyright © 2017-2018 Alex Kukhtin. All rights reserved. */

(function () {

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
			activeTab: 'content'
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
			},
			isActive(name) {
				return name === this.activeTab;
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
				let files = window.app.files;
				let file = files[index];
				me.navigate(file.url);
			});
		},
		mounted() {
			let url = window.location.pathname;
			if (url === '/')
				url = '/index';
			this.navigate(url);
		}
	});
})();