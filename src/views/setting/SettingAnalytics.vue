<template>
  <div>
    <v-tabs
      background-color="blue-grey lighten-5"
    >
      <v-tab @click="loading = true; dashboardUrl = 'https://crmplus.zoho.com/reports/open-view/1876166000002145353/4ddd511e4a07bf182cf00c4ab57c6580'">Exclusion</v-tab>
      <v-tab @click="loading = true; dashboardUrl = 'https://crmplus.zoho.com/reports/open-view/1876166000003018208/3e7f5c1a32a16c4edfe89de13fe01e66'">Tender source</v-tab>
      <v-tab @click="loading = true; dashboardUrl = 'https://crmplus.zoho.com/reports/open-view/1876166000003091457/d026a80e69111f61e7eb15a0b4b72a23'">Community</v-tab>
    </v-tabs>
    <div v-if="loading" class="pa-5 text-center">
      <div class="pa-2 grey--text">
        Please wait. We are building your interface.
      </div>
      <div class="pa-2 grey--text">This may take a few minutes...</div>
      <v-progress-circular :size="50" color="grey" indeterminate />
    </div>
    <iframe
      v-show="!loading"
      frameborder="0"
      :src="dashboardUrl"
      style="overflow: auto; width: 100%; margin-bottom: -5px;"
      :style="
        isHeaderShow
          ? 'height: calc(100vh - 155px);'
          : 'height: calc(100vh - 40px);'
      "
      scrolling="no"
      @load="loading = false"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SettingAnalytics',

  computed: {
    ...mapGetters([
      'isHeaderShow',
    ]),
  },

  data: () => ({
    loading: true,
    dashboardUrl: 'https://crmplus.zoho.com/reports/open-view/1876166000002145353/4ddd511e4a07bf182cf00c4ab57c6580',
  }),
};
</script>
