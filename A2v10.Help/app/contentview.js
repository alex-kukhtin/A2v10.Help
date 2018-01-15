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