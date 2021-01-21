<template>
  <div class="text-right pt-1" style="color: #3a4570;">
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <span v-on="on">
          <v-btn text small color="blue-grey" style="font-size: 16px;">
            {{ $global.formatMillier(getTendersCount) }}
          </v-btn>
        </span>
      </template>
      <span>
        <span v-if="dataTenderCount.loading">
          Number of live and<br />
          archived tenders<br />
          {{ $global.formatMillier(dataTenderCount.data.count) }}
        </span>
      </span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  name: 'SearchPagingInfo',

  props: {
    searchState: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    dataTenderCount: {
      loading: null,
      data: null,
      error: null,
    },
  }),

  computed: {
    getTendersCount() {
      let count = 0
      if (
        this.searchState
        && this.searchState.totalResults
      ) {
        count = this.searchState.totalResults
      }
      if (
        this.searchState
        && this.searchState.facets
        && this.searchState.facets.bid_deadline_timestamp
        && this.searchState.facets.bid_deadline_timestamp.length
      ) {
        let expiredCount = 0
        const bid_deadline_timestamp = this.searchState.facets.bid_deadline_timestamp[0]
        const expired = bid_deadline_timestamp.data.find(a => a.value.name === 'Expired')
        if (expired) {
          expiredCount = expired.count
        }
        let notExpiredCount = 0
        const notExpired = bid_deadline_timestamp.data.find(a => a.value.name === 'Not expired')
        if (notExpired) {
          notExpiredCount = notExpired.count
        }
        count = expiredCount + notExpiredCount
      }
      return count
    },
  },

  mounted() {
    this.loadTenderCount()
  },

  methods: {
    async loadTenderCount() {
      try {
        this.dataTenderCount.loading = 0
        const res = await this.$api.post("/Tender/tenderCount")
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataTenderCount.data = res.data
        this.dataTenderCount.loading = 1
      } catch (err) {
        this.dataTenderCount.loading = -1
        this.$api.error(err, this)
      }
    },
  },
}
</script>
