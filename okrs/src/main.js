import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import {
  createPinia,
  PiniaVuePlugin 
} from 'pinia'
import {
  ApplicationInsights
} from '@microsoft/applicationinsights-web'


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

Vue.use(PiniaVuePlugin)
const pinia = createPinia()

Vue.config.productionTip = false

new Vue({
  vuetify,
  pinia,
  render: h => h(App)
}).$mount('#app')