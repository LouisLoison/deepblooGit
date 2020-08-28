<template>
  <div>
    <div
      v-for="(facet, index) in getFacets"
      :key="`facet${index}`"
      style="display: inline-block; background-color: #f5f5f5; border-radius: 10px;"
      class="mr-1 mb-1"
    >
      <span class="blue-grey--text ml-2" style="font-size: 12px;">
        {{ $global.facetLabel(facet.field) }}
      </span>
      <v-chip
        v-for="(item, index2) in facet.items"
        :key="`item${index2}`"
        close
        small
        @click:close="facetItemRemove(facet, item)"
        class="ma-1"
      >
        {{ item }}
      </v-chip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TendersRefinement',

  props: {
    filter: {
      type: Object,
      required: true
    },
  },

  computed: {
    getFacets() {
      let facets = []
      for (const facetLabel in this.filter) {
        if (this.filter[facetLabel] && this.filter[facetLabel].length) {
          let facet = {
            field: facetLabel,
            items: this.filter[facetLabel],
          }
          facets.push(facet)
        }
      }
      return facets
    },
  },

  methods: {
    facetItemRemove(facet, item) {
      this.$emit('facetItemRemove', {
        facet,
        item,
      })
    },
  },
}
</script>
