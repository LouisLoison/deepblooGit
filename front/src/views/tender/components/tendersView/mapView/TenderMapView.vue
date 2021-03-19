<template>
<l-marker :lat-lng="getPos()">
  <l-icon
    :icon-size="[30, 30]"
    :icon-url="this.$global.cpvLogo(this.tenderData.cpvs.raw, this.$store.getters['defaultStore/getDataCpvs'].data)" >
  </l-icon>
  <l-popup>
    <div @click="$emit('tenderDialogShow')">
      <search-result :result="tenderData" />
    </div>
  </l-popup>
</l-marker>
</template>

<script>
import { latLng } from "leaflet";
import { LPopup, LMarker, LIcon } from "vue2-leaflet";
import SearchResult from '../SearchResult.vue';

export default {
  name: "tenderMap",
  props: [ 'tenderData' ],
  components: {
    LIcon,
    LPopup,
    LMarker,
    SearchResult
  },
  data () {
    return {
      logo: this.$global.cpvLogo(this.tenderData.cpvs.raw, this.$store.getters['defaultStore/getDataCpvs'].data)
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
