import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import {
  createPinia,
  PiniaPlugin
} from 'pinia'
import VueCompositionAPI from '@vue/composition-api'
import {
  ApplicationInsights
} from '@microsoft/applicationinsights-web'


console.log(process.env.VUE_APP_APPINSIGHTS)
const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.VUE_APP_APPINSIGHTS_INSTRUMENTATIONKEY,
    disableFetchTracking: false,
    enableAutoRouteTracking: true,
    enableAjaxPerfTracking: true,
    disableTelemetry: !process.env.VUE_APP_APPINSIGHTS,
  }
});
global.appInsights = appInsights;
appInsights.loadAppInsights();
appInsights.trackPageView();

Vue.use(VueCompositionAPI)
Vue.use(PiniaPlugin)
const pinia = createPinia()

Vue.config.productionTip = false

new Vue({
  vuetify,
  pinia,
  render: h => h(App)
}).$mount('#app')