<template>
  <v-dialog
    v-if="isShowDialog"
    v-model="isShowDialog"
    scrollable
    :max-width="!getIsMobile ? 900 : null"
    :fullscreen="getIsMobile"
    :hide-overlay="getIsMobile"
  >
    <v-card>
      <v-toolbar dark dense color="blue-grey lighten-4 black--text">
        <div class="title">
          <span>Tenders</span>
        </div>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon light @click="isShowDialog = false">
            <v-icon color="grey darken-2">
              fa-times
            </v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-divider></v-divider>

      <v-card-text>
        <div v-if="!dataSearch.loading" class="text-center pa-5">
          <v-progress-circular :size="50" color="blue-grey lighten-4" indeterminate />
        </div>
        <SearchResultsTable
          v-else
          ref="SearchResultsTable"
          :results="dataSearch.data.results"
          :filter="filter"
          :searchState="dataSearch.data"
          @tenderDialogShow="tenderOpen($event)"
          @updateUserScreen="updateUserScreen()"
          @handleFacetChange="handleFacetChange($event)"
          @handleFacetCheckAll="handleFacetCheckAll($event)"
          @handleFacetUnCheckAll="handleFacetUnCheckAll($event)"
          @openTenderGroupChoice="openTenderGroupChoice($event)"
          @sendToSalesforce="sendToSalesforce($event)"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import SearchResultsTable from '@/views/tender/components/SearchResultsTable'

export default {
  name: 'TendersDialog',

  components: {
    SearchResultsTable,
  },

  data: () => ({
    moment,
    isShowDialog: false,
    facets: null,
    filter: null,
    dataSearch: {
      loading: null,
      data: null,
      error: null,
    },
  }),

  computed: {
    ...mapGetters([
      'getIsMobile',
    ]),
  },

  methods: {
    show(facets) {
      this.isShowDialog = true
      this.facets = facets
      this.filter = {
        bid_deadline_timestamp: [],
        brands: [],
        buyer_name: [],
        contract_types: [],
        country: [],
        cpvs: [],
        currency: [],
        datasource: [],
        designs: [],
        financials: [],
        groups: [],
        lang: [],
        notice_type: [],
        procurement_method: [],
        publication_timestamp: [],
        region_lvl0: [],
        region_lvl1: [],
        scope_of_works: [],
        segments: [],
        user_id: [],
      }
      this.search()
    },

    async search() {
      try {
        this.dataSearch.loading = 0
        const res = await this.$api.post('/Elasticsearch/search', {
          searchRequest: {
            searchInputValue: 'power',
            filter: {
              cpvs: ['Cable'],
            },
            facets: this.facets,
          }
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataSearch.data = res.data
        this.dataSearch.loading = 1
      } catch (err) {
        this.dataSearch.loading = -1
        this.$api.error(err, this)
      }
    },

    tenderOpen(result) {
      this.$emit('tenderOpen', result)
    },
  },
}
</script>
