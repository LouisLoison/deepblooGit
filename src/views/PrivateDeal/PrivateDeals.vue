<template>
  <div
    class="content-grid pt-4 pr-2"
  >
    <div
      v-if="1 === 2"
      kbn-canvas-shareable="canvas"
      kbn-canvas-url="/static/kibana/canvas-embed-workpad-[TEST] Alexandra-workpad-79d0c683-789e-4bf2-a95c-ec58815780e7.json"
    />
    <div v-if="loading" class="pa-5 text-center">
      <div class="pa-2 grey--text">
        Please wait. We are building your interface.
      </div>
      <div class="pa-2 grey--text">This may take a few minutes...</div>
      <v-progress-circular :size="50" color="blue-grey lighten-4" indeterminate />
    </div>
    <iframe
      v-show="!loading"
      frameborder="0"
      :src="dashboardUrl"
      style="overflow: auto; width: 100%; margin-bottom: -5px;"
      :style="
        isHeaderShow
          ? 'height: calc(100vh - 155px);'
          : 'height: calc(100vh - 40px);'
      "
      scrolling="no"
      @load="loading = false"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PrivateDeals',

  data: () => ({
    loading: true,
    dashboardUrl: 'https://d384aee8dd5b497f8d14891a59479e74.eu-west-1.aws.found.io/s/test_clientspace/app/dashboards#/view/8506d1a3-4683-4dc[…]om%3Anow-1y%2Cto%3Anow))',
  }),

  computed: {
    ...mapGetters([
      'isHeaderShow',
    ]),
  },

  mounted() {
  }

  /*
  setTimeout(function(){
    KbnCanvas.share()
    console.log(KbnCanvas)
  }, 1000);
  */
}
</script>
