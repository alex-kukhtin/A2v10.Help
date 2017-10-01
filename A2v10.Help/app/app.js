
(function () {

	function makeUrl(url) {
		if (url.startsWith('/'))
			return url; // root-based
		let cUrl = window.location.pathname.split('/').filter(x => !!x);
		cUrl.splice(cUrl.length - 1, 1);
		let nUrl = url.split('/').filter(x => !!x);
		let xUrl = [];
		nUrl.forEach(x => {
			if (x === '..')
				cUrl.splice(cUrl.length - 1, 1);
			else
				xUrl.push(x);
		})
		let newUrl = cUrl.concat(xUrl);
		return '/' + newUrl.join('/');
	}

	const vm = new Vue({
		el: '#app',
		data: {
			content: ''
		},
		methods: {
			navigate(url) {
				url = makeUrl(url);
				window.history.pushState(null, null, url);
				this.content = url;
			}
		},
		created() {
			let me = this;

			window.addEventListener('popstate', function () {
				me.content = window.location.pathname;
			}, false);

			this.$on('navigate', function (url) {
				me.navigate(url);
			});
		},
		mounted() {
			let url = window.location.pathname;
			if (url === '/')
				url = '/index';
			this.navigate(url);
		}
	});

	window.vm = vm;

})();