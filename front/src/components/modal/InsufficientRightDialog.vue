<template>
  <v-dialog
    v-if="getInsufficientRightDialog"
    v-model="show"
    max-width="400"
  >
    <v-card class="text-center">
      <v-card-title class="headline">
        Insufficient right !
      </v-card-title>

      <v-card-text class="text-center">
        <div>To be able to access to tender's details, please go</div>
        <v-btn
          rounded
          dark
          color="success"
          href="https://platform.deepbloo.com/memberships"
          target="_parent"
          :title="
            !getUserMembership.hasFree ? 'Free trial - Premium' : 'Premium'
          "
        >
          <span v-if="!getUserMembership.hasFree">Free trial - </span>Premium
        </v-btn>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          color="grey darken-1"
          text
          @click="hideInsufficientRightDialog()"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'InsufficientRightDialog',

  computed: {
    ...mapGetters([
      'getInsufficientRightDialog',
      'getUserMembership',
    ]),
  },

  data: () => ({
    show: false,
  }),

  watch: {
    getInsufficientRightDialog() {
      this.show = this.getInsufficientRightDialog
    },

    panels() {
      this.updateUserScreen()
    },
  },

  methods: {
    ...mapActions([
      'hideInsufficientRightDialog',
    ]),
  }
};
</script>
