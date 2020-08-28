<template>
  <div class="py-3 text-center">
    <v-btn
      @click="logoutUser()"
      rounded
      color="blue-grey lighten-5"
      class="mx-1"
    >
      <v-icon size="14" class="pr-2">fa-lock</v-icon>
      Logout
    </v-btn>
    <v-btn
      :to="{ name: 'TenderAdd' }"
      rounded
      dark
      color="green"
      class="mx-1"
    >
      <v-icon size="14" class="pr-2">fa-plus</v-icon>
      Add tender
    </v-btn>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'TendersAction',

  computed: {
    ...mapGetters([
      'getUserId',
    ]),
  },

  methods: {
    ...mapActions([
      "logoutUser",
    ]),
  },
}
</script>

<style>
</style>
