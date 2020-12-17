<template>
  <div id="setting" class="grey lighten-5">
    <v-navigation-drawer
      v-if="!getIsMobile"
      app
      right
      permanent
      style="z-index: 10;"
    >
      <v-toolbar text>
        <v-list>
          <v-list-item>
            <v-list-item-title class="title">
              Administration
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-toolbar>

      <v-divider></v-divider>

      <v-list
        v-for="(menu, index) of menus"
        :key="`menu${index}`"
        dense
        class="pt-0"
      >
        <v-list-item :to="menu.link" active-class="primary--text highlighted">
          <v-list-item-action>
            <v-icon>{{ menu.ico }}</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{ menu.label }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <div v-else style="position: fixed; top: 58px; right: 0px; z-index: 100;">
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            Settings
            <v-icon class="pl-2">fa-caret-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(menu, index) in menus"
            :key="`menu${index}`"
            :to="menu.link"
            active-class="highlighted"
          >
            <v-list-item-title>{{ menu.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <v-main fluid class="pt-0">
      <router-view style="margin-top: 0px;" />
    </v-main>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

export default {
  name: 'Setting',

  data: () => ({
    moment,
    menus: [
      {
        ico: 'fa-users',
        label: 'Users',
        link: { name: 'SettingUser' }
      },
      {
        ico: 'fa-building',
        label: 'Organization',
        link: { name: 'SettingOrganization' }
      },
      {
        ico: 'fa-stop',
        label: 'CPV',
        link: { name: 'SettingCpv' }
      },
      {
        ico: 'fa-circle',
        label: 'Annonce',
        link: { name: 'SettingAnnonce' }
      },
      {
        ico: 'fa-envelope',
        label: 'Notify',
        link: { name: 'SettingNotify' }
      },
      {
        ico: 'fa-chart-pie',
        label: 'Analytics',
        link: { name: 'SettingAnalytics' }
      },
      {
        ico: 'fa-file-import',
        label: 'Import',
        link: { name: 'SettingImportStatistique' }
      },
      {
        ico: 'fa-sliders-h',
        label: 'Other',
        link: { name: 'SettingOther' }
      },
    ]
  }),

  computed: {
    ...mapGetters([
      'getIsMobile',
    ]),
  },

  mounted() {
    if (this.$route.name === 'Setting') {
      this.$router.push({ name: 'SettingUser' })
    }
  },

  methods: {
    ...mapActions([
      'setHeaderShow',
    ])
  }
};
</script>

<style></style>
