<template>
  <v-dialog
    v-if="isVisible"
    v-model="isVisible"
    :scrollable="getIsMobile"
    :max-width="!getIsMobile ? '50%' : null"
    :fullscreen="getIsMobile"
    :hide-overlay="getIsMobile"
  >
    <v-card>
      <v-card-title class="headline">
        Are you sure you want to remove this tender ?
      </v-card-title>
      <v-card-text v-if="tender">
        <div class="font-weight-black blue-grey--text">
          {{ tender.title && tender.title.raw ? tender.title.raw : '' }}
        </div>
        <div class="text-sm-caption pa-4">
          {{ tender.description && tender.description.raw ? this.$global.htmlText(tender.description.raw).substring(0, 300) : '' }}...
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey darken-1"
          text
          @click="isVisible = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="red"
          text
          :loading="loadingRemove"
          @click="removeTender()"
        >
          Remove
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TenderRemoveDialog',

  data: () => ({
    isVisible: false,
    tender: null,
    loadingRemove: false,
  }),

  computed: {
    ...mapGetters('defaultStore', [
      'getIsMobile',
    ]),
  },

  methods: {
    show(tender) {
      this.isVisible = true
      this.loadingRemove = false
      this.tender = tender
    },

    async removeTender() {
      try {
        this.loadingRemove = true
        let res = await this.$api.post('/Tender/TenderRemove', {
          id: this.tender.tender_id.raw,
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
      } catch (err) {
        this.$api.error(err, this)
      }
      this.loadingRemove = false
      this.isVisible = false
      this.$emit('removeTender', this.tender)
    },
  },
}
</script>
