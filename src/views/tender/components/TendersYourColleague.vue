<template>
  <div class="py-2">
    <div v-if="!getDataOpportunity.loading" class="text-center pa-5">
      <v-progress-circular :size="50" color="blue-grey lighten-4" indeterminate />
    </div>
    <div
      v-else-if="!getColleagues || !getColleagues.length"
      class="text-center pa-5 grey--text"
    >
      none
    </div>
    <div v-else>
      <a
        v-for="(user, index) in getColleagues"
        :key="`colleague${index}`"
        :href="`https://platform.deepbloo.com/users/${user.hivebriteId}`"
        target="_blank"
        class="ma-1"
        style="text-decoration: none; cursor: pointer;"
      >
        <v-chip
          outlined
          class="mt-1 mr-1 ml-0 pl-1"
          style="text-decoration: none; cursor: pointer;"
        >
          <v-avatar class="pa-1 mr-1">
            <img :src="user.photo" alt="" />
          </v-avatar>
          {{ user.username }}
        </v-chip>
      </a>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TendersYourColleague',

  computed: {
    ...mapGetters('defaultStore', [
      'getUserId',
      'getDataOpportunity',
    ]),

    getOrganizationUsers() {
      if (
        !this.getDataOpportunity.data ||
        !this.getDataOpportunity.data.organization ||
        !this.getDataOpportunity.data.organization.users ||
        !this.getDataOpportunity.data.organization.users.length
      ) {
        return []
      }
      return this.getDataOpportunity.data.organization.users
    },

    getColleagues() {
      if (!this.getUserId) {
        return
      }
      return this.getOrganizationUsers.filter(a => a.userId !== this.getUserId)
    },
  },

  data: () => ({
  }),
};
</script>
