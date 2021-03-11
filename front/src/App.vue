<template>
  <v-app
    style="  color: #3a4570; font-size: 14px;"
  >
    <AppToolbar v-if="isHeaderShow" class="app--toolbar" />
    <v-app-bar
      v-if="1 === 2"
      app
      color="grey darken-3"
      dark
    >
      <div class="d-flex align-center">
        AppSearch
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        <span class="mr-2">link</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main class="pa-0">
      <router-view :key="$route.fullpath"></router-view>
    </v-main>

    <!-- Dialog -->
    <ConfirmDialog />
    <InsufficientRightDialog />
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AppToolbar from '@/components/AppToolbar'
import ConfirmDialog from '@/components/modal/ConfirmDialog'
import InsufficientRightDialog from '@/components/modal/InsufficientRightDialog'

export default {
  name: 'App',

  components: {
    AppToolbar,
    ConfirmDialog,
    InsufficientRightDialog,
  },

  computed: {
    ...mapGetters([
      'isHeaderShow',
      'getIsMobile',
    ]),
  },

  mounted() {
    this.hideConfirmModal()
    this.hideInsufficientRightDialog()
    window.addEventListener('resize', this.handleWindowResize)
    this.handleWindowResize()
  },

  methods: {
    ...mapActions([
      'initIsMobile',
      'hideConfirmModal',
      'hideInsufficientRightDialog',
    ]),

    handleWindowResize() {
      const windowWidth = window.innerWidth;
      if (windowWidth < 500) {
        this.initIsMobile(true)
      } else {
        this.initIsMobile(false)
      }
    },
  },
}
</script>
