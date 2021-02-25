<template>
  <div style="width: 100%; height: 100%;">
    <div
      v-if="display === 'EDIT' && !item.showHeader"
      @click="selectItem(item)"
      class="vue-draggable-handle"
      style="position: absolute; z-index: 1; background-color: #607d8b; border-radius: 10px; margin: 3px 0px 0px 3px; padding: 2px 4px 2px 4px;"
    >
      <v-icon color="white" small>fa-arrows-alt</v-icon>
      <v-btn
        v-if="display === 'EDIT'"
        @click="deleteItem(item)"
        color="white"
        icon
        x-small
        class="ml-1"
        title="Delete"
      >
        <v-icon x-small>fa-trash-alt</v-icon>
      </v-btn>
    </div>
    <div
      v-if="item.type === 'FILTER'"
      @click="selectItem(item)"
      :class="selectedUuid === item.i ? `${item.colorBackground} lighten-3` : `${item.colorBackground} lighten-5`"
    >
      <ItemFilter
        :filter="filter"
        :dataSearch="dataSearch"
        :item="item"
        @filterChange="filterChange($event)"
      />
    </div>
    <v-card
      v-else
      class="mx-auto"
      :class="selectedUuid === item.i ? `${item.colorBackground} lighten-3` : `${item.colorBackground} lighten-5`"
      style="width: 100%; height: 100%; overflow: hidden;"
    >
      <v-card-title
        @click="selectItem(item)"
        v-if="item.showHeader"
        class="py-0 pl-2 pr-0 vue-draggable-handle"
        :class="selectedUuid === item.i ? `${item.colorHeader} lighten-2` : `${item.colorHeader} lighten-4`"
      >
        <span
          v-if="!item.title || item.title.trim() === ''"
          class="grey--text text--darken-2"
        >
          Item#{{ item.i }}
        </span>
        <span v-else>
          {{ item.title }}
        </span>
        <v-spacer />
        <v-btn
          v-if="display === 'EDIT'"
          @click="deleteItem(item)"
          color="blue-grey"
          icon
          small
          title="Delete"
        >
          <v-icon x-small>fa-trash-alt</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text
        @click="selectItem(item)"
        class="no-drag pa-0"
        style="overflow: hidden;"
        :style="`height: calc(100% - ${item.showHeader ? 32 : 0}px);`"
      >
        <div
          v-if="!dataSearch.loading"
          class="text-center"
          :class="item.h > 1 ? 'pt-5' : 'pt-1'"
        >
          <v-progress-circular :size="item.h > 1 ? 50 : 20" color="blue-grey lighten-4" indeterminate />
        </div>
        <div v-else-if="item.data.isDataEmpty" class="grey--text pa-5 text-center">
          No data
        </div>
        <template v-else>
          <highcharts
            v-if="item.type === 'CHART'"
            :options="item.chart"
          />
          <highcharts
            v-else-if="item.type === 'CHART-MAP'"
            :options="item.chart"
            :constructor-type="'mapChart'"
            class="map"
            :ref="`ChartMap${item.i}`"
          />
          <v-data-table
            v-else-if="item.type === 'TABLE'"
            :headers="item.data.headers"
            :items="item.data.datas"
            :hide-default-header="!item.data.showHeader"
            :fixed-header="item.data.fixedHeader"
            :items-per-page="item.data.itemsPerPage"
            :hide-default-footer="!item.data.showFooter"
            :height="item.data.height"
            dense
            class="elevation-0 transparent"
            @click:row="openTender($event)"
          />
          <div
            v-else-if="item.type === 'DATA'"
            class="pa-3"
            style="width: 100%; height: 100%; display: table;"
          >
            <span
              :class="`text-h${item.data.textSize}`"
              style="display: table-cell;"
              :style="`text-align: ${item.data.alignHorizontal.toLowerCase()}; vertical-align: ${item.data.alignVertical.toLowerCase()};`"
            >
              {{ $global.formatMillier(item.data.value) }} {{ item.data.unite }}
            </span>
          </div>
          <div
            v-else-if="item.type === 'TEXT'"
            class="pa-3"
            style="width: 100%; height: 100%; display: table;"
          >
            <span
              style="display: table-cell; line-height: initial;"
              :style="`text-align: ${item.data.alignHorizontal.toLowerCase()}; vertical-align: ${item.data.alignVertical.toLowerCase()}; font-size: ${6 + (item.data.textSize * 8)}px;`"
            >
              {{ item.data.value }}
            </span>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import ItemFilter from '@/views/dashboard/components/items/ItemFilter'

export default {
  name: 'ItemCard',

  components: {
    ItemFilter,
  },

  props: {
    display: {
      type: String,
      required: false,
    },

    selectedUuid: {
      type: String,
      required: false,
    },

    filter: {
      type: Object,
      required: false,
    },

    dataSearch: {
      type: Object,
      required: true,
    },

    item: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
  }),

  methods: {
    selectItem(item) {
      this.$emit('selectItem', item)
    },

    deleteItem(item) {
      this.$emit('deleteItem', item)
    },

    filterChange(selectedItems) {
      this.$emit('filterChange', selectedItems)
    },

    openTender(tender) {
      this.$emit('openTender', tender)
    },
  },
}
</script>
