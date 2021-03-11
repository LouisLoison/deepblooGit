<template>
  <v-dialog
    v-model="isShowDialog"
    scrollable
    :max-width="!getIsMobile ? 900 : null"
    :fullscreen="getIsMobile"
    :hide-overlay="getIsMobile"
  >
    <v-card>
      <v-toolbar dark dense color="blue-grey lighten-4 black--text">
        <div class="title">
          Compare tender
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
        <div>
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                  </th>
                  <th class="text-left" style="width: 50%;">
                    Tender info
                  </th>
                  <th class="text-left" style="width: 50%;">
                    Tender
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td valign="top" class="font-weight-bold">
                    Title
                  </td>
                  <td valign="top" style="word-break: break-all;">
                    <div v-if="getImportTenderInfo">
                      {{ getImportTenderInfo.short_desc }}
                    </div>
                  </td>
                  <td valign="top" style="word-break: break-all;">
                    <div v-if="getTender">
                      {{ getTender.title }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td valign="top" class="font-weight-bold">
                    Bid Deadline
                  </td>
                  <td style="word-break: break-all;">
                    <div v-if="getImportTenderInfo">
                      {{ getImportTenderInfo.doc_last }}
                    </div>
                  </td>
                  <td style="word-break: break-all;">
                    <div v-if="getTender">
                      {{ getTender.termDate.split('T')[0] }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td valign="top" class="font-weight-bold">
                    Buyer name
                  </td>
                  <td style="word-break: break-all;">
                    <div v-if="getImportTenderInfo">
                      {{ getImportTenderInfo.maj_org }}
                    </div>
                  </td>
                  <td style="word-break: break-all;">
                    <div v-if="getTender">
                      {{ getTender.buyerName }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td valign="top" class="font-weight-bold">
                    CPV
                  </td>
                  <td style="word-break: break-all;">
                    <div v-if="getImportTenderInfo">
                      <v-chip
                        v-for="(cpv, index) in getImportTenderInfo.cpv.split(',')"
                        :key="`cpv${index}`"
                        x-small
                        outlined
                        style="white-space: break-spaces; word-break: break-all; height: auto;"
                        class="ma-1"
                      >
                          {{ cpv }}
                      </v-chip>
                    </div>
                  </td>
                  <td style="word-break: break-all;">
                    <div v-if="getTender">
                      <v-chip
                        v-for="(cpv, index) in getTender.cpvs.split(',')"
                        :key="`cpv${index}`"
                        x-small
                        outlined
                        style="white-space: break-spaces; word-break: break-all; height: auto;"
                        class="ma-1"
                      >
                          {{ cpv }}
                      </v-chip>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td valign="top" class="font-weight-bold">
                    ProcurementId
                  </td>
                  <td valign="top" style="word-break: break-all;">
                    <div v-if="getImportTenderInfo">
                      {{ getImportTenderInfo.tender_notice_no }}
                    </div>
                  </td>
                  <td valign="top" style="word-break: break-all;">
                    <div v-if="getTender">
                      {{ getTender.procurementId }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td valign="top" class="font-weight-bold">
                    Description
                  </td>
                  <td valign="top" style="word-break: break-all;">
                    <div v-if="getImportTenderInfo">
                      {{ getImportTenderInfo.tenders_details }}
                    </div>
                  </td>
                  <td valign="top" style="word-break: break-all;">
                    <div v-if="getTender">
                      {{ getTender.description }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="font-weight-bold">
                    Attachment
                  </td>
                  <td style="word-break: break-all;">
                    <div v-if="getImportTenderInfo">
                      <div
                        v-for="(attachment, index) in getImportTenderInfo.related_documents.split(',')"
                        :key="`attachment${index}`"
                      >
                        <v-chip
                          x-small
                          outlined
                          :href="attachment" target="_blank"
                          style="white-space: break-spaces; word-break: break-all; height: auto;"
                          class="my-1"
                        >
                            {{ attachment }}
                        </v-chip>
                      </div>
                    </div>
                  </td>
                  <td style="word-break: break-all;">
                    <div v-if="getTender">
                      <div
                        v-for="(attachment, index) in getTender.sourceUrl.split(',')"
                        :key="`attachment${index}`"
                      >
                        <v-chip
                          x-small
                          outlined
                          :href="attachment" target="_blank"
                          style="white-space: break-spaces; word-break: break-all; height: auto;"
                          class="my-1"
                        >
                            {{ attachment }}
                        </v-chip>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="font-weight-bold">
                    File source
                  </td>
                  <td style="word-break: break-all;">
                    <div v-if="getImportTenderInfo">
                      {{ getImportTenderInfo.fileSource }}
                    </div>
                  </td>
                  <td style="word-break: break-all;">
                    <div v-if="getTender">
                      {{ getTender.fileSource }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="font-weight-bold">
                    Status
                  </td>
                  <td style="word-break: break-all;">
                    <div v-if="getImportTenderInfo">
                      {{ getImportTenderInfo.status }}
                    </div>
                  </td>
                  <td style="word-break: break-all;">
                    <div v-if="getTender">
                      {{ getTender.status }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ImportTenderInfoDialog',

  data: () => ({
    isShowDialog: false,
    dataImportTenderInfo: {
      loading: null,
      data: null
    },
    dataTender: {
      loading: null,
      data: null
    },
  }),

  computed: {
    ...mapGetters([
      'getIsMobile',
      'getUserId',
    ]),

    getImportTenderInfo() {
      if (!this.dataImportTenderInfo.data) {
        return null
      }
      return this.dataImportTenderInfo.data
    },

    getTender() {
      if (!this.dataTender.data) {
        return null
      }
      return this.dataTender.data
    },
  },

  methods: {
    show(importTenderInfo) {
      this.isShowDialog = true
      this.dataImportTenderInfo.loading = null
      this.dataImportTenderInfo.data = JSON.parse(JSON.stringify(importTenderInfo))
      // this.loadImportTenderInfo(importTenderInfo.importTenderInfoId)
      this.loadTender()
    },

    async loadImportTenderInfo(importTenderInfoId) {
      try {
        this.dataImportTenderInfo.loading = 0
        const res = await this.$api.post('/Annonce/AnnonceClickList', {
          filter: {
            importTenderInfoId: importTenderInfoId
          }
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataImportTenderInfo.data = res.data
        this.dataImportTenderInfo.loading = 1
      } catch (err) {
        this.dataImportTenderInfo.loading = -1
        this.$api.error(err, this)
      }
    },

    async loadTender() {
      try {
        this.dataTender.data = null
        if (
          !this.dataImportTenderInfo.data
          || !this.dataImportTenderInfo.data.tenderId
        ) {
          this.dataTender.loading = 1
          return
        }
        this.dataTender.loading = 0
        const res = await this.$api.post('/Tender/TenderGet', {
          id: this.dataImportTenderInfo.data.tenderId
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataTender.data = res.data
        this.dataTender.loading = 1
      } catch (err) {
        this.dataTender.loading = -1
        this.$api.error(err, this)
      }
    },
  }
}
</script>
