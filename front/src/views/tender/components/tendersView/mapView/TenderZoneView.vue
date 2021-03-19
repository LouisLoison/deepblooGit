<template>
<div>
  <l-circle
    :lat-lng="getPos()"
    :radius="dynamicRadius()"
    :color="'red'"
    @click="giveTender"
  />
  <l-marker :lat-lng="getPos()">
  <l-icon
          class-name="someExtraClass"
          :icon-anchor="[10, 10]"
        >
          <div class="headline">
            {{ tenderData.nb }}
          </div>
  </l-icon>
  </l-marker>
</div>
</template>

<script>
import { latLng } from "leaflet";
import { LCircle, LMarker, LIcon } from "vue2-leaflet";
import { mapGetters } from "vuex"

export default {
  name: "tenderZone",
  props: [ 'tenderData', 'zoom' ],
  components: {
    LCircle,
    LMarker,
    LIcon
  },
  computed: {
   ...mapGetters('appSearchTender', [
     'getSearchResult',
     'getTenders'
   ])
  },
  methods: {
    dynamicRadius () {
      let radius = ((144000 + this.tenderData.nb * 1000) - (17987.5 * ( this.zoom - 4 )))
      return radius
    },
    giveTender () {
      const filter = this.getSearchResult.filter(x => {
        return x.country.raw === this.tenderData.country
      })
      this.$store.commit('appSearchTender/UPDATE_TENDERS_PREVIEW', filter)
      console.log(this.getTenders)
    },
    getPos () {
      return latLng(this.tenderData.lat, this.tenderData.lng)
    }
  }
}
</script>
