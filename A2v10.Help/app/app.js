
(function () {

	const vm = new Vue({
		el: '#app',
		data: {
			content: ''
		},
		methods: {
			navigate(url) {
				window.history.pushState(null, null, url);
				this.content = url;
			}
		},
		created() {
			let me = this;
			window.addEventListener('popstate', function () {
				me.content = window.location.pathname;
			}, false);
			me.$on('navigate', function (url) {
				me.navigate(url);
			});
		},
		mounted() {
			let url = window.location.pathname;
			if (url === '/')
				url = '/default';
			this.navigate(url);
		}
	});

	window.vm = vm;

})();