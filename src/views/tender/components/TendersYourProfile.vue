<template>
  <div class="pa-3" style="overflow: hidden;">
    <div class="pb-2 px-5 text-center">
      <a
        class="caption"
        style="text-decoration: none;"
        :href="`https://platform.deepbloo.com/users/${getUserHivebriteId}`"
        target="_blank"
        @click.stop
        :title="getUsername"
        >To modify your preferences, go on your profile</a
      >
    </div>

    <div v-if="!getDataOpportunity.loading" class="text-center pa-5">
      <v-progress-circular :size="50" color="blue-grey lighten-4" indeterminate />
    </div>
    <div v-else>
      <h5
        class="blue--text text--darken-1 mb-0 cursor-pointer"
        style="border-bottom: 1px solid #1e88e5; position: relative;"
      >
        Opportunities (CPV)
      </h5>
      <div
        v-if="getDataOpportunity.data && getDataOpportunity.data.cpvs"
        class="pt-1 pb-3"
      >
        <v-chip
          v-for="(cpv, index) in getDataOpportunity.data.cpvs"
          :key="index"
          outlined
          class="pl-1 mt-1 mr-1"
          :title="cpv.name"
        >
          <v-avatar class="mr-1" size="10">
            <img :src="cpvLogo(cpv.name)" alt="" />
          </v-avatar>
          {{ cpv.name }}
        </v-chip>
      </div>

      <h5
        class="blue--text text--darken-1 mb-0 cursor-pointer"
        style="border-bottom: 1px solid #1e88e5; position: relative;"
      >
        Interested areas
      </h5>
      <div
        v-if="getDataOpportunity.data && getDataOpportunity.data.user"
        class="pt-1 pb-3"
      >
        <v-chip
          v-for="(region, index) in getDataOpportunity.data.user.regions.split(',')"
          :key="index"
          outlined
          class="mt-1 mr-1"
        >
          {{ region }}
        </v-chip>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TendersYourProfile',

  computed: {
    ...mapGetters('defaultStore', [
      'getUserId',
      'getUsername',
      'getUserHivebriteId',
      'getDataCpvs',
      'getDataOpportunity',
    ]),
  },

  data: () => ({
  }),

  methods: {
    cpvLogo(cpvLabel) {
      if (
        !this.getDataCpvs ||
        !this.getDataCpvs.data ||
        !cpvLabel ||
        cpvLabel === ''
      ) {
        return 'https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png'
      }
      const cpv = this.getDataCpvs.data.find(a => a.label === cpvLabel)
      if (!cpv || !cpv.logo || cpv.logo === '') {
        return 'https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png'
      }
      return cpv.logo
    },
  },
}
</script>
