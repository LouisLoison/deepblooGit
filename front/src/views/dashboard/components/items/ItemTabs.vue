<template>
  <div>
    <v-sheet elevation="0" class="transparent">
    <v-tabs
      v-model="tabSelected"
      background-color="blue-grey lighten-4"
      show-arrows
      dense
    >
      <v-tabs-slider color="blue-grey" />
      <v-tab
        v-for="tab in item.data.tabs"
        :key="`tab${tab.i}`"
        class="blue-grey--text"
      >
        {{ tab.label }}
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tabSelected" class="transparent">
      <v-tab-item
        v-for="tab in item.data.tabs"
        :key="`tab${tab.i}`"
      >
        <div style="height: 100%;">
          <highcharts
            v-if="tab.item.type === 'CHART' && tab.item.chart"
            :options="tab.item.chart"
          />
          <div v-else class="pa-5">
            Add element...
          </div>
        </div>
      </v-tab-item>
    </v-tabs-items>    
  </v-sheet>
  </div>
</template>

<script>
export default {
  name: 'ItemTabs',

  props: {
    item: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    tabSelected: null,
  }),

  methods: {
  },
}
</script>
