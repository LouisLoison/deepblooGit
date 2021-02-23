<template>
  <div>
    <v-app-bar
      color="grey lighten-4"
      dense
    >
      <span class="text-h5 font-weight-bold">{{ dashboard.name }}</span>

      <v-spacer />

      <v-btn
        @click="showTendersRefinement = !showTendersRefinement"
        small
        icon
        :color="showTendersRefinement ? 'blue-grey' : 'grey'"
        title="Show tenders filter"
      >
        <v-icon small>fa-filter</v-icon>
      </v-btn>
      <v-btn
        @click="updateDisplay('EDIT')"
        small
        icon
        color="blue-grey"
        title="Edit"
      >
        <v-icon small>fa-edit</v-icon>
      </v-btn>
      <v-btn
        @click="search()"
        small
        icon
        color="blue-grey"
        title="Refresh"
      >
        <v-icon small>fa-sync-alt</v-icon>
      </v-btn>
    </v-app-bar>
    <TendersRefinement
      v-if="searchFilter && showTendersRefinement"
      :searchInputValue="searchFilter.searchInputValue"
      :filter="searchFilter.facets"
      @searchInputValueRemove="searchInputValueRemove()"
      @facetItemRemove="facetItemRemove($event)"
    />
    <div v-if="!dataSearch.loading" class="text-center pt-5">
      <v-progress-circular :size="50" color="blue-grey lighten-4" indeterminate />
    </div>
    <v-list
      v-else
      dense
      three-line
    >
      <template v-for="(result, index) in this.dataSearch.data.results">
        <v-list-item
          :key="`result${index}`"
          @click="openTender(result)"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-avatar class="mr-1" size="16">
                <v-img :src="$global.cpvLogo(result.cpvs.raw)" />
              </v-avatar>
              {{ $global.htmlText(result.title.raw) }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $global.htmlText(result.description.raw) }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </div>
</template>

<script>
import TendersRefinement from '@/views/tender/components/TendersRefinement'

export default {
  name: 'TendersPreview',

  components: {
    TendersRefinement,
  },

  props: {
    display: {
      type: String,
      required: false,
    },

    dashboard: {
      type: Object,
      required: false,
    },

    dataSearch: {
      type: Object,
      required: false,
    },

    searchFilter: {
      type: Object,
      required: false,
    },
  },

  data: () => ({
    showTendersRefinement: false,
  }),

  methods: {
    updateDisplay(value) {
      this.$emit('updateDisplay', value)
    },

    openTender(tender) {
      this.$emit('openTender', tender)
    },

    searchInputValueRemove() {
      this.$emit('searchInputValueRemove')
    },

    facetItemRemove(event) {
      this.$emit('facetItemRemove', event)
    },
  },
}
</script>
