<template>
  <div class="pa-3">
    <v-card
      class="mx-auto mb-3"
      outlined
    >
      <v-card-text>
        <SearchSort v-model="sortBy" />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text>
        <SearchFacet
          :checked="filter.bid_deadline_timestamp"
          :facet="searchState.facets.bid_deadline_timestamp[0]"
          @change="handleFacetChange($event, 'bid_deadline_timestamp')"
          @checkAll="handleFacetCheckAll('bid_deadline_timestamp')"
          @unCheckAll="handleFacetUnCheckAll('bid_deadline_timestamp')"
        />
      </v-card-text>
    </v-card>

    <v-card
      v-if="driver"
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text class="pa-0">
        <SearchFacetRegion
          ref="SearchFacetRegion"
          :region_lvl0="filter.region_lvl0"
          :region_lvl1="filter.region_lvl1"
          @filterChange="facetRegionChange($event)"
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text>
        <SearchFacet
          :checked="filter.country"
          :facet="searchState.facets.country[0]"
          @change="handleFacetChange($event, 'country')"
          @checkAll="handleFacetCheckAll('country')"
          @unCheckAll="handleFacetUnCheckAll('country')"
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text>
        <SearchFacet
          :checked="filter.cpvs"
          :facet="searchState.facets.cpvs[0]"
          @change="handleFacetChange($event, 'cpvs')"
          @checkAll="handleFacetCheckAll('cpvs')"
          @unCheckAll="handleFacetUnCheckAll('cpvs')"
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text>
        <SearchFacet
          :checked="filter.buyer_name"
          :facet="searchState.facets.buyer_name[0]"
          @change="handleFacetChange($event, 'buyer_name')"
          @checkAll="handleFacetCheckAll('buyer_name')"
          @unCheckAll="handleFacetUnCheckAll('buyer_name')"
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text>
        <SearchFacet
          :checked="filter.user_id"
          :facet="searchState.facets.user_id[0]"
          @change="handleFacetChange($event, 'user_id')"
          @checkAll="handleFacetCheckAll('user_id')"
          @unCheckAll="handleFacetUnCheckAll('user_id')"
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text>
        <SearchFacet
          :checked="filter.notice_type"
          :facet="searchState.facets.notice_type[0]"
          @change="handleFacetChange($event, 'notice_type')"
          @checkAll="handleFacetCheckAll('notice_type')"
          @unCheckAll="handleFacetUnCheckAll('notice_type')"
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text>
        <SearchFacet
          :checked="filter.publication_timestamp"
          :facet="searchState.facets.publication_timestamp[0]"
          @change="handleFacetChange($event, 'publication_timestamp')"
          @checkAll="handleFacetCheckAll('publication_timestamp')"
          @unCheckAll="handleFacetUnCheckAll('publication_timestamp')"
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text>
        <SearchFacet
          :checked="filter.procurement_method"
          :facet="searchState.facets.procurement_method[0]"
          @change="handleFacetChange($event, 'procurement_method')"
          @checkAll="handleFacetCheckAll('procurement_method')"
          @unCheckAll="handleFacetUnCheckAll('procurement_method')"
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text>
        <SearchFacet
          :checked="filter.lang"
          :facet="searchState.facets.lang[0]"
          @change="handleFacetChange($event, 'lang')"
          @checkAll="handleFacetCheckAll('lang')"
          @unCheckAll="handleFacetUnCheckAll('lang')"
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text
        @click.stop="
          getIsPremiumMembership
            ? showInsufficientRightDialog()
            : null
        "
      >
        <SearchFacet
          :checked="filter.scope_of_works"
          :facet="searchState.facets.scope_of_works[0]"
          @change="handleFacetChange($event, 'scope_of_works')"
          @checkAll="handleFacetCheckAll('scope_of_works')"
          @unCheckAll="handleFacetUnCheckAll('scope_of_works')"
          :style="
            getIsPremiumMembership
              ? 'pointer-events: none; opacity: 0.5;'
              : ''
          "
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text
        @click="
          getIsPremiumMembership
            ? showInsufficientRightDialog()
            : null
        "
      >
        <SearchFacet
          :checked="filter.segments"
          :facet="searchState.facets.segments[0]"
          @change="handleFacetChange($event, 'segments')"
          @checkAll="handleFacetCheckAll('segments')"
          @unCheckAll="handleFacetUnCheckAll('segments')"
          :style="
            getIsPremiumMembership
              ? 'pointer-events: none; opacity: 0.5;'
              : ''
          "
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text>
        <SearchFacet
          :checked="filter.contract_types"
          :facet="searchState.facets.contract_types[0]"
          @change="handleFacetChange($event, 'contract_types')"
          @checkAll="handleFacetCheckAll('contract_types')"
          @unCheckAll="handleFacetUnCheckAll('contract_types')"
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text
        @click="
          getIsPremiumMembership
            ? showInsufficientRightDialog()
            : null
        "
      >
        <SearchFacet
          :checked="filter.brands"
          :facet="searchState.facets.brands[0]"
          @change="handleFacetChange($event, 'brands')"
          @checkAll="handleFacetCheckAll('brands')"
          @unCheckAll="handleFacetUnCheckAll('brands')"
          :style="
            getIsPremiumMembership
              ? 'pointer-events: none; opacity: 0.5;'
              : ''
          "
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text
        @click="
          getIsPremiumMembership
            ? showInsufficientRightDialog()
            : null
        "
      >
        <SearchFacet
          :checked="filter.financials"
          :facet="searchState.facets.financials[0]"
          @change="handleFacetChange($event, 'financials')"
          @checkAll="handleFacetCheckAll('financials')"
          @unCheckAll="handleFacetUnCheckAll('financials')"
          :style="
            getIsPremiumMembership
              ? 'pointer-events: none; opacity: 0.5;'
              : ''
          "
        />
      </v-card-text>
    </v-card>

    <v-card
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text
        @click="
          getIsPremiumMembership
            ? showInsufficientRightDialog()
            : null
        "
      >
        <SearchFacet
          :checked="filter.currency"
          :facet="searchState.facets.currency[0]"
          @change="handleFacetChange($event, 'currency')"
          @checkAll="handleFacetCheckAll('currency')"
          @unCheckAll="handleFacetUnCheckAll('currency')"
          :style="
            getIsPremiumMembership
              ? 'pointer-events: none; opacity: 0.5;'
              : ''
          "
        />
      </v-card-text>
    </v-card>

    <v-card
      v-if="getUserType === 1"
      class="mx-auto mb-3"
      outlined
      style="overflow-y: auto;"
    >
      <v-card-text>
        <SearchFacet
          :checked="filter.datasource"
          :facet="searchState.facets.datasource[0]"
          @change="handleFacetChange($event, 'datasource')"
          @checkAll="handleFacetCheckAll('datasource')"
          @unCheckAll="handleFacetUnCheckAll('datasource')"
        />
      </v-card-text>
    </v-card>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import SearchFacet from '@/views/tender/components/SearchFacet'
import SearchFacetRegion from '@/views/tender/components/SearchFacetRegion'
import SearchSort from '@/views/tender/components/SearchSort'

export default {
  name: 'TendersFilter',

  components: {
    SearchFacet,
    SearchFacetRegion,
    SearchSort,
  },

  props: {
    driver: {
      type: Object,
      required: true
    },

    searchState: {
      type: Object,
      required: true
    },
  },

  data: () => ({
    sortBy: 'relevance',
    filter: {
      region_lvl0: [],
      region_lvl1: [],
      country: [],
      notice_type: [],
      currency: [],
      cpvs: [],
      user_id: [],
      bid_deadline_timestamp: [],
      publication_timestamp: [],
      procurement_method: [],
      lang: [],
      scope_of_works: [],
      segments: [],
      designs: [],
      contract_types: [],
      brands: [],
      datasource: [],
      groups: [],
      buyer_name: [],
      financials: [],
    },
  }),

  computed: {
    ...mapGetters([
      'getUserType',
      'getIsFreeMembership',
      'getIsPremiumMembership',
      'getIsBusinessMembership',
    ]),
  },

  watch: {
    sortBy(newSortBy) {
      this.driver.setSort(newSortBy, 'asc')
    },
  },

  methods: {
    ...mapActions([
      'showInsufficientRightDialog',
    ]),

    updateFilter(filter) {
      this.filter = filter
      this.$refs.SearchFacetRegion.filterChange(filter)
    },

    handleFacetChange(event, facet) {
      if (
        !this.driver ||
        !this.driver.getState() ||
        !this.driver.getState().facets ||
        !this.driver.getState().facets[facet] ||
        !this.filter[facet]
      ) {
        return
      }
      const { value, checked } = event.target

      if (checked) {
        this.filter[facet].push(value)
      } else {
        const index = this.filter[facet].indexOf(value)
        if (index > -1) {
          this.filter[facet].splice(index, 1)
        }
        if (facet === 'region_lvl0' || facet === 'region_lvl1') {
          this.$refs.SearchFacetRegion.filterChange(this.filter)
        }
      }
      this.$emit('filterChange', this.filter)
    },

    handleFacetCheckAll(facet) {
      const facetFromDriver = this.driver.getState().facets[facet][0]
      for (const data of facetFromDriver.data) {
        const value = facetFromDriver.type === 'range' ? data.value.name : data.value
        if (this.filter[facet].includes(value)) {
          continue
        }
        this.filter[facet].push(value)
        if (this.filter[facet].length > 10) {
          break
        }
      }
      this.$emit('filterChange', this.filter)
    },

    handleFacetUnCheckAll(facet) {
      this.filter[facet] = []
      this.$emit('filterChange', this.filter)
    },

    facetRegionChange(filter) {
      this.filter = {
        ...this.filter,
        ...filter,
      }
      this.$emit('filterChange', filter)
    }
  },
}
</script>
