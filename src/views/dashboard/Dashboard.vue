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
              <v-icon>fa-chart-line</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Line</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="addItem()">
            <v-list-item-icon>
              <v-icon>fa-chart-area</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Area</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
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
                @filterChange="itemFilterChange(item, $event)"
                @openTender="openTender($event)"
                :ref="`ItemCard${item.i}`"
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
                <!-- FILTER -->
                <div
                  v-if="getSelectedItem.type === 'FILTER'"
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
                <!-- TABLE -->
                <div v-else-if="getSelectedItem.type === 'TABLE'">
                  <v-divider class="mt-2" />
                  <div class="pt-3">
                    <div class="grey--text">Data source</div>
                    <v-radio-group
                      v-model="getSelectedItem.subType"
                      row
                    >
                      <v-radio
                        label="Tender"
                        value="TENDER"
                      ></v-radio>
                      <v-radio
                        label="Facet"
                        value="FACET"
                      ></v-radio>
                    </v-radio-group>
                    <div v-if="getSelectedItem.subType === 'TENDER'">
                      <v-simple-table dense class="grey lighten-4">
                        <template v-slot:default>
                          <thead>
                            <tr class="grey lighten-3">
                              <th class="text-left">
                                Field
                              </th>
                              <th class="text-left">
                                Visible
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(facet, index) in Object.keys(facets)"
                              :key="`facet${index}`"
                            >
                              <td>
                                {{ $global.facetLabel(facet) }}
                              </td>
                              <td>
                                <v-switch
                                  :input-value="getSelectedItem.data.fields.find(a => a.facet === facet) ? true : false"
                                  @click="itemTableSwitch(getSelectedItem, facet)"
                                  dense
                                  hide-details
                                />
                              </td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                    </div>
                    <div v-else-if="getSelectedItem.subType === 'FACET'">
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
                            v-for="(facet, index) in Object.keys(facets)"
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
                  <v-divider class="mt-2" />
                  <v-switch
                    v-model="getSelectedItem.data.showHeader"
                    :label="`Table header`"
                    dense
                    hide-details
                  />
                  <v-switch
                    v-if="getSelectedItem.data.showHeader"
                    v-model="getSelectedItem.data.fixedHeader"
                    :label="`Fixed header`"
                    dense
                    hide-details
                  />
                  <v-switch
                    v-model="getSelectedItem.data.showFooter"
                    :label="`Table footer`"
                    @change="resizedEvent(getSelectedItem)"
                    dense
                    hide-details
                  />
                </div>
                <!-- DATA -->
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
                <!-- TEXT -->
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
                <!-- CHART -->
                <div
                  v-else-if="getSelectedItem.type === 'CHART'"
                  class="pa-3"
                >
                  <div v-if="['LINE', 'AREA', 'COLUMN', 'PIE'].includes(getSelectedItem.subType)">
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
                      <itemDataChoice
                        v-if="1 === 2"
                        :item="getSelectedItem"
                        :facets="facets"
                      />
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
                    <div v-if="['COLUMN'].includes(getSelectedItem.subType)">
                      <div class="grey--text">Display type</div>
                      <v-btn-toggle
                        v-model="getSelectedItem.chart.chart.type"
                        borderless
                        color="blue-grey"
                      >
                        <v-btn value="column">
                          <span class="hidden-sm-and-down">Vertical</span>
                        </v-btn>

                        <v-btn value="bar">
                          <span class="hidden-sm-and-down">Horizontal</span>
                        </v-btn>
                      </v-btn-toggle>
                    </div>
                    <div v-else-if="['PIE'].includes(getSelectedItem.subType)">
                      <v-switch
                        v-model="getSelectedItem.chart.plotOptions.pie.dataLabels.enabled"
                        :label="`Data labels: ${getSelectedItem.chart.plotOptions.pie.dataLabels.enabled.toString()}`"
                        class="pa-0 ma-0"
                      />
                    </div>
                  </div>
                </div>
                <!-- CHART-MAP -->
                <div
                  v-else-if="getSelectedItem.type === 'CHART-MAP'"
                  class="pa-3"
                >
                  <v-divider class="mt-2" />

                  <v-switch
                    v-model="getSelectedItem.chart.mapNavigation.enabled"
                    :label="`Map zoom`"
                    dense
                    hide-details
                  />

                  <div class="pt-3">
                    <v-btn
                      @click="cartMapSavePosition(getSelectedItem)"
                      :class="getSelectedItem.data.position ? 'blue-grey lighten-4' : ''"
                    >
                      <v-icon
                        small
                        :class="getSelectedItem.data.position ? 'green--text' : 'blue-grey--text'"
                        class="mr-2"
                      >
                        fa-map-marker-alt
                      </v-icon>
                      Save position
                    </v-btn>

                    <v-btn
                      @click="getSelectedItem.data.position = null"
                      :disabled="!getSelectedItem.data.position"
                      title="Reset position"
                    >
                      <v-icon color="red">fa-times</v-icon>
                    </v-btn>
                  </div>
                </div>

                <v-divider class="mt-2" />

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
            <TendersPreview
              :display="display"
              :dashboard="dashboard"
              :dataSearch="dataSearch"
              :searchFilter="searchFilter"
              @updateDisplay="display = $event"
              @search="search()"
              @openTender="openTender($event)"
              @searchInputValueRemove="searchInputValueRemove()"
              @facetItemRemove="facetItemRemove($event)"
            />
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
import ItemCard from '@/views/dashboard/components/items/ItemCard'
import TendersDialog from '@/views/dashboard/components/TendersDialog'
import TenderDialog from '@/views/tender/components/TenderDialog'
import TendersPreview from '@/views/dashboard/components/TendersPreview'
import itemDataChoice from '@/views/dashboard/components/itemDataChoice'

export default {
  name: 'Dashboard',

  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    ItemCard,
    TendersDialog,
    TenderDialog,
    TendersPreview,
    itemDataChoice,
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
      cpvs: {
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
    itemFilters: [],
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
          facet: 'cpvs',
          data: {
            isDataEmpty: true,
            multiple: true,
          },
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
            isDataEmpty: true,
            multiple: true,
          },
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
            isDataEmpty: true,
            multiple: true,
          },
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
          subType: 'COLUMN',
          facet: 'notice_type',
          facetCountMax: 10,
          data: {
            isDataEmpty: true,
          },
          chart: {
            chart: {
              type: 'bar',
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
          subType: 'PIE',
          facet: 'country',
          facetCountMax: 4,
          data: {
            isDataEmpty: true,
          },
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
          data: {
            isDataEmpty: true,
            showHeader: true,
            fixedHeader: true,
            showFooter: true,
            itemsPerPage: 10,
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
            fields: [
              {
                facet:"brands"
              }, {
                facet:"buyer_name"
              }
            ],
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
            isDataEmpty: true,
            value: '',
            field: 'country',
            processType: 'COUNT',
            unite: '',
            textSize: 3,
            alignHorizontal: 'CENTER',
            alignVertical: 'MIDDLE',
          },
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
            isDataEmpty: true,
            value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris turpis magna, sagittis nec molestie quis, porta luctus nulla.',
            textSize: 1,
            alignHorizontal: 'LEFT',
            alignVertical: 'TOP',
          },
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
          data: {
            isDataEmpty: true,
            position: null,
          },
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
          },
        },
        {
          x: 0,
          y: 34,
          w: 3,
          h: 10,
          i: '6315876444',
          showHeader: false,
          title: 'Tenders table',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'TABLE',
          subType: 'FACET',
          facet: 'country',
          data: {
            isDataEmpty: true,
            showHeader: true,
            fixedHeader: true,
            showFooter: false,
            itemsPerPage: -1,
            height: 270,
            headers: [],
            datas: [],
          },
        },
        {
          x: 3,
          y: 34,
          w: 7,
          h: 10,
          i: '7',
          showHeader: false,
          title: '',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'CHART-MAP',
          subType: 'MAP-AREA',
          data: {
            isDataEmpty: true,
            position: {
              min0: 2756.0964594698826,
              max0: 6544.391919986773,
              min1: -8922.811359029376,
              max1: -7547.168886534403,
            },
          },
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
          },
        },
        {
          x: 0,
          y: 44,
          w: 10,
          h: 10,
          i: '46872222',
          showHeader: true,
          title: '',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'CHART',
          subType: 'LINE',
          facet: 'notice_type',
          facetCountMax: 10,
          data: {
            isDataEmpty: true,
          },
          chart: {
            chart: {
              type: 'line',
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
            },
            series: [],
          },
        },
        {
          x: 0,
          y: 54,
          w: 6,
          h: 11,
          i: '1166852',
          showHeader: true,
          title: '',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'CHART',
          subType: 'AREA',
          facet: 'buyer_name',
          facetCountMax: 4,
          data: {
            isDataEmpty: true,
          },
          chart: {
            chart: {
              type: 'area',
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
            },
            series: [],
          },
        },
        {
          x: 6,
          y: 54,
          w: 4,
          h: 11,
          i: '8855443322',
          showHeader: true,
          title: 'Graph1',
          colorHeader: 'blue-grey',
          colorBackground: 'grey',
          type: 'CHART',
          subType: 'COLUMN',
          facet: 'notice_type',
          facetCountMax: 3,
          data: {
            isDataEmpty: true,
          },
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
            },
            series: [],
          },
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
        let searchRequest = {
          searchInputValue: '',
          filter: {},
          facets: this.facets,
        }
        if (this.searchFilter) {
          searchRequest.searchInputValue = this.searchFilter.searchInputValue
          searchRequest.filter = JSON.parse(JSON.stringify(this.searchFilter.facets))
        }
        for (const itemFilter of this.itemFilters) {
          if (!searchRequest.filter[itemFilter.item.facet]) {
            searchRequest.filter[itemFilter.item.facet] = []
          }
          for (const selectedItem of itemFilter.selectedItems) {
            if (!searchRequest.filter[itemFilter.item.facet].includes(selectedItem.value)) {
              searchRequest.filter[itemFilter.item.facet].push(selectedItem.value)
            }
          }
        }
        const res = await this.$api.post('/Elasticsearch/search', { searchRequest })
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
        showHeader: true,
        title: '',
        type: '',
        subType: '',
        colorHeader: 'blue-grey',
        colorBackground: 'grey',
        data: {
          isDataEmpty: true,
        },
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
        this.setSearchData(item)
      }
    },

    setSearchData(item) {
      if (item.type === 'CHART') {
        this.setSearchDataChart(item)
      } else if (item.type === 'CHART-MAP') {
        this.setSearchDataChartMap(item)
      } else if (item.type === 'TABLE') {
        this.setSearchDataTable(item)
      } else if (item.type === 'DATA') {
        this.setSearchDataData(item)
      }
    },

    setSearchDataChart(item) {
      item.data.isDataEmpty = true
      if (
        ['LINE', 'AREA', 'COLUMN'].includes(item.subType)
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
          item.data.isDataEmpty = false
        }
      }
      if (
        ['PIE'].includes(item.subType)
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
          item.data.isDataEmpty = false
        }
      }
    },

    setSearchDataChartMap(item) {
      item.data.isDataEmpty = true
      if (item.subType === 'MAP-BUBBLE') {
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
          item.data.isDataEmpty = false
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
      } else if (item.subType === 'MAP-AREA') {
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
          item.data.isDataEmpty = false
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
      }
      if (item.data.position) {
        this.$nextTick(() => {
          const ItemCard = this.$refs[`ItemCard${item.i}`][0]
          const mapChart = ItemCard.$refs[`ChartMap${item.i}`].chart
          const extremes0 = mapChart.axes[0].getExtremes()
          let zoom = (item.data.position.max0 - item.data.position.min0) / (extremes0.dataMax - extremes0.dataMin)
          mapChart.mapZoom(Math.abs(zoom))
          mapChart.axes[0].setExtremes(item.data.position.min0, item.data.position.max0)
          mapChart.axes[1].setExtremes(item.data.position.min1, item.data.position.max1)
        })
      }
    },

    setSearchDataTable(item) {
      if (item.subType === 'TENDER') {
        item.data.isDataEmpty = true
        item.data.datas = []
        for (const result of this.dataSearch.data.results) {
          item.data.datas.push({
            title: result.title.raw.length > 40 ? `${result.title.raw.substr(0, 40)}...` : result.title.raw,
            country: result.country.raw,
            cpvs: result.cpvs.raw.join().length > 20 ? `${result.cpvs.raw.join().substr(0, 20)}...` : result.cpvs.raw.join(),
            description: result.description.raw,
            bidDeadline: moment(result.bid_deadline_timestamp.raw).format("MM/DD/YYYY"),
            publication: moment(result.publication_timestamp.raw).format("MM/DD/YYYY"),
          })
          item.data.isDataEmpty = false
        }
      } else if (item.subType === 'FACET') {
        item.data.isDataEmpty = true
        item.data.headers = [
          {
            text: !item.showHeader ? this.$global.facetLabel(item.facet) : '',
            align: 'start',
            sortable: false,
            value: 'label',
          },
          {
            text: 'Count',
            align: 'end',
            sortable: true,
            value: 'count',
          },
        ]
        if (!item.data.showFooter) {
          item.data.itemsPerPage = -1
        }
        item.data.datas = []
        if (item.facet) {
          const facet = this.dataSearch.data.facets[item.facet]
          if (facet && facet.length && facet[0].data && facet[0].data.length) {
            for (const data of facet[0].data) {
              item.data.datas.push({
                label: data.value,
                count: data.count,
              })
            }
          }
          item.data.isDataEmpty = false
        }
      }
    },

    setSearchDataData(item) {
      item.data.isDataEmpty = true
      item.data.value = ''
      if (item.facet) {
        const facet = this.dataSearch.data.facets[item.facet]
        if (facet && facet.length && facet[0].data && facet[0].data.length) {
          item.data.value = 0
          if (item.data.processType === 'COUNT') {
            item.data.value = facet[0].data.length
            item.data.isDataEmpty = false
          } else if (item.data.processType === 'SUM') {
            for (const data of facet[0].data) {
              item.data.value = item.data.value + data.count
              item.data.isDataEmpty = false
            }
          } else if (item.data.processType === 'AVERAGE') {
            for (const data of facet[0].data) {
              item.data.value = item.data.value + data.count
            }
            item.data.value = Math.round(item.data.value / facet[0].data.length)
            item.data.isDataEmpty = false
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
        item.chart.chart.height = 35 * item.h + 24 + (item.showHeader ? 0 : 32)
      } else if (item.type === 'CHART') {
        item.chart.chart.height = 35 * item.h + (item.showHeader ? 0 : 32)
      } else if (item.type === 'TABLE') {
        item.data.height = (35 * item.h) - 52 + (item.showHeader ? 0 : 32)
        if (!item.data.showFooter) {
          item.data.height = item.data.height + 60
        }
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

    cartMapSavePosition(item) {
      item.data.position = {}

      const ItemCard = this.$refs[`ItemCard${item.i}`][0]
      const mapChart = ItemCard.$refs[`ChartMap${item.i}`].chart
      const extremes0 = mapChart.axes[0].getExtremes()
      item.data.position.min0 = extremes0.min
      item.data.position.max0 = extremes0.max
      const extremes1 = mapChart.axes[1].getExtremes()
      item.data.position.min1 = extremes1.min
      item.data.position.max1 = extremes1.max
    },

    itemTableSwitch(item, facet) {
      if (!item.data.fields) {
        item.data.fields = []
      }
      if (!item.data.fields.find(a => a.facet === facet)) {
        item.data.fields.push({
          facet,
        })
      } else {
        item.data.fields = item.data.fields.filter(a => a.facet !== facet)
      }
    },

    searchInputValueRemove() {
      this.$emit('searchInputValueRemove')
    },

    facetItemRemove(event) {
      this.$emit('facetItemRemove', event)
    },

    itemFilterChange(item, selectedItems) {
      let itemFilter = this.itemFilters.find(a => a.item.i === item.i)
      if (itemFilter) {
        itemFilter.item = item
        itemFilter.selectedItems = selectedItems
      } else {
        this.itemFilters.push({
          item,
          selectedItems,
        })
      }
      this.search()
    }
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