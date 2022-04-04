/* Copyright © 2017-2018 Alex Kukhtin. All rights reserved.*/

(function () {

	/* {{key}} : {{res}} : {{res.length}} */


	const debugMode = false;

	Vue.component('a2-search-view', {
		template:
`<div class="sub-side">
	<div class="index-view">
		<div class="search-block">
			<label>Введите слово для поиска:</label>
			<input class="input-search" v-model.lazy="searchText" ref="input">
			<a v-if="debugMode" @click="showDebug">debug</a>
		</div>
		<ul class="debug-list" v-if="debugVisible">
			<li v-for="(res, key) in words" v-text="res"></li>
		</ul>
		<ul class="index-tree" v-else>
			<li v-for="(res, key) in searchResult">
				<a v-text="key" v-if="res.length == 1" 
					:class="{active: isActive(res[0], key)}" 
					@click.stop.prevent="navigate(res[0], key)"></a>
				<div v-else>
					<span class="word-folder" v-text="key"></span>
					<ul>
						<li class="file-link" v-for="(ix) in res">
							<a v-text="file(ix)" 
								:class="{active: isActive(ix, key)}" 
								@click.stop.prevent="navigate(ix, key)"></a>
						</li>
					</ul>
				</div>
			</li>
		</ul>
	</div>
</div>`,
		data() {
			return {
				searchText: '',
				activeKey: '',
				activeIndex: 0,
				debugMode: debugMode,
				debugVisible: false
			};
		},
		watch: {
			searchText(newVal) {
			}
		},
		computed: {
			words() {
				let fts = window.helpapp.fts;
				return Object.keys(fts);
			},
			searchResult() {
				let fts = window.helpapp.fts;
				let r = {};
				if (!this.searchText) return r;
				let st = this.searchText.toUpperCase();
				for (let key in fts) {
					if (key.toUpperCase().indexOf(st) !== -1)
						r[key] = fts[key];
				}
				return r;
			}
		},
		methods: {
			file(ix) {
				let file = window.helpapp.files[ix];
				return file ? file.title : '#ERR';
			},
			isActive(ix, key) {
				return ix === this.activeIndex && key === this.activeKey;
			},
			navigate(ix, key) {
				var vm = window.vm;
				this.activeKey = key;
				this.activeIndex = ix;
				vm.$emit('navigateFile', ix);
			},
			showDebug() {
				if (this.debugMode)
					this.debugVisible = true;
			}
		},
		created() {
			let this_ = this;
			this.$root.$on('doSearch', function (text) {
				this_.searchText = text;
				setTimeout(function () {
					this_.$refs['input'].focus();
				}, 2);
			});
		}
	});
})();