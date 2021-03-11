<template>
  <v-dialog
    v-model="getConfirmModal.visible"
    max-width="600"
  >
    <v-card>
      <v-card-title :class="getConfirmModal.headerClass">
        <v-icon
          v-if="getConfirmModal.headerIcon"
          dark
          size="26"
          class="mr-3"
        >
          {{ getConfirmModal.headerIcon }}
        </v-icon>
        {{ getConfirmModal.title }}
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <span
          v-html="getConfirmModal.message"
          class="body-1"
        />
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer />
        <v-btn
          v-for="button in getConfirmModal.buttons"
          :key="button.libelle"
          small
          class="ml-2"
          :text="button.text"
          :class="button.class ? button.class : ''"
          @click="clickButton(button)"
        >
          {{ button.libelle }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ConfirmModal',

  data: () => ({
    isShowDialog: false,
  }),

  computed: {
    ...mapGetters([
      'getConfirmModal',
    ]),
  },

  methods: {
    ...mapActions([
      'hideConfirmModal'
    ]),

    show() {
      this.isShowDialog = true
    },

    clickButton (button) {
      if (!button.action) {
        this.close()
      } else {
        button.action(this)
      }
    },

    close () {
      this.hideConfirmModal()
    },
  },
}
</script>
