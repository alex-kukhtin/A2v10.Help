(function () {

	function doNavigate(event) {
		event.preventDefault();
		let route = this.getAttribute('data-route');
		window.vm.$emit('navigate', route);
	}

	function setHrefs(body) {
		let a = body.querySelectorAll('a');
		a.forEach(function (an) {
			let href = an.getAttribute('href');
			if (href.startsWith('http')) return; // external link
			an.setAttribute('href', '');
			an.setAttribute('data-route', href);
			an.addEventListener('click', onClickAnchor);
		});
	}

	function loadHtml(url) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.onload = function () {
				let prs = new DOMParser();
				let doc = prs.parseFromString(xhr.responseText, 'text/html');
				let body = doc.body;
				setHrefs(body);
				resolve(body);
			}
			xhr.open('GET', url, true);
			xhr.send();
		});
	}

	Vue.component('a2-include', {
		template: '<div class="content-view"></div>',
		props: {
			source: String
		},
		watch: {
			source: function (newSource, oldSource) {
				this.navigateTo(newSource);
			}
		},
		methods: {
			navigateTo(url) {
				let me = this;
				loadHtml('html/' + url + '.html').then(function (elem) {
					me.$el.innerHTML = '';
					let div = document.createElement('div');
					let ch = elem.children;
					let cha = [];
					for (let ch of elem.children) {
						cha.push(ch);
					}
					for (ch of cha)
						me.$el.appendChild(ch);
				});
			}
		}
	});

})();

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