<template>
  <div class="text-right pt-1" style="color: #3a4570;">
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <span v-on="on">
          <v-btn text small color="blue-grey" style="font-size: 16px;">
            {{ $global.formatMillier(searchState.totalResults) }}
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
      type: Object
    },
  },

  data: () => ({
    dataTenderCount: {
      loading: null,
      data: null,
      error: null
    },
  }),

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
};
</script>
