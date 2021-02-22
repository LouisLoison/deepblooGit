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
        <SearchResultsTable
          v-if="1 === 2"
          ref="SearchResultsTable"
          :results="results"
          :filter="filter"
          :searchState="searchState"
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
  }),

  computed: {
    ...mapGetters([
      'getIsMobile',
    ]),
  },

  methods: {
    show() {
      this.isShowDialog = true
    },
  },
}
</script>
