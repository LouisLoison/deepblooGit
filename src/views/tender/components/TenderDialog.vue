<template>
  <v-dialog
    v-if="isVisible"
    v-model="isVisible"
    :scrollable="getIsMobile"
    :max-width="!getIsMobile ? '80%' : null"
    :fullscreen="getIsMobile"
    :hide-overlay="getIsMobile"
  >
    <Tender
      @close="isVisible = false"
      ref="Tender"
    />
  </v-dialog>
</template>

<script>
import Tender from '@/views/tender/components/Tender'

import { mapGetters } from "vuex"

export default {
  name: 'TenderDialog',

  components: {
    Tender,
  },

  data: () => ({
    isVisible: false,
  }),

  computed: {
    ...mapGetters([
      'getIsMobile',
    ]),
  },

  methods: {
    show(tender) {
      this.isVisible = true
      this.$nextTick(() => {
        this.$refs.Tender.loadTender(tender.tender_id.raw)
      })
    },
  },
}
</script>
