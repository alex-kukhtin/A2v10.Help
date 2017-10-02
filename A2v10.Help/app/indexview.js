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