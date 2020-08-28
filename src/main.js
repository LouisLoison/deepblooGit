import Vue from 'vue'
import App from './App.vue'
import router from '@/router/'
import store from './store'
import Api from "./plugins/Api"
import global from '@/services/global'
import vuetify from './plugins/vuetify'
import PerfectScrollbar from 'vue2-perfect-scrollbar'
import "vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css"
import "./assets/css/site.css";

import VueHighcharts from 'vue-highcharts'
import Highcharts from 'highcharts'
import loadStock from 'highcharts/modules/stock'
import loadMap from 'highcharts/modules/map'
import loadDrilldown from 'highcharts/modules/drilldown'
import loadHighchartsMore from 'highcharts/highcharts-more'
import loadSolidGauge from 'highcharts/modules/solid-gauge'
import xrange from 'highcharts/modules/xrange'

loadStock(Highcharts)
loadMap(Highcharts)
loadDrilldown(Highcharts)
loadHighchartsMore(Highcharts)
loadSolidGauge(Highcharts)
xrange(Highcharts)

Vue.config.productionTip = false
Vue.use(Api)
Vue.use(global)
Vue.use(PerfectScrollbar)
Vue.use(VueHighcharts, { Highcharts })

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
