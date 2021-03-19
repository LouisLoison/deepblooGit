<template>

  <div class="row boundBoxMap" :style="'height: 100vh; width: 100%'">
    <l-map
      v-if="showMap"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      style="z-index:0; height: 100%; width: 100%"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
      @update:bounds="boundsUpdate"
    >
      <l-tile-layer
        :url="url"
      />
    <l-control>
      <v-btn @click="$store.dispatch('appSearchTender/setPosData')">
        Refresh Pos Data
      </v-btn>
      <v-btn @click="$store.dispatch('appSearchTender/resetPreviewTenders')">
        Clear Selection
      </v-btn>
    </l-control>
      <div v-if="currentZoom >= 4">
        <div v-for="(data, index) in getSearchResult" v-bind:key=index>
          <div v-if="data.pos">
            <tender-map-view v-if="onScreen(data) && data.pos.type === 'Pos'"  :tenderData="data" />
            <tender-zone-view v-if="onScreen(data) && data.pos.type === 'Cercle'"  :tenderData="data" />
          </div>
        </div>
      </div>
      <div v-if="currentZoom >= 4">
        <div v-for="(data, index) in getSearchResult" v-bind:key=index>
          <tender-map-view v-if="data.pos && data.pos.type === 'Pos' && onScreen(data.pos)"  :tenderData="data" />
        </div>
        <div v-for="(data, index) in getCercleZone" v-bind:key="'cercle' + index">
          <tender-zone-view v-if="onScreen(data)"  :tenderData="data" :zoom="currentZoom" />
        </div>
      </div>
    </l-map>
      <perfect-scrollbar>
    <v-card class="col" style="border-radius: 0%; padding: 4px">
        <div v-for="(data, index) in getTenders" v-bind:key="'cercle' + index">
          <div>
            <search-result :key="data.id.raw" :result="data" style="width: 100%" />
          </div>
        </div>
    </v-card>
      </perfect-scrollbar>
  </div>
</template>

<style scoped>
.boundBoxMap {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-gap: 0px 0px;
  height: 100%;
}
</style>

<script>
import { latLng } from "leaflet";
import { LMap, LTileLayer, LControl } from "vue2-leaflet";
import tenderMapView from './TenderMapView'
import { mapGetters, mapActions } from 'vuex'
import SearchResult from '../SearchResult.vue';
import TenderZoneView from './TenderZoneView.vue';

export default {
  name: "Example",
  components: {
    tenderMapView,
    LMap,
    LTileLayer,
    TenderZoneView,
    SearchResult,
    LControl
  },
  data() {
    return {
      sizeUp: window.innerHeight,
      zoom: 4,
      center: latLng(47.41322, -1.219482),
      bounds: {},
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      currentZoom: 4,
      currentCenter: latLng(47.41322, -1.219482),
      currentBounds: {
        _northEast: {
          lat: 60.50052541051131,
          lng: 30.498046875000004
        },
        _southWest: {
          lat: 29.783449456820605,
          lng: -32.91503906250001
        }
      },
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
        minZoom: 4,
        maxZoom: 12,
        worldCopyJump: true
      },
      showMap: true,
      results: this.getSearchResult
    };
  },
  computed: {
    ...mapGetters('appSearchTender', [
      'getSearchResult',
      'getCercleZone',
      'getTenders'
    ])
  },
  methods: {
    ...mapActions('appSearchTender', [
      'setPreviewTender'
    ]),
    call (data) {
      this.$emit('tenderDialogShow', data)
    },
    async onScreen(data) {
      if (this.currentBounds === undefined)
        return false;

      if (this.currentBounds._southWest.lat < data.lat && this.currentBounds._northEast.lat > data.lat) {
        if (this.currentBounds._southWest.lng < data.lng && this.currentBounds._northEast.lng > data.lng) {
          return true
        }
      }
      return false
    },
    boundsUpdate(bounds) {
      this.currentBounds = bounds
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
