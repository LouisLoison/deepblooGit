<template>
  <div
    class="dashboards-grid"
    style="overflow: auto; height: 100%;"
    :style="
      getIsMobile
        ? 'margin-top: -44px;'
        : `height: calc(100vh - ${getHeightMainLayer}px); overflow: auto; margin-top: 0px;`
    "
  >
    <div
      style="overflow: auto; background-color: #f5f5f5; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px;"
      :style="`height: calc(100vh - ${getHeightMainLayer}px);`"
    >
      <v-app-bar
        dense
        color="grey lighten-4"
      >
        <span class="text-h5 font-weight-bold">
          Dashboard
        </span>

        <v-spacer />

        <v-btn
          @click="display = 'EDIT'"
          icon
          color="blue-grey"
          title="Edit"
        >
          <v-icon small>fa-plus</v-icon>
        </v-btn>
        <v-btn
          @click="search()"
          icon
          color="blue-grey"
          title="Refresh"
        >
          <v-icon small>fa-sync-alt</v-icon>
        </v-btn>
      </v-app-bar>
      <div class="pa-2 grey lighten-4">
        <v-text-field
          v-model="search"
          dense
          solo
          clearable
          hide-details
          type="text"
          label="Search a dashboard..."
          :style="!search || search.trim() === '' ? 'opacity: 0.5;' : ''"
        />
      </div>
      <perfect-scrollbar
        class="search-panel__filters"
        style="overflow: hidden !important;"
        :style="
          getIsMobile
            ? 'margin-top: -44px;'
            : `height: calc(100vh - ${getHeightMainLayer + 102}px);`
        "
      >
        <v-treeview
          :items="items"
          :search="search"
          :open.sync="open"
          dense
          activatable
          open-on-click
        >
          <template v-slot:prepend="{ item, open }">
            <div v-if="item.folder">
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    icon
                    color="grey"
                  >
                    <v-icon small>fa-ellipsis-v</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item>
                    <v-list-item-title>Add a dashboard</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-icon v-if="item.folder" color="grey">
                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
              </v-icon>
            </div>
            <div v-else>
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    icon
                    color="grey"
                  >
                    <v-icon small>fa-ellipsis-v</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item>
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-icon color="blue-grey">
                fa-chart-pie
              </v-icon>
            </div>
          </template>
          <template v-slot:label="{ item }">
            <span v-if="item.folder" class="grey--text">
              {{ item.name }}
            </span>
            <span
              v-else
              @click="itemSelected(item)"
              class="blue-grey--text"
            >
              {{ item.name }}
            </span>
          </template>
        </v-treeview>
      </perfect-scrollbar>
    </div>
    <div>
      <div
        v-if="!selectedDashboard"
        class="pa-5 text-center grey--text"
      >
        Select a dashboard
      </div>
      <Dashboard v-else />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Dashboard from '@/views/dashboard/Dashboard'

export default {
  name: 'Dashboards',

  components: {
    Dashboard,
  },

  data: () => ({
    search: null,
    searchCaseSensitive: false,
    selectedDashboard: null,
    open: [],
    items: [
      {
        id: '13215454',
        name: 'Rep1',
        folder: true,
      },
      {
        id: '65468765456',
        name: 'Rep2',
        folder: true,
      },
      {
        id: '6544878987',
        name: 'RepTenders',
        folder: true,
        children: [
          {
            id: '67873139',
            name: 'Solar',
            folder: true,
            children: [{
              id: '46877799',
              name: 'Cpv energie',
            }],
          },
          {
            id: '97846545145616',
            name: 'Cable',
            folder: true,
            children: [{
              id: '77864654',
              name: 'Buyer total',
            }],
          },
          {
            id: '6587968168168',
            name: 'Dash1',
          },
          {
            id: '31467888',
            name: 'Dash2',
          },
        ],
      },
      {
        id: '3114789954',
        name: 'Dash2',
      },
      {
        id: '465465487',
        name: 'Buyer siemens',
      },
    ],
  }),

  computed: {
    ...mapGetters('defaultStore', [
      'getUserId',
      'isHeaderShow',
      'getIsMobile',
    ]),

    getHeightMainLayer() {
      let height = this.isHeaderShow ? 114 : 40
      return height
    },
  },

  methods: {
    itemSelected(item) {
      console.log(item)
      if (
        this.selectedDashboard
        && item.name === this.selectedDashboard.name
      ) {
        this.selectedDashboard = null
      } else {
        this.selectedDashboard = item
      }
    },
  },
}
</script>

<style>
.dashboards-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-gap: 0px 0px;
}
</style>