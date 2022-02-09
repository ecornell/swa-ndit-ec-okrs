import Vue from 'vue'
//import Vue from 'vue/dist/vue.js';
import App from './App.vue'
import vuetify from './plugins/vuetify'


Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
