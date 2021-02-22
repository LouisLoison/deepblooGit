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
      ref="Tender"
      @close="isVisible = false"
      @openTenderGroupChoice="openTenderGroupChoice($event)"
    />
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import Tender from '@/views/tender/components/Tender'

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
      this.tender = tender
      this.$nextTick(() => {
        let tenderUuid = tender.id.raw
        if (
          tender.tender_uuid
          && tender.tender_uuid.raw
        ) {
          tenderUuid = tender.tender_uuid.raw
        }
        this.$refs.Tender.loadTender(tenderUuid)
      })
    },

    openTenderGroupChoice(result) {
      this.$emit('openTenderGroupChoice', result)
    },

    updateTenderGroup(groups) {
      if (this.$refs.Tender) {
        this.$refs.Tender.updateTenderGroup(groups)
      }
    },
  },
}
</script>
