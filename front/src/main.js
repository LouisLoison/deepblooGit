import Vue from 'vue'
import App from './App.vue'
import router from '@/router/'
import store from './store/index'
import Api from "./plugins/Api"
import global from '@/services/global'
import vuetify from './plugins/vuetify'
import VueDragDrop from 'vue-drag-drop'
import PerfectScrollbar from 'vue2-perfect-scrollbar'
import "vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css"
import "./assets/css/site.css";

import HighchartsVue from "highcharts-vue"
// import VueHighcharts from 'vue-highcharts'
import Highcharts from 'highcharts'
import mapInit from 'highcharts/modules/map'
import loadStock from 'highcharts/modules/stock'
import loadMap from 'highcharts/modules/map'
import loadDrilldown from 'highcharts/modules/drilldown'
import loadHighchartsMore from 'highcharts/highcharts-more'
import loadSolidGauge from 'highcharts/modules/solid-gauge'
import xrange from 'highcharts/modules/xrange'
import mapData from '@highcharts/map-collection/custom/world.geo.json'

mapInit(Highcharts)
loadStock(Highcharts)
loadMap(Highcharts)
loadDrilldown(Highcharts)
loadHighchartsMore(Highcharts)
loadSolidGauge(Highcharts)
xrange(Highcharts)

Highcharts.maps['myMapName'] = mapData

Vue.config.productionTip = false
Vue.use(Api)
Vue.use(global)
Vue.use(VueDragDrop)
Vue.use(PerfectScrollbar)
// Vue.use(VueHighcharts, { Highcharts })
Vue.use(HighchartsVue)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
