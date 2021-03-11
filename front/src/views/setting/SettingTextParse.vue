<template>
  <v-container fluid class="pt-0">
    <div>
      <v-card-title v-if="!getIsMobile">
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="blue-grey"
              dark
              v-bind="attrs"
              v-on="on"
              :loading="!getThemes"
            >
              {{ !themeFilter ? `Themes` : `Theme: ${themeFilter}` }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="themeFilter = null">
              <v-list-item-title class="grey--text">
                All
              </v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item
              v-for="(theme, index) in getThemes"
              :key="`theme${index}`"
              @click="themeFilter = theme"
            >
              <v-list-item-title>
                {{ theme }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-spacer />
        <v-btn
          fab
          small
          color="blue-grey lighten-5"
          class="mr-2"
          title="Export CSV"
          @click="downloadCsv()"
        >
          <v-icon>fa-file</v-icon>
        </v-btn>
        <v-btn
          fab
          small
          color="blue-grey lighten-5"
          class="mr-2"
          title="refresh user liste"
          @click="loadUsers()"
        >
          <v-icon>fa-sync</v-icon>
        </v-btn>
      </v-card-title>

      <div v-if="!getTextParses" class="text-center">
        <div class="pa-2 grey--text">Loading...</div>
        <v-progress-circular :size="50" color="blue-grey lighten-4" indeterminate />
      </div>
      <div v-else>
        <div
          v-for="(textParse, index) in getTextParses"
          :key="`textParse${index}`"
          class="list-grid grey lighten-4 my-1 px-1 py-2"
        >
          <div>
            <div
              class="blue-grey--text font-weight-bold"
              style="word-break: break-all;"
            >
              {{ textParse.group }}
            </div>
            <div class="grey--text">
              {{ textParse.theme }}
            </div>
            <div class="grey--text caption">
              {{ textParse.type }}
            </div>
          </div>
          <div>
            <v-chip
              v-for="(word, wordIndex) in textParse.words.split(',')"
              :key="`word${wordIndex}`"
              small
              outlined
              color="primary"
              class="mr-1 mb-1"
            >
              {{ word }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

export default {
  name: 'SettingTextParse',

  data: () => ({
    moment,
    dataTextParses: {
      loading: null,
      data: null
    },
    themeFilter: null,
    notEmptyRules: [v => !!v || 'Data is required'],
  }),

  computed: {
    ...mapGetters([
      'getIsMobile',
    ]),

    getThemes() {
      if (
        !this.dataTextParses
        || !this.dataTextParses.data
      ) {
        return null
      }
      return this.dataTextParses.data.map(a => a.theme).filter((v, i, a) => a.indexOf(v) === i).sort()
    },

    getTextParses() {
      if (
        !this.dataTextParses
        || !this.dataTextParses.data
      ) {
        return null
      }
      let textParses = this.dataTextParses.data
      if (this.themeFilter) {
        textParses = textParses.filter(a => a.theme === this.themeFilter)
      }
      return textParses
    },
  },

  mounted() {
    this.loadCpvs()
  },

  methods: {
    ...mapActions([
      'showConfirmModal',
    ]),

    async loadCpvs() {
      try {
        this.dataTextParses.loading = 0
        const res = await this.$api.post('/TextParse/textParseList')
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataTextParses.data = res.data
        this.dataTextParses.loading = 1
      } catch (err) {
        this.dataTextParses.loading = -1
        this.$api.error(err, this)
      }
    },

    async downloadCsv() {
      this.loadingCsv = true
      try {
        const res = await this.$api.post("/TextParse/downloadCsv")
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.$api.fileDownload(res.data.fileName)
      } catch (err) {
        this.$api.error(err, this)
      }
      this.loadingCsv = false
    },
  }
}
</script>

<style scoped>
@media screen and (max-width: 600px) {
  .list-grid {
    display: grid;
    grid-template-columns: 150px 1fr;
    grid-gap: 0px 2px;
  }
}
@media screen and (min-width: 600px) {
  .list-grid {
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-gap: 0px 2px;
  }
}
</style>
