<template>
  <div
    class="content-grid pt-4 pr-2"
  >
    <div
      kbn-canvas-shareable="canvas"
      kbn-canvas-url="/static/kibana/canvas-embed-workpad-[TEST] Alexandra-workpad-79d0c683-789e-4bf2-a95c-ec58815780e7.json"
    />
  </div>
</template>

<script>

export default {
  name: 'PrivateDeals',

  data: () => ({
  }),

  mounted() {
  }
}
</script>

<script type="text/javascript">
  setTimeout(function(){
    KbnCanvas.share()
    console.log(KbnCanvas)
  }, 1000);
</script>
