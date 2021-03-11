<template>

  <div :style="'height:'+ sizeUp + 'px; width: 100%'">
    <l-map
      v-if="showMap"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      style="height: 100%"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
    >
      <l-tile-layer
        :url="url"
      />
      <div v-if="currentZoom > 4">
        <div v-for="(data, index) in mapData" v-bind:key=index>
          <tender-map-view v-if="onScreen()" :tenderData="data" />
        </div>
      </div>
    </l-map>
  </div>
</template>

<script>
import { latLng } from "leaflet";
import { LMap, LTileLayer } from "vue2-leaflet";
import tenderMapView from './TenderMapView'

export default {
  name: "Example",
  components: {
    tenderMapView,
    LMap,
    LTileLayer
  },
  data() {
    return {
      sizeUp: window.innerHeight,
      zoom: 4,
      center: latLng(47.41322, -1.219482),
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      currentZoom: 4,
      currentCenter: latLng(47.41322, -1.219482),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
        minZoom: 4,
        maxZoom: 12
      },
      showMap: true,
      mapData: this.$store.getters['defaultStore/getMapTender']
    };
  },
  methods: {
    onScreen() {
      return true
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    showLongText() {
      this.showParagraph = !this.showParagraph;
    },
    innerClick() {
      alert("Click!");
    }
  }
};
</script>
