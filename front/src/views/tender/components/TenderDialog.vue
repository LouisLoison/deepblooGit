<template>
  <v-dialog
    v-if="dialogState && getPreviewUUID"
    v-model="dialogState"
    :scrollable="getIsMobile"
    :max-width="!getIsMobile ? '80%' : null"
    :fullscreen="getIsMobile"
    :hide-overlay="getIsMobile"
  >
    <Tender
      ref="Tender"
      @close="dialogState = false"
      @openTenderGroupChoice="openTenderGroupChoice($event)"
    />
  </v-dialog>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
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
    dialogState: {
      get () {
        return this.getPreviewState
      },
      set (value) {
        this.UPDATE_PREVIEW_STATE(value)
      }
    },
    ...mapGetters('appSearchTender', [
      'getPreviewState',
      'getPreviewUUID'
    ]),
    ...mapGetters('defaultStore', [
      'getIsMobile',
    ])
  },
  methods: {
    ...mapMutations('appSearchTender', [
      'UPDATE_PREVIEW_STATE'
    ]),
    show(tender) {
      console.log(tender)
      this.tender = tender
      this.$nextTick(() => {
        let tenderUuid = null
        if (tender.id) {
          tenderUuid = tender.id
          if (tender.id.raw) {
            tenderUuid = tender.id.raw
          }
        }
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
