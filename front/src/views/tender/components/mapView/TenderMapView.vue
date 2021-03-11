<template>
<l-marker :lat-lng="getPos()">
  <l-tooltip>
    <div>
      <search-result :result="tenderData" />
    </div>
  </l-tooltip>
</l-marker>
</template>

<script>
import { latLng } from "leaflet";
import { LTooltip, LMarker } from "vue2-leaflet";
import SearchResult from '../SearchResult.vue';

export default {
  name: "tenderMap",
  props: [ 'tenderData' ],
  components: {
    LTooltip,
    LMarker,
    SearchResult
  },
  data () {
    return {
    }
  },
  methods: {
    getPos() {
      return latLng(this.tenderData.pos.lat, this.tenderData.pos.lng)
    },
    innerClick() {
      alert("Click!");
    }
  }
}
</script>
