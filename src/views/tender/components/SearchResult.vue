<template>
  <div
    @click="$emit('tenderDialogShow')"
    class="search-result"
  >
    <div style="position: absolute; top: 10px; left: 10px; z-index: 5;">
      <img
        v-if="
          result.creation_timestamp &&
            result.creation_timestamp.raw &&
            new_timestamp &&
            result.creation_timestamp.raw > new_timestamp
        "
        title="Tender add this day"
        src="/static/image/badgeNew.png"
        style="height: 30px;"
      />
      <div
        v-if="getDataGroups && getDataGroups.loading === 1"
        style="display: inline-block; height: 24px; width: 24px; margin: 0px 0px 0px 4px; background-color: #ffffff !important; position: absolute;"
      >
        <div v-if="!tenderGroups">
          <v-btn
            @click.stop="openTenderGroupChoice()"
            :loading="groupLoading"
            text
            icon
            small
            class="blue-grey--text text--lighten-4"
            style="height: 20px; width: 20px; margin: 0px 4px 0px 0px; background-color: #ffffff !important;"
            title="Add tender to a group"
          >
            <v-icon style="font-size: 12px;">fa-circle</v-icon>
          </v-btn>
        </div>
        <div v-else>
          <v-btn
            v-for="(tenderGroup, indexSelect) in tenderGroups"
            :key="`tenderGroup${indexSelect}`"
            @click.stop="openTenderGroupChoice()"
            :loading="groupLoading"
            text
            icon
            small
            style="height: 24px; width: 24px; margin: 0px 4px 0px 0px; background-color: #ffffff !important;"
            :title="tenderGroup.label"
          >
            <v-icon :style="`font-size: 16px; color:${tenderGroup.color};`">
              fa-circle
            </v-icon>
          </v-btn>
        </div>
      </div>
    </div>
    <div
      class="ribbon ribbon-top-right"
      :title="`BID deadline : ${result.bidDeadlineDate}`"
    >
      <span
        v-if="result.noticeType === 'Contract Award'"
        class="primary darken-1"
        style="font-size: 10px; font-weight: 100;"
      >
        {{ result.noticeType }}
      </span>
      <span
        v-else-if="getBidDeadlineDays >= 7"
        class="green darken-1"
        style="font-size: 10px; font-weight: 100;"
      >
        Expire in {{ getBidDeadlineDays }} days
      </span>
      <span
        v-else-if="
          getBidDeadlineDays >= 0 &&
            getBidDeadlineDays <= 7
        "
        class="orange darken-1"
        style="font-size: 10px; font-weight: 100;"
      >
        Expire
        {{
          getBidDeadlineDays > 0
            ? `in ${getBidDeadlineDays} days`
            : `today`
        }}
      </span>
      <span v-else class="red darken-1">Expired</span>
    </div>
    <div>
      <div class="text-center pt-4 pb-3" style="min-height: 78px;">
        <v-img
          :src="cpvsLogo"
          alt="avatar"
          contain
          max-height="50"
          position="center"
        />
      </div>
      <div
        v-if="result.title"
        class="search-result-title"
      >
        {{ result.title.raw }}
      </div>
      <div
        v-if="result.country"
        class="search-result-country"
      >
        {{ result.country.raw }}
      </div>
      <div
        v-if="result.notice_type"
        class="search-result-buyer"
      >
        {{ result.notice_type.raw }}
      </div>
    </div>
    <div style="position: absolute; bottom: 5px; left: 10px; border-radius: 10px;">
      <v-btn
        title="Notify this opportunity"
        :color="hasNotifys() ? 'red' : 'blue-grey'"
        fab
        small
        dark
        text
        style="height: 24px; width: 24px; margin: 0px 4px 0px 0px;"
        @click.stop="openSentEmailDialog()"
      >
        <v-icon style="font-size: 16px;">fa-envelope</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import moment from "moment"

export default {
  name: 'SearchResult',

  props: {
    result: {
      type: Object,
      required: true
    }
  },

  data: () => ({
    moment,
    new_timestamp: null,
    groupLoading: false,
  }),

  computed: {
    ...mapGetters([
      'getDataCpvs',
      'getDataGroups',
      'getDataUserNotifys',
    ]),

    getBidDeadlineDays() {
      if (
        this.result &&
        this.result.bid_deadline_date &&
        this.result.bid_deadline_date.raw
      ) {
        const now = moment(new Date())
        const date = moment(this.result.bid_deadline_date.raw, "YYYY-MM-DD")
        return date.diff(now, "days")
      }

      if (
        this.result &&
        this.result.biddeadline_date &&
        this.result.biddeadline_date.raw
      ) {
        const now = moment(new Date())
        const date = moment(this.result.biddeadline_date.raw, "YYYY-MM-DD")
        return date.diff(now, "days")
      }

      return null
    },

    cpvsLogo() {
      return this.$global.cpvLogo(this.result.cpvs.raw, this.getDataCpvs.data)
    },

    tenderGroups() {
      if (
        !this.result.groups ||
        !this.result.groups.raw ||
        !this.getDataGroups ||
        this.getDataGroups.loading !== 1 ||
        !this.getDataGroups.data
      ) {
        return null
      }
      const tenderGroups = this.getDataGroups.data.filter(a =>
        this.result.groups.raw.includes(a.tenderGroupId.toString())
      )
      if (!tenderGroups || !tenderGroups.length) {
        return null
      }
      return tenderGroups
    },
  },

  mounted() {
    this.new_timestamp = new Date()
    // this.new_timestamp.setDate(this.new_timestamp.getDate() - 1)
    this.new_timestamp.setHours(0)
    this.new_timestamp.setMinutes(0)
    this.new_timestamp.setSeconds(0)
    this.new_timestamp = this.new_timestamp.getTime()
  },

  methods: {
    getDate(creation_timestamp) {
      let date = new Date()
      date.setTime(creation_timestamp)
      return date
    },

    openTenderGroupChoice() {
      this.$emit('openTenderGroupChoice')
    },

    hasNotifys(tenderId) {
      if (!this.getDataUserNotifys.loading) {
        return false
      }
      if (
        this.getDataUserNotifys.data &&
        this.getDataUserNotifys.data.find(a => a.tenderId === tenderId)
      ) {
        return true
      }
      return false
    },

    openSentEmailDialog() {
      this.$emit('openSentEmailDialog')
    },

    groupLoadingStatus(status) {
      this.groupLoading = status
    },
  },
}
</script>

<style scoped>
.search-result {
  border: 1px solid #c4c8d8;
  box-shadow: 0 2px 5px 0 #e3e5ec;
  overflow: hidden;
  position: relative;
  padding: 6px;
  height: 190px;
  color: #000000;
  text-align: center !important;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.search-result-title {
  font-weight: bold;
  height: 42px;
  overflow: hidden;
  font-size: 14px;
}

.search-result-country {
  font-size: 12px;
  font-weight: normal;
  height: 20px;
  overflow: hidden;
}

.search-result-buyer {
  font-weight: normal;
  height: 42px;
  overflow: hidden;
  font-size: 14px;
}
</style>
