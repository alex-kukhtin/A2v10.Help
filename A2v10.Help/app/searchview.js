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