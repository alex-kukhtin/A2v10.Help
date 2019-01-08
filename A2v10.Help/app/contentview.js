/* Copyright © 2017-2018 Alex Kukhtin. All rights reserved.*/

(function () {

	function scrollIntoViewCheck(el) {
		let elRect = el.getBoundingClientRect();
		let pElem = el.parentElement;
		while (pElem) {
			if (pElem.classList.contains('tree-view'))
				break;
			pElem = pElem.parentElement;
		}
		if (!pElem)
			return;
		let parentRect = pElem.getBoundingClientRect();
		if (!parentRect.height) return;
		if (elRect.top < parentRect.top) {
			el.scrollIntoView(true);
		}
		else if (elRect.bottom > parentRect.bottom) {
			el.scrollIntoView(false);
		}
	}

	const treeItemComponent = {
		name: 'tree-item',
		template: `
<li :title="item.title" @click.stop.prevent="doClick(item)"
		:class="{expanded: isExpanded, collapsed:isCollapsed, active:isItemSelected}" >
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
				Vue.set(this.item, "open", !this.item.open);
				if (!this.item.open) {
					/* close all inner */
					this.closeInner(this.item);
				}
			},
			closeInner(itm) {
				if (!itm.items) return;
				itm.items.forEach(t => {
					if (t.open) Vue.set(t, 'open', false);
					this.closeInner(t);
				});
			},
			fit() {
				let el = this.$el;
				setTimeout(function () {
					scrollIntoViewCheck(el);
				}, 10);
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
				return "ico ico-" + (this.isFolder ? "folder" : "file");
			},
			dataHref() {
				return this.getHref ? this.getHref(this.item) : '';
			},
			isItemSelected() {
				return this.isActive(this.item);
			}
		},
		watch: {
			isItemSelected: function (newVal) {
				if (newVal && this.$el) {
					this.fit();
				}
			}
		},
		created() {
			let this_ = this;
			this.$root.$on('activateTab', function (name) {
				if (name === 'content' && this_.isItemSelected) {
					this_.fit();
				}
			});
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
				root: window.helpapp.content
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

				let this_ = this;
				function findOne(item) {
					let active = item.url.toLowerCase() === url.toLowerCase();
					Vue.set(item, 'active', active);
					if (active) {
						document.title = item.title;
					}
					if (!item.items) return;
					item.items.forEach(findOne);
					if (item.items.some(itm => itm.active || itm.open)) {
						Vue.set(item, 'open', true);
					}
				}

				this.root.items.forEach(findOne);
			}
		},
		mounted() {
			const vm = window.vm;
			vm.$on('navigated', (url) => {
				/*console.warn('navigated:' + url);*/
				this.findActive(url);
			});
		}
	});
})();