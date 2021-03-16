import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

// import example from './module-example'
import defaultStore from './default'
import appSearchTender from './appSearchTender'


Vue.use(Vuex)
const vuexLocal = new VuexPersistence({
  key: 'DeepblooFront',
  storage: localStorage
})

const Store = new Vuex.Store({
  modules: {
    defaultStore,
    appSearchTender
    // example
  },
  // enable strict mode (adds overhead!)
  // for dev mode and --debug builds only
  strict: process.env.DEBUGGING,
  plugins: [vuexLocal.plugin]
})

export default function (/* { ssrContext } */) {
  return Store
}

export { Store }
