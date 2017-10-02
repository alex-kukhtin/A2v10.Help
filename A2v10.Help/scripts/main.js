(function() { 
/*GENERATED*/
const content = {
  "items": [
    {
      "title": "A2:SDK",
      "url": "index",
      "items": [
        {
          "title": "Что нового",
          "url": "whatsnew/index",
          "items": [
            {
              "title": "Октябрь 2017",
              "url": "whatsnew/w201710"
            }
          ]
        }
      ]
    },
    {
      "title": "База данных",
      "url": "database/index",
      "items": [
        {
          "title": "Основные концепции",
          "url": "database/concepts"
        },
        {
          "title": "Таблицы",
          "url": "database/tables"
        },
        {
          "title": "Пердставления",
          "url": "database/views"
        },
        {
          "title": "Модели данных",
          "url": "database/models"
        }
      ]
    },
    {
      "title": "Представления",
      "url": "views/index",
      "items": [
        {
          "title": "Язык XAML",
          "url": "xaml/language"
        }
      ]
    },
    {
      "title": "Шаблоны",
      "url": "= template/index",
      "items": [
        {
          "title": "Свойства",
          "url": "template/properties"
        },
        {
          "title": "События",
          "url": "template/events"
        },
        {
          "title": "Команды",
          "url": "template/commands"
        },
        {
          "title": "Валидаторы",
          "url": "template/validators"
        }
      ]
    },
    {
      "title": "Справочник",
      "url": "reference/index",
      "items": [
        {
          "title": "A2v10.Xaml - пространство имен",
          "url": "reference/a2v10.xaml"
        }
      ]
    }
  ]
}
;
const files = [{"url":"/index","title":"Главная"},{"url":"/whatsnew/index","title":"Что нового"},{"url":"/whatsnew/w201710","title":"Октябрь 2017"}];
const index = {"word1":[0],"word2":[0],"Что нового":[1,2],"Описание":[1],"Октябрь 2017":[2]};
const fts = {"default":[0],"page":[0],"another":[0],"paragraph":[0],"длинный":[0],"текст":[0],"разными":[0],"знаками":[0],"препинания":[0],"скобки":[0],"такие":[0],"$доллар":[0],"амперсанд":[0],"несколько":[0],"строк":[0],"со":[0],"скобками":[0],"a2.web.text":[0],"whats":[0],"new":[0,1],"большими":[0],"буквами":[0],"what's":[1],"in":[1],"a2":[1],"main":[1],"october":[1],"2017":[1,2],"октябрь":[2],"что":[2],"нового":[2],"content":[2]};
window.app = {content: content, files: files, index: index, fts: fts};
})();

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
			an.addEventListener('click', doNavigate);
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
			};
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
				if (url === '/')
					url += 'index';
				console.warn(url);
				loadHtml('/html' + url + '.html').then(function (elem) {
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

	

	Vue.component('a2-content-view', {
		template: '<pre v-once>{{root.items}}</pre>',
		data() {
			return {
				root: window.app.content
			};
		}
	});
})();
(function () {



	Vue.component('a2-index-view', {
		template: `
<div>
	<ul>
		<li @click.prevent="navigate(val[0])" v-for="(val, key) in root">{{key}}</li>
	</ul>
	<pre v-once>{{root}}</pre><pre v-once>{{files}}</pre>
</div>`,
		data() {
			return {
				root: window.app.index,
				files: window.app.files
			};
		},
		methods: {
			navigate(ix) {
				var vm = window.vm;
				vm.$emit('navigateFile', ix);
			}
		}
	});
})();
(function () {



	Vue.component('a2-search-view', {
		template: 
`<div>
	<div>
		<input v-model.lazy="searchText">
	</div>
	<span>{{searchText}}</span>
	<ul>
		<li @click.prevent="navigate(res)" v-for="(res, key) in searchResult">{{key}} : {{res}}</li>
	</ul>
</div>`,
		data() {
			return {
				searchText: ''
			};
		},
		watch: {
			searchText(newVal) {
				alert(newVal);
			}
		},
		computed: {
			searchResult() {
				return window.app.fts;
			}
		},
		methods: {
			navigate(arr) {
				var vm = window.vm;
				vm.$emit('navigateFile', arr[0]);
			}
		}
	});
})();

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
				window.history.pushState(null, null, url);
				this.content = url;
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

			window.addEventListener('popstate', function () {
				me.content = window.location.pathname;
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

	window.vm = vm;

})();