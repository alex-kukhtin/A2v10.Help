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