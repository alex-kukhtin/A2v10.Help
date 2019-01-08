/* Copyright © 2017-2018 Alex Kukhtin. All rights reserved. */

(function () {



	Vue.component('a2-index-view', {
		template: `
<div class="sub-side">
	<div class="index-view">
		<div class="search-block">
			<label>Введите ключевое слово для поиска:</label>
			<input class="input-search" type=text v-model="fragment"></input>
		</div>
		<ul class="index-tree">
			<li v-for="(val, valIndex) in list">
				<a :class="{'active': isActive(val)}" v-if="val.files.length === 1" v-text="val.word" @click.stop.prevent="navigate(val, 0)"></a>
				<div v-else>
					<span class="word-folder" v-text="val.word"></span>
					<ul>
						<li class="file-link" v-for="(itm, itmIndex) in val.files">
							<a :class="{active: isActive(itm)}" v-text="itm.title" @click.stop.prevent="navigateFile(itm)"></a>
						</li>
					</ul>
				</div>
			</li>
		</ul>
	</div>
</div>`,
		/*
			<pre>list: {{active}}</pre>
			<pre v-once>{{root}}</pre><pre v-once>{{files}}</pre>
		*/
		data() {
			return {
				root: window.helpapp.index,
				files: window.helpapp.files,
				active: null,
				fragment: ''
			};
		},
		computed: {
			list() {
				const f = this.fragment.toLowerCase();
				const root = this.root;
				const files = this.files;
				return Object.keys(this.root)
					.filter(val => !f || val.toLowerCase().indexOf(f) !== -1)
					.map(v => { return { word: v, files: root[v].map(f => files[f]) }; });
			}
		},
		methods: {
			isActive(itm) {
				return itm === this.active;
			},
			navigate(itm, ix) {
				var vm = window.vm;
				this.active = itm;
				vm.$emit('navigate', itm.files[ix].url);
			},
			navigateFile(itm) {
				var vm = window.vm;
				this.active = itm;
				vm.$emit('navigate', itm.url);
			}
		},
		mounted() {
		}
	});
})();