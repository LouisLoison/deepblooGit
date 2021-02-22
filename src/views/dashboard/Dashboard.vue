<template>
  <div style="overflow: auto;">
    <v-app-bar
      v-if="display === 'EDIT'"
      color="blue-grey lighten-2"
      dense
      dark
    >
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            text
            small
            v-bind="attrs"
            v-on="on"
          >
            <v-icon x-small class="mr-2">fa-plus</v-icon>
            Add element
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="addItem()">
            <v-list-item-title>Text</v-list-item-title>
          </v-list-item>
          <v-list-item @click="addItem()">
            <v-list-item-title>Image</v-list-item-title>
          </v-list-item>
          <v-list-item @click="addItem()">
            <v-list-item-title>Metric</v-list-item-title>
          </v-list-item>
          <v-list-item @click="addItem()">
            <v-list-item-title>Table</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-subheader
            class="pl-2 blue-grey lighten-5"
            style="height: 30px;"
          >
            Chart
          </v-subheader>
          <v-list-item @click="addItem()">
            <v-list-item-icon>
              <v-icon>fa-chart-bar</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Column</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="addItem()">
            <v-list-item-icon>
              <v-icon>fa-chart-pie</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Pie</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="addItem()">
            <v-list-item-icon>
              <v-icon>fa-globe-americas</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Map</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-spacer />

      <v-btn @click="display = 'PREVIEW'; selectedUuid = null" text>
        Preview
      </v-btn>

      <v-btn icon title="Save">
        <v-icon>fa-save</v-icon>
      </v-btn>

      <v-btn @click="search()" icon title="Refresh">
        <v-icon>fa-sync-alt</v-icon>
      </v-btn>
    </v-app-bar>

    <div
      class="dashboard-grid"
      style="overflow: auto; height: 100%;"
      :style="
        getIsMobile
          ? 'margin-top: -44px;'
          : `height: calc(100vh - ${getHeightMainLayer}px); overflow: auto; margin-top: 0px;`
      "
    >
      <div style="overflow: hidden; height: 100%; border-right: 1px solid #c1c1c1;">
        <div
          class="pa-3"
          style="overflow: auto; height: 100%;"
        >
          <grid-layout
            :layout.sync="dashboard.items"
            :col-num="12"
            :row-height="30"
            :is-draggable="display === 'EDIT'"
            :is-resizable="display === 'EDIT'"
            :is-mirrored="false"
            :vertical-compact="dashboard.verticalCompact"
            :use-css-transforms="false"
            :responsive="true"
          >
            <grid-item
              v-for="item in dashboard.items"
              :key="item.i"
              :x="item.x"
              :y="item.y"
              :w="item.w"
              :h="item.h"
              :i="item.i"
              drag-allow-from=".vue-draggable-handle"
              drag-ignore-from=".no-drag"
              @resized="resizedEvent(item)"
            >
              <ItemCard
                :display="display"
                :selectedUuid="selectedUuid"
                :filter="filter"
                :dataSearch="dataSearch"
                :item="item"
                @selectItem="selectItem($event)"
                @deleteItem="deleteItem($event)"
                @openTender="openTender($event)"
              />
            </grid-item>
          </grid-layout>
        </div>
      </div>

      <div
        class="blue-grey lighten-5"
        style="overflow: auto; height: 100%;"
      >
        <perfect-scrollbar
          class="search-panel__filters pa-0"
          style="height: calc(100vh - 155px);"
          :style="!getIsMobile ? 'height: 100%; overflow: auto;' : ''"
        >
          <div v-if="display === 'EDIT'">
            <div v-if="selectedUuid">
              <div class="grey--text pa-3">
                <div>
                  Item#<span class="blue-grey--text">{{ selectedUuid }}</span>
                </div>
                <div>
                  Type: <span class="blue-grey--text">{{ getSelectedItem.type }}</span>
                </div>
                <v-btn
                  icon
                  color="blue-grey"
                  absolute
                  top
                  right
                  @click="selectedUuid = null"
                >
                  <v-icon>fa-times</v-icon>
                </v-btn>
              </div>
              <div class="grey lighten-4 pa-1 ma-2">
                <div>
                  <v-switch
                    dense
                    hide-details
                    v-model="getSelectedItem.showHeader"
                    class="pa-0 ma-0"
                    label="Show header"
                    @change="resizedEvent(getSelectedItem)"
                  />
                </div>

                <v-text-field
                  v-if="getSelectedItem.showHeader"
                  v-model="getSelectedItem.title"
                  label="Title"
                />

                <v-menu
                  v-if="getSelectedItem.showHeader"
                  offset-y
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="blue-grey"
                      text
                      dark
                      small
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon x-small :color="getSelectedItem.colorHeader" class="mr-2">fa-square</v-icon>
                      Header
                    </v-btn>
                  </template>
                  <v-list dense max-height="400" class="white">
                    <v-list-item
                      v-for="(color, index) of colors"
                      :key="`colors${index}`"
                      @click="getSelectedItem.colorHeader = color.value"
                    >
                      <v-list-item-icon>
                        <v-icon :color="color.value">fa-square</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>{{ color.label }}</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-menu>

                <v-menu offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="blue-grey"
                      text
                      dark
                      small
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon x-small :color="getSelectedItem.colorBackground" class="mr-2">fa-square</v-icon>
                      Background
                    </v-btn>
                  </template>
                  <v-list dense max-height="400" class="white">
                    <v-list-item
                      v-for="(color, index) of colors"
                      :key="`colors${index}`"
                      @click="getSelectedItem.colorBackground = color.value"
                    >
                      <v-list-item-icon>
                        <v-icon :color="color.value">fa-square</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>{{ color.label }}</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-menu>

                <div v-if="getSelectedItem.type === 'TABLE'">
                  <v-switch
                    v-model="getSelectedItem.table.fixedHeader"
                    :label="`Fixed header: ${getSelectedItem.table.fixedHeader.toString()}`"
                  />
                </div>
                <div
                  v-else-if="getSelectedItem.type === 'FILTER'"
                  class="pa-3"
                >
                  <div>
                    <div class="grey--text">Facet</div>
                    <v-menu offset-y>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="blue-grey"
                          dark
                          small
                          block
                          v-bind="attrs"
                          v-on="on"
                        >
                          {{ !getSelectedItem.facet ? 'none' : $global.facetLabel(getSelectedItem.facet) }}
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item
                          v-for="(facet, index) in Object.keys(this.facets)"
                          :key="`facet${index}`"
                          @click="getSelectedItem.facet = facet; setSearchDatas()"
                        >
                          <v-list-item-title>
                            {{ $global.facetLabel(facet) }}
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </div>
                <div
                  v-else-if="getSelectedItem.type === 'DATA'"
                  class="pa-3"
                >
                  <div>
                    <div class="grey--text">Facet</div>
                    <v-menu offset-y>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="blue-grey"
                          dark
                          small
                          block
                          v-bind="attrs"
                          v-on="on"
                        >
                          {{ !getSelectedItem.facet ? 'none' : $global.facetLabel(getSelectedItem.facet) }}
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item
                          v-for="(facet, index) in Object.keys(this.facets)"
                          :key="`facet${index}`"
                          @click="getSelectedItem.facet = facet; setSearchDatas()"
                        >
                          <v-list-item-title>
                            {{ $global.facetLabel(facet) }}
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <div class="pt-3">
                    <div class="grey--text">Process type</div>
                    <v-menu offset-y>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="blue-grey"
                          dark
                          small
                          block
                          v-bind="attrs"
                          v-on="on"
                        >
                          {{ !getSelectedItem.data.processType ? 'none' : $global.formatLabel(getSelectedItem.data.processType) }}
                        </v-btn>
                      </template>
                      <v-list dense>
                        <v-list-item @click="getSelectedItem.data.processType = 'COUNT'; setSearchDatas()">
                          <v-list-item-title>COUNT</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="getSelectedItem.data.processType = 'SUM'; setSearchDatas()">
                          <v-list-item-title>SUM</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="getSelectedItem.data.processType = 'AVERAGE'; setSearchDatas()">
                          <v-list-item-title>AVERAGE</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <v-text-field
                    v-model="getSelectedItem.data.unite"
                    label="Unite"
                  />
                  <div class="pt-3">
                    <div class="grey--text">Size</div>
                    <v-btn-toggle
                      v-model="getSelectedItem.data.textSize"
                      color="blue-grey"
                    >
                      <v-btn
                        v-for="n in 5"
                        :key="n"
                        :value="n"
                        small
                      >
                        {{ 6 - n }}
                      </v-btn>
                    </v-btn-toggle>
                  </div>
                  <div class="pt-3">
                    <div class="grey--text">Horizontal align</div>
                    <v-btn-toggle
                      v-model="getSelectedItem.data.alignHorizontal"
                      color="blue-grey"
                    >
                      <v-btn value="LEFT">
                        <v-icon>fa-align-left</v-icon>
                      </v-btn>
                      <v-btn value="CENTER">
                        <v-icon>fa-align-center</v-icon>
                      </v-btn>
                      <v-btn value="RIGHT">
                        <v-icon>fa-align-right</v-icon>
                      </v-btn>
                    </v-btn-toggle>
                  </div>
                  <div class="pt-3">
                    <div class="grey--text">Vertical align</div>
                    <v-btn-toggle
                      v-model="getSelectedItem.data.alignVertical"
                      color="blue-grey"
                    >
                      <v-btn value="TOP">
                        Top
                      </v-btn>
                      <v-btn value="MIDDLE">
                        Middle
                      </v-btn>
                      <v-btn value="BOTTOM">
                        Bottom
                      </v-btn>
                    </v-btn-toggle>
                  </div>
                </div>
                <div
                  v-else-if="getSelectedItem.type === 'TEXT'"
                  class="pa-3"
                >
                  <v-textarea
                    v-model="getSelectedItem.data.value"
                    label="Text"
                  />
                  <div class="pt-3">
                    <div class="grey--text">Size</div>
                    <v-btn-toggle
                      v-model="getSelectedItem.data.textSize"
                      color="blue-grey"
                    >
                      <v-btn
                        v-for="n in 5"
                        :key="n"
                        :value="n"
                        small
                      >
                        {{ n }}
                      </v-btn>
                    </v-btn-toggle>
                  </div>
                  <div class="pt-3">
                    <div class="grey--text">Horizontal align</div>
                    <v-btn-toggle
                      v-model="getSelectedItem.data.alignHorizontal"
                      color="blue-grey"
                    >
                      <v-btn value="LEFT">
                        <v-icon>fa-align-left</v-icon>
                      </v-btn>
                      <v-btn value="CENTER">
                        <v-icon>fa-align-center</v-icon>
                      </v-btn>
                      <v-btn value="RIGHT">
                        <v-icon>fa-align-right</v-icon>
                      </v-btn>
                    </v-btn-toggle>
                  </div>
                  <div class="pt-3">
                    <div class="grey--text">Vertical align</div>
                    <v-btn-toggle
                      v-model="getSelectedItem.data.alignVertical"
                      color="blue-grey"
                    >
                      <v-btn value="TOP">
                        Top
                      </v-btn>
                      <v-btn value="MIDDLE">
                        Middle
                      </v-btn>
                      <v-btn value="BOTTOM">
                        Bottom
                      </v-btn>
                    </v-btn-toggle>
                  </div>
                </div>
                <div
                  v-else-if="getSelectedItem.type === 'CHART'"
                  class="pa-3"
                >
                  <div v-if="['column', 'pie'].includes(getSelectedItem.chart.chart.type)">
                    <div>
                      <div class="grey--text">Facet</div>
                      <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            color="blue-grey"
                            dark
                            small
                            block
                            v-bind="attrs"
                            v-on="on"
                          >
                            {{ !getSelectedItem.facet ? 'none' : $global.facetLabel(getSelectedItem.facet) }}
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item
                            v-for="(facet, index) in Object.keys(this.facets)"
                            :key="`facet${index}`"
                            @click="getSelectedItem.facet = facet; setSearchDatas()"
                          >
                            <v-list-item-title>
                              {{ $global.facetLabel(facet) }}
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                    <div class="pt-3">
                      <div class="grey--text">Facet count max</div>
                      <v-slider
                        v-model="getSelectedItem.facetCountMax"
                        color="blue-grey"
                        label=""
                        min="1"
                        max="20"
                        thumb-label
                        @change="setSearchDatas()"
                      />
                    </div>
                    <div v-if="['pie'].includes(getSelectedItem.chart.chart.type)">
                      <v-switch
                        v-model="getSelectedItem.chart.plotOptions.pie.dataLabels.enabled"
                        :label="`Data labels: ${getSelectedItem.chart.plotOptions.pie.dataLabels.enabled.toString()}`"
                        class="pa-0 ma-0"
                      />
                    </div>
                  </div>
                </div>

                <v-divider />

                <div class="pa-3 grey--text">
                  <div class="grey--text">Position</div>
                  <v-chip
                    x-small
                    class="ma-1 pl-0"
                    color="grey lighten-2"
                    text-color="black"
                    title="X axis"
                  >
                    <v-avatar x-small left class="grey pl-2 white--text">x</v-avatar>
                    {{ getSelectedItem.x }}
                  </v-chip>
                  <v-chip
                    x-small
                    class="ma-1 pl-0"
                    color="grey lighten-2"
                    text-color="black"
                    title="Y axis"
                  >
                    <v-avatar x-small left class="grey pl-2 white--text">y</v-avatar>
                    {{ getSelectedItem.y }}
                  </v-chip>
                  <v-chip
                    x-small
                    class="ma-1 pl-0"
                    color="grey lighten-2"
                    text-color="black"
                    title="Width"
                  >
                    <v-avatar x-small left class="grey pl-2 white--text">w</v-avatar>
                    {{ getSelectedItem.w }}
                  </v-chip>
                  <v-chip
                    x-small
                    class="ma-1 pl-0"
                    color="grey lighten-2"
                    text-color="black"
                    title="Height"
                  >
                    <v-avatar x-small left class="grey pl-2 white--text">h</v-avatar>
                    {{ getSelectedItem.h }}
                  </v-chip>
                </div>
              </div>
            </div>
            <div v-else>
              <div class="px-3 pt-1 pb-5">
                <v-text-field
                  v-model="dashboard.name"
                  label="Name"
                />

                <div class="pt-3">
                  <v-switch
                    dense
                    hide-details
                    v-model="dashboard.showInTenders"
                    class="pa-0 ma-0"
                    label="Show in tenders"
                  />
                </div>
                <div class="pt-3">
                  <v-switch
                    dense
                    hide-details
                    v-model="dashboard.verticalCompact"
                    class="pa-0 ma-0"
                    label="Vertical compact"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="display === 'PREVIEW'">
            <v-app-bar
              color="grey lighten-4"
              dense
            >
              <span class="text-h5 font-weight-bold">{{ dashboard.name }}</span>

              <v-spacer />

              <v-btn
                @click="display = 'EDIT'"
                icon
                color="blue-grey"
                title="Edit"
              >
                <v-icon small>fa-edit</v-icon>
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
            <div v-if="!dataSearch.loading" class="text-center pt-5">
              <v-progress-circular :size="50" color="blue-grey lighten-4" indeterminate />
            </div>
            <v-list
              v-else
              dense
              three-line
            >
              <template v-for="(result, index) in this.dataSearch.data.results">
                <v-list-item
                  :key="`result${index}`"
                  @click="openTender(result)"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      <v-avatar class="mr-1" size="16">
                        <v-img :src="$global.cpvLogo(result.cpvs.raw)" />
                      </v-avatar>
                      {{ $global.htmlText(result.title.raw) }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ $global.htmlText(result.description.raw) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>
          </div>
        </perfect-scrollbar>
      </div>
    </div>

    <!-- Dialog -->
    <TendersDialog
      ref="TendersDialog"
      @tenderOpen="openTender($event)"
    />
    <TenderDialog
      ref="TenderDialog"
      @updateTender="refreshFunction()"
      @openTenderGroupChoice="openTenderGroupChoice($event)"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import VueGridLayout from 'vue-grid-layout'
import constCountrys from '@/assets/constants/countrys.json'
import constCountryMap from '@/assets/constants/countryMap.json'
import ItemCard from '@/views/dashboard/components/ItemCard.vue'
import TendersDialog from '@/views/dashboard/components/TendersDialog.vue'
import TenderDialog from '@/views/tender/components/TenderDialog'

export default {
  name: 'Dashboard',

  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    ItemCard,
    TendersDialog,
    TenderDialog,
  },

  props: {
    inTendersScreen: {
      type: Boolean,
      required: false
    },

    searchFilter: {
      type: Object,
      required: false
    },
  },

  data: () => ({
    moment,
    display: 'PREVIEW',
    constCountrys,
    constCountryMap,
    dataSearch: {
      loading: null,
      data: null,
      error: null,
    },
    facets: {
      brands: {
        type: "value",
        size: 200
      },
      country: {
        type: "value",
        size: 200
      },
      notice_type: {
        type: "value",
        size: 200
      },
      buyer_name: {
        type: "value",
        size: 300
      },
      financials: {
        type: "value",
        size: 200
      },
    },
    selectedUuid: null,
    colors: [
      { label: 'Blue-grey', value: 'blue-grey' },
      { label: 'Grey', value: 'grey' },
      { label: 'Red', value: 'red' },
      { label: 'Pink', value: 'pink' },
      { label: 'Purple', value: 'purple' },
      { label: 'Deep-purple', value: 'deep-purple' },
      { label: 'Indigo', value: 'indigo' },
      { label: 'Blue', value: 'blue' },
      { label: 'Light-blue', value: 'light-blue' },
      { label: 'Cyan', value: 'cyan' },
      { label: 'Teal', value: 'teal' },
      { label: 'Green', value: 'green' },
      { label: 'Light-green', value: 'light-green' },
      { label: 'Lime', value: 'lime' },
      { label: 'Yellow', value: 'yellow' },
      { label: 'Amber', value: 'amber' },
      { label: 'Orange', value: 'orange' },
      { label: 'Deep-orange', value: 'deep-orange' },
      { label: 'Brown', value: 'brown' },
    ],
    filter: null,
    dashboard: {
      name: 'DashTest',
      showInTenders: false,
      verticalCompact: true,
      items: [
        {
          x: 0,
          y: 0,
          w: 3,
          h: 1,
          i: '456543',
          showHeader: false,
          title: '',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'FILTER',
          facet: 'brands',
          data: {
            multiple: true,
          }
        },
        {
          x: 3,
          y: 0,
          w: 4,
          h: 1,
          i: '32486',
          showHeader: false,
          title: '',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'FILTER',
          facet: 'country',
          data: {
            multiple: true,
          }
        },
        {
          x: 7,
          y: 0,
          w: 3,
          h: 1,
          i: '514365',
          showHeader: false,
          title: '',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'FILTER',
          facet: 'financials',
          data: {
            multiple: true,
          }
        },
        {
          x: 0,
          y: 1,
          w: 6,
          h: 9,
          i: '1',
          showHeader: true,
          title: 'Graph1',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'CHART',
          facet: 'brands',
          facetCountMax: 10,
          chart: {
            chart: {
              type: 'column',
              animation: false,
              backgroundColor: 'transparent',
            },
            title: { text: '' },
            credits: { enabled: false },
            exporting: { enabled: false },
            xAxis: {
              categories: [],
            },
            yAxis: {
              min: 0,
              title: { text: '' },
              stackLabels: {
                enabled: true,
                style: {
                  fontWeight: 'bold',
                  color: 'gray'
                }
              }
            },
            tooltip: {
              headerFormat: '<b>{point.x}</b><br/>',
              pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
            },
            legend: {
              enabled: false,
            },
            plotOptions: {
              column: {
                cursor: 'pointer',
                stacking: 'normal',
                dataLabels: {
                  enabled: true,
                },
              },
              /*
              series: {
                allowPointSelect: true,
                states: {
                  select: {
                    color: null,
                    borderWidth: 3,
                    borderColor: '#323a45'
                  }
                }
              },
              */
            },
            series: [],
          },
        },
        {
          x: 6,
          y: 1,
          w: 4,
          h: 9,
          i: '2',
          showHeader: true,
          title: '',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'CHART',
          facet: 'country',
          facetCountMax: 4,
          chart: {
            chart: {
              type: 'pie',
              animation: true,
              height: 400,
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              backgroundColor: 'transparent',
            },
            title: { text: '' },
            credits: { enabled: false },
            exporting: { enabled: false },
            tooltip: {
              pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
              pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                  enabled: true,
                  format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                }
              },
              series: {
                animation: true,
              }
            },
            series: [],
          },
        },
        {
          x: 0,
          y: 10,
          w: 8,
          h: 10,
          i: '3',
          showHeader: true,
          title: 'Tenders table',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'TABLE',
          subType: 'TENDER',
          table: {
            fixedHeader: true,
            height: 270,
            headers: [
              {
                text: 'Tenders',
                align: 'start',
                sortable: false,
                value: 'title',
              },
              { text: 'CPV', value: 'cpvs' },
              { text: 'Region', value: 'country' },
              { text: 'Country', value: 'country' },
              { text: 'Bid Deadline', value: 'bidDeadline' },
              { text: 'Buyer', value: 'country' },
              { text: 'Brand', value: 'country' },
              { text: 'Segment', value: 'country' },
            ],
            datas: [],
          },
        },
        {
          x: 8,
          y: 10,
          w: 2,
          h: 4,
          i: '4',
          showHeader: true,
          title: '',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'DATA',
          facet: 'brands',
          data: {
            value: '',
            field: 'country',
            processType: 'COUNT',
            unite: '',
            textSize: 3,
            alignHorizontal: 'CENTER',
            alignVertical: 'MIDDLE',
          }
        },
        {
          x: 8,
          y: 14,
          w: 2,
          h: 6,
          i: '5',
          showHeader: true,
          title: '',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'TEXT',
          data: {
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris turpis magna, sagittis nec molestie quis, porta luctus nulla.',
            textSize: 1,
            alignHorizontal: 'LEFT',
            alignVertical: 'TOP',
          }
        },
        {
          x: 0,
          y: 19,
          w: 10,
          h: 14,
          i: '6',
          showHeader: true,
          title: '',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'CHART-MAP',
          subType: 'MAP-BUBBLE',
          chart: {
            chart: {
              map: 'myMapName',
              borderWidth: 0,
              backgroundColor: 'transparent',
            },
            credits: { enabled: false },
            exporting: { enabled: false },
            title: { text: '' },
            subtitle: { text: '' },
            legend: { enabled: false },
            mapNavigation: {
              enabled: true,
              buttonOptions: {
                verticalAlign: 'bottom'
              }
            },
            plotOptions: {
              mapbubble: {
                cursor: 'pointer',
              },
              series: {
                animation: true,
              }
            },
            series: [{
              name: 'Countries',
              color: '#E0E0E0',
              enableMouseTracking: false
            }, {
              type: 'mapbubble',
              name: 'Tenders',
              joinBy: ['hc-a2', 'code'],
              data: [],
              minSize: 4,
              maxSize: '12%',
              tooltip: {
                pointFormat: '{point.name}: {point.z}'
              }
            }]
          }
        },
        {
          x: 0,
          y: 34,
          w: 10,
          h: 14,
          i: '7',
          showHeader: true,
          title: '',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'CHART-MAP',
          subType: 'MAP-AREA',
          chart: {
            chart: {
              map: "myMapName",
              backgroundColor: 'transparent',
            },
            title: { text: '' },
            subtitle: { text: '' },
            credits: { enabled: false },
            exporting: { enabled: false },
            mapNavigation: {
              enabled: true,
              buttonOptions: {
                alignTo: "spacingBox"
              }
            },
            colorAxis: {
              min: 0
            },
            plotOptions: {
              map: {
                cursor: 'pointer',
              },
              series: {
                animation: true,
              }
            },
            series: [
              {
                name: "Tenders",
                states: {
                  hover: {
                    color: "#BADA55"
                  }
                },
                dataLabels: {
                  enabled: true,
                  format: "{point.name}"
                },
                allAreas: false,
                data: []
              }
            ]
          }
        },
      ],
    },
  }),

  computed: {
    ...mapGetters([
      'getUserId',
      'isHeaderShow',
      'getIsMobile',
    ]),

    getHeightMainLayer() {
      let height = this.isHeaderShow ? 114 : 40
      if (this.display === 'EDIT') {
        height += 46
        if (this.inTendersScreen) {
          height += 74
        }
      } else if (this.inTendersScreen) {
        height += 71
      }
      return height
    },

    thereAreResults() {
      return this.searchState.totalResults && this.searchState.totalResults > 0;
    },

    getSelectedItem() {
      return this.dashboard.items.find(a => a.i === this.selectedUuid)
    }
  },

  watch: {
    searchFilter() {
      this.search()
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.resizedAll()
    })
    this.search()
  },

  methods: {
    async search() {
      try {
        this.dataSearch.loading = 0
        const res = await this.$api.post('/Elasticsearch/search', {
          searchRequest: {
            searchInputValue: 'power',
            filter: {
              cpvs: ['Cable'],
            },
            facets: this.facets,
          }
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataSearch.data = res.data
        this.dataSearch.loading = 1
        this.setSearchDatas()
        this.resizedAll()
      } catch (err) {
        this.dataSearch.loading = -1
        this.$api.error(err, this)
      }
    },

    addItem() {
      let maxId = Math.max.apply(0, this.dashboard.items.map(a => parseInt(a.i, 10)))
      maxId = maxId + 1
      const item = {
        x: 0,
        y: 0,
        w: 4,
        h: 4,
        i: `${maxId}`,
        title: '',
        type: '',
        colorHeader: 'blue-grey',
        colorBackground: 'grey',
      }
      this.dashboard.items.push(item)
      this.selectedUuid = item.i
    },

    selectItem(item) {
      if (this.display === 'EDIT') {
        this.selectedUuid = item.i
      } else {
        this.selectedUuid = null
      }
    },

    deleteItem(item) {
      this.dashboard.items = this.dashboard.items.filter(a => a.i !== item.i)
      if (this.selectedUuid === item.i) {
        this.selectedUuid = null
      }
    },

    setSearchDatas() {
      if (!this.dataSearch.data) {
        return
      }

      for (const item of this.dashboard.items) {
        if (item.type === 'CHART') {
          if (
            item.chart.chart.type === 'column'
            && item.facet
          ) {
            item.chart.xAxis.categories = []
            item.chart.series = []
            const facet = this.dataSearch.data.facets[item.facet]
            if (facet && facet.length && facet[0].data && facet[0].data.length) {
              item.chart.series = [{
                name: item.facet,
                data: [],
              }]
              for (const data of facet[0].data) {
                item.chart.xAxis.categories.push(data.value)
                item.chart.series[0].data.push(data.count)
                if (item.chart.xAxis.categories.length >= item.facetCountMax) {
                  break
                }
              }
              item.chart.series[0].events = {
                click: event => {
                  console.log(item)
                  console.log(event.point)
                  console.log(event.point.category)
                  console.log(event.point.series.name)
                  this.openTendersDialog()
                }
              }
            }

          }
          if (
            item.chart.chart.type === 'pie'
            && item.facet
          ) {
            item.chart.series = []
            const facet = this.dataSearch.data.facets[item.facet]
            if (facet && facet.length && facet[0].data && facet[0].data.length) {
              item.chart.series = [{
                name: item.facet,
                colorByPoint: true,
                data: [],
              }]
              for (const data of facet[0].data) {
                item.chart.series[0].data.push({
                  name: data.value,
                  y: data.count,
                  sliced: false,
                  selected: false,
                })
                if (item.chart.series[0].data.length >= item.facetCountMax) {
                  break
                }
              }
              item.chart.series[0].events = {
                click: event => {
                  console.log(item)
                  console.log(event.point)
                  console.log(event.point.category)
                  console.log(event.point.series.name)
                  this.openTendersDialog()
                }
              }
            }
          }
        } else if (
          item.type === 'CHART-MAP'
          && item.subType === 'MAP-BUBBLE'
        ) {
          item.chart.series[1].data = []
          const facet = this.dataSearch.data.facets.country
          if (facet && facet.length && facet[0].data && facet[0].data.length) {
            for (const data of facet[0].data) {
              item.chart.series[1].data.push({
                name: data.value,
                code: this.getCoutryCode(data.value),
                z: data.count,
              })
            }
          }
          item.chart.series[1].events = {
            click: event => {
              console.log(item)
              console.log(event.point)
              console.log(event.point.category)
              console.log(event.point.series.name)
              this.openTendersDialog()
            }
          }
        } else if (
          item.type === 'CHART-MAP'
          && item.subType === 'MAP-AREA'
        ) {
          for (let data of item.chart.series[0].data) {
            data[1] = 0
          }
          item.chart.series[0].data = null
          const mapData = JSON.parse(JSON.stringify(this.constCountryMap))
          const facet = this.dataSearch.data.facets.country
          if (facet && facet.length && facet[0].data && facet[0].data.length) {
            for (const data of facet[0].data) {
              const coutryCode = this.getCoutryCode(data.value).toLowerCase()
              if (coutryCode) {
                const datafound = mapData.find(a => a[0] === coutryCode)
                if (datafound) {
                  datafound[1] = data.count
                }
              }
            }
          }
          item.chart.series[0].data = mapData
          item.chart.series[0].events = {
            click: event => {
              console.log(item)
              console.log(event.point)
              console.log(event.point.category)
              console.log(event.point.series.name)
              this.openTendersDialog()
            }
          }
        } else if (
          item.type === 'TABLE'
          && item.subType === 'TENDER'
        ) {
          item.table.datas = []
          for (const result of this.dataSearch.data.results) {
            item.table.datas.push({
              title: result.title.raw.length > 40 ? `${result.title.raw.substr(0, 40)}...` : result.title.raw,
              country: result.country.raw,
              cpvs: result.cpvs.raw.join().length > 20 ? `${result.cpvs.raw.join().substr(0, 20)}...` : result.cpvs.raw.join(),
              description: result.description.raw,
              bidDeadline: moment(result.bid_deadline_timestamp.raw).format("MM/DD/YYYY"),
              publication: moment(result.publication_timestamp.raw).format("MM/DD/YYYY"),
            })
          }
        } else if (
          item.type === 'DATA'
        ) {
          item.data.value = ''
          if (item.facet) {
            const facet = this.dataSearch.data.facets[item.facet]
            if (facet && facet.length && facet[0].data && facet[0].data.length) {
              item.data.value = 0
              if (item.data.processType === 'COUNT') {
                item.data.value = facet[0].data.length
              } else if (item.data.processType === 'SUM') {
                for (const data of facet[0].data) {
                  item.data.value = item.data.value + data.count
                }
              } else if (item.data.processType === 'AVERAGE') {
                for (const data of facet[0].data) {
                  item.data.value = item.data.value + data.count
                }
                item.data.value = Math.round(item.data.value / facet[0].data.length)
              }
            }
          }
        }
      }
    },

    resizedAll() {
      for (const item of this.dashboard.items) {
        this.resizedEvent(item)
      }
    },

    resizedEvent(item) {
      if (item.subType === 'MAP-BUBBLE') {
        item.chart.chart.height = 35 * item.h + 24 + (item.showHeader ? 0 : 32)
      } else if (item.subType === 'MAP-AREA') {
        item.chart.chart.height = 35 * item.h + 34 + (item.showHeader ? 0 : 32)
        console.log(item)
      } else if (item.type === 'CHART') {
        item.chart.chart.height = 35 * item.h + (item.showHeader ? 0 : 32)
      } else if (item.type === 'TABLE') {
        item.table.height = (35 * item.h) - 60 + (item.showHeader ? 0 : 32)
      }
    },

    getCoutryCode(coutryName) {
      const coutry = this.constCountrys.find(a => a.name === coutryName)
      if (coutry) {
        return coutry.code
      }

      return ''
    },

    openTender(result) {
      this.$refs.TenderDialog.show(result)
    },

    openTendersDialog() {
      this.$refs.TendersDialog.show(this.facets)
    },
  }
}
</script>

<style>
@media screen and (max-width: 1500px) {
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    grid-gap: 0px 0px;
  }
}
@media screen and (min-width: 1500px) {
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 500px;
    grid-gap: 0px 0px;
  }
}
</style>