<template>
  <div>
    <Tender
      ref="Tender"
      @close="isVisible = false"
      @openTenderGroupChoice="openTenderGroupChoice($event)"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Tender from '@/views/tender/components/Tender'

export default {
  name: 'TenderView',

  components: {
    Tender,
  },

  data: () => ({
    isVisible: false,
  }),

  computed: {
    ...mapGetters('defaultStore', [
      'getIsMobile',
    ]),
  },

  mounted() {
    // Hide header
    if (this.$route.query.header === 'show') {
      this.setHeaderShow(true)
    }

    if (this.$route.query && this.$route.query.tenderUuid) {
      this.$refs.Tender.loadTender(null, this.$route.query.tenderUuid)
    }
  },

  methods: {
    ...mapActions('defaultStore', [
      'setHeaderShow',
    ]),

    show(tender) {
      this.isVisible = true
      this.tender = tender
      this.$nextTick(() => {
        let tenderId = tender.tender_id && tender.tender_id ? tender.tender_id.raw : null
        let tenderUuid = tender.tender_id && tender.tender_uuid ? tender.tender_uuid.raw : null
        this.$refs.Tender.loadTender(tenderId, tenderUuid)
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
