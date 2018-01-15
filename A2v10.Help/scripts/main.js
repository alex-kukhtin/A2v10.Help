(function() { 
/*GENERATED*/
const content = {
  "items": [
    {
      "title": "A2:SDK",
      "url": "/index",
      "items": [
        {
          "title": "Что нового",
          "url": "/whatsnew/index",
          "items": [
            {
              "title": "Октябрь 2017",
              "url": "/whatsnew/w201710"
            }
          ]
        }
      ]
    },
    {
      "title": "База данных",
      "url": "/database/index",
      "items": [
        {
          "title": "Основные концепции",
          "url": "/database/concepts"
        },
        {
          "title": "Таблицы",
          "url": "/database/tables"
        },
        {
          "title": "Пердставления",
          "url": "/database/views"
        },
        {
          "title": "Модели данных",
          "url": "/database/models"
        }
      ]
    },
    {
      "title": "Модели",
      "url": "/models/index",
      "items": [
        {
          "title": "model.json",
          "url": "/models/modelfile"
        }
      ]
    },
    {
      "title": "Представления",
      "url": "/views/index",
      "items": [
        {
          "title": "Язык XAML",
          "url": "/xaml/language"
        }
      ]
    },
    {
      "title": "Шаблоны",
      "url": "/template/index",
      "items": [
        {
          "title": "Свойства",
          "url": "/template/properties"
        },
        {
          "title": "События",
          "url": "/template/events"
        },
        {
          "title": "Команды",
          "url": "/template/commands"
        },
        {
          "title": "Валидаторы",
          "url": "/template/validators"
        }
      ]
    },
    {
      "title": "Справочник",
      "url": "/reference/index",
      "items": [
        {
          "title": "A2v10.Xaml - пространство имен",
          "url": "/reference/a2v10.xaml"
        }
      ]
    }
  ]
}
;
const files = [{"url":"/index","title":"Главная"},{"url":"/template/index","title":"Главная"},{"url":"/whatsnew/index","title":"Что нового"},{"url":"/whatsnew/w201710","title":"Октябрь 2017"}];
const index = {"word1":[0],"word2":[0,1],"template":[1],"Что нового":[2,3],"Описание":[2],"Октябрь 2017":[3]};
const fts = {"default":[0],"page":[0,1],"another":[0],"paragraph":[0],"длинный":[0],"текст":[0],"разными":[0],"знаками":[0],"препинания":[0],"скобки":[0],"такие":[0],"$доллар":[0],"амперсанд":[0],"несколько":[0],"строк":[0],"скобками":[0],"a2.web.text":[0],"whats":[0,1],"new":[0,1,2],"большими":[0],"буквами":[0],"template":[1],"index":[1],"общая":[1],"информация":[1],"шаблонах":[1],"what's":[2],"a2":[2],"main":[2],"october":[2],"2017":[2,3],"октябрь":[3],"нового":[3],"content":[3]};
window.app = {content: content, files: files, index: index, fts: fts};
})();
// Copyright © 2017-2018 Alex Kukhtin. All rights reserved.

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
				//console.warn(url);
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
// Copyright © 2017-2018 Alex Kukhtin. All rights reserved.

(function () {



    const treeItemComponent = {
        name: 'tree-item',
        template: `
<li :title="item.title" @click.stop.prevent="doClick(item)"
    :class="{expanded: isExpanded, collapsed:isCollapsed, active:isActive(item)}" >
    <div class="overlay">
        <a class="toggle" v-if="isFolder" href @click.stop.prevent="toggle"></a>
        <span v-else class="toggle"/>
        <i :class="iconClass"/>
        <a :href="dataHref" tabindex="-1" v-text="item.title"/>
    </div>
    <ul v-if="isFolder" v-show="isExpanded">
        <tree-item v-for="(itm, index) in item.items"
            :key="index" :item="itm" :click="click" :get-href="getHref" :is-active="isActive" :expand="expand" :root-items="rootItems"/>
    </ul>   
</li>
`,
        props: {
            item: Object,
            options: Object,
            rootItems: Array,
            /* callbacks */
            click: Function,
            expand: Function,
            isActive: Function,
            getHref: Function
        },
        methods: {
            doClick(item) {
                this.click(item);
            },
            toggle() {
                if (!this.isFolder)
                    return;
                Vue.set(this.item, "open" , !this.item.open);
            }
        },
        computed: {
            isFolder: function () {
                let ch = this.item.items;
                return ch && ch.length;
            },
            isExpanded: function () {
                return this.isFolder && this.item.open;
            },
            isCollapsed: function () {
                return this.isFolder && !this.item.open;
            },
            iconClass: function () {
                return "ico ico-" + (this.isFolder ? "node" : "leaf");
            },
            dataHref() {
                return this.getHref ? this.getHref(this.item) : '';
            }
        }
    };


    Vue.component('tree-view', {
        components: {
            'tree-item': treeItemComponent
        },
        template: `
<ul class="tree-view">
    <tree-item v-for="(itm, index) in items" :options="options" :get-href="getHref"
        :item="itm" :key="index"
        :click="click" :is-active="isActive" :expand="expand" :root-items="items">
    </tree-item>
</ul>
        `,
        props: {
            options: Object,
            items: Array,
            isActive: Function,
            click: Function,
            expand: Function,
            getHref: Function
        },
        computed: {
        },
        methods: {
        },
        created() {
        },
        updated() {
        }
    });

	Vue.component('a2-content-view', {
		template: '<div class="sub-side"><tree-view ref="treeView" :items="root.items" :click="navigate" :is-active="isActive" :get-href="getHRef"></tree-view></div>',
		data() {
			return {
				root: window.app.content
			};
        },
        computed: {
            currentUrl() {
                return window.location.pathname;
            }
        },
        methods: {
            navigate(item) {
                var vm = window.vm;
                vm.$emit('navigate', item.url);
                this.findActive(item.url);
            },
            isActive(item) {
                return item.active;
            },
            getHRef(item) {
                return item.url;
            },
            findActive(url) {

                function findOne(item) {
                    let active = item.url.toLowerCase() === url.toLowerCase();
                    Vue.set(item, 'active', active);
                    if (!item.items) return;
                    item.items.forEach(findOne);
                    if (item.items.some((itm) => itm.active || itm.open))
                        Vue.set(item, 'open', true);
                }

                this.root.items.forEach(findOne);
            }
        },
        mounted() {
            const vm = window.vm;
            vm.$on('navigated', (url) => {
                //console.warn('navigated:' + url);
                this.findActive(url);
            })
        }
	});
})();
// Copyright © 2017-2018 Alex Kukhtin. All rights reserved.

(function () {



	Vue.component('a2-index-view', {
		template: `
<div class="sub-side">
	<ul class="index-view">
		<li :class="{'active': isActive(val)}" @click.prevent="navigate(val)" v-for="(val, key) in root">{{key}}
            <a v-for="itm in val" v-text="itm.length"></a>
        </li>
	</ul>
	<pre v-once>{{root}}</pre><pre v-once>{{files}}</pre>
</div>`,
		data() {
			return {
				root: window.app.index,
                files: window.app.files,
                active: null
			};
		},
        methods: {
            isActive(itm) {
                return itm === this.active;
            },
			navigate(itm) {
                var vm = window.vm;
                this.active = itm;
				vm.$emit('navigateFile', itm[0]);
			}
		}
	});
})();
// Copyright © 2017-2018 Alex Kukhtin. All rights reserved.

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
// Copyright © 2017-2018 Alex Kukhtin. All rights reserved.

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