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