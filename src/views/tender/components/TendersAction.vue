<template>
  <div class="py-3 text-center">
    <v-btn
      v-if="getUserType !== 4"
      rounded
      color="blue"
      class="mx-1 white--text"
      href="https://platform.deepbloo.com/memberships"
    >
      Upgrade
    </v-btn>
    <v-btn
      v-if="1 === 2"
      @click="logoutUser()"
      rounded
      color="blue-grey lighten-5"
      class="mx-1"
    >
      <v-icon
        size="14"
        class="pr-2"
      >
        fa-lock
      </v-icon>
      Logout
    </v-btn>
    <v-btn
      :to="{ name: 'TenderAdd' }"
      rounded
      dark
      color="green"
      class="mx-1"
    >
      <v-icon
        size="14"
        class="pr-2"
      >
        fa-plus
      </v-icon>
      Add tender
    </v-btn>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'TendersAction',

  computed: {
    ...mapGetters('defaultStore', [
      'getUserId',
      'getUserType',
    ]),
  },

  methods: {
    ...mapActions('defaultStore', [
      'logoutUser',
    ]),
  },
}
</script>
