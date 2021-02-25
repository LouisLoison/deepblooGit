<template>
  <div>
    <div>
      <div class="grey--text">Facet</div>
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="blue-grey"
              dark
              small
              block
              v-bind="attrs"
              v-on="on"
            >
              {{ !item.facet ? 'none' : $global.facetLabel(item.facet) }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(facet, index) in Object.keys(facets)"
              :key="`facet${index}`"
              @click="selectDataField(facet)"
            >
            <v-list-item-title>
                {{ $global.facetLabel(facet) }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <div v-if="item.facet.endsWith('_timestamp')">

    </div>
    <div
      
      class="pt-3"
    >
      <div class="grey--text">Facet count max</div>
      <v-slider
        v-model="item.facetCountMax"
        color="blue-grey"
        label=""
        min="1"
        max="20"
        thumb-label
        @change="setSearchDatas()"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'itemDataChoice',

  props: {
    item: {
      type: Object,
      required: false,
    },
    facets: {
      type: Object,
      required: false,
    },
  },

  data: () => ({
    show: false,
  }),

  methods: {
    selectDataField(facet) {
      this.$emit('selectDataField', facet)
    },
  },
}
</script>
