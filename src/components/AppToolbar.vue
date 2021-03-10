<template>
  <div>
    <v-toolbar
      dark
      style="background-color: #323A45; z-index: 10;"
    >
      <img
        v-if="!getIsMobile"
        class="ml-5"
        src="https://d1c2gz5q23tkk0.cloudfront.net/assets/networks/81/website_header_logo/6f24d9c66c519afe4e608c1409406813-original.png?1499509224"
        alt="Deepbloo"
        height="50"
      />
      <img v-else src="/static/deepbloo-logo.png" height="36" alt="Deepbloo" />
      <v-spacer></v-spacer>
      <v-btn
        v-if="getUserType === 1"
        icon
        small
        :to="{ name: 'Setting' }"
      >
        <v-icon style="font-size: 14px;">fa-cog</v-icon>
      </v-btn>
      <v-menu offset-y bottom left>
        <template slot="activator" slot-scope="{ on }">
          <v-btn dark icon v-on="on" :title="getUsername">
            <v-icon v-if="!getUserPhoto">fa-ellipsis-v</v-icon>
            <v-avatar v-else size="30">
              <img :src="getUserPhoto" :alt="getUsername" />
            </v-avatar>
          </v-btn>
        </template>
        <v-list class="pa-2 text-right">
          <div v-if="getUserId">
            <div class="title font-weight-bold blue-grey--text text--darken-2">
              {{ getUsername }}
            </div>
            <div class="caption blue-grey--text text--darken-1">
              {{ getUserEmail }}
            </div>
            <hr class="ma-2" />
            <v-btn :to="{ name: 'Login' }" text small block class="my-1">
              <v-icon size="14">fa-lock</v-icon>
              Logout
            </v-btn>
          </div>
          <div v-else>
            <v-btn :to="{ name: 'Login' }" text small block class="my-1">
              <v-icon size="14">fa-lock</v-icon>
              Login
            </v-btn>
          </div>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-toolbar
      class="text-center"
      color="white"
      fixed
      dense
      style="z-index: 5;"
      :style="
        !getIsMobile
          ? 'display: grid; justify-content: center;'
          : ''
      "
    >
      <v-toolbar-items v-if="!getIsMobile">
        <v-btn
          v-for="(item, index) in items"
          :key="`item${index}`"
          text
          :href="item.href"
          :to="item.to"
          active-class="highlighted"
        >
          {{ item.title }}
        </v-btn>
      </v-toolbar-items>
      <v-menu v-else offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>fa-bars</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in items"
            :key="`item${index}`"
            :href="item.href"
            :to="item.to"
            active-class="highlighted"
          >
            <v-list-item-title>
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'

export default {
  name: 'AppToolbar',

  data: () => ({
    moment,
    items: [
      {
        title: 'Invite',
        to: { name: 'invite' },
      },
      {
        title: 'Live feed',
        href: 'https://platform.deepbloo.com/',
      },
      {
        title: 'Tenders',
        to: { name: 'Tenders' },
      },
      {
        title: 'Dashboard',
        to: { name: 'Dashboards' }, // PrivateDeals
      },
    ]
  }),

  computed: {
    ...mapGetters([
      'getIsMobile',
      'getUserId',
      'getUserPhoto',
      'getUsername',
      'getUserEmail',
      'getUserType',
    ])
  },
}
</script>

<style>
.btn-menu {
  background-color: #ffffff !important;
  border-bottom: 3px solid #ffffff;
}
.btn-menu:hover {
  background: #ffffff !important;
  background-color: #ffffff !important;
  /* border-bottom: 3px solid #ffcccc; */
}

.btn-menu.active {
  border-bottom: 3px solid #f7444a;
}
.highlighted .v-btn__content {
  color: #f7444a;
}
</style>
