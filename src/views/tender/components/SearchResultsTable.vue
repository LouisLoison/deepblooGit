<template>
  <div
    @click="
      getIsPremiumMembership
        ? showInsufficientRightDialog()
        : null
    "
  >
    <div
      style="overflow: auto; width: 100%; max-width: 100%; display: grid;"
      :style="
        getIsPremiumMembership
          ? 'pointer-events: none; opacity: 0.5;'
          : ''
      "
    >
      <div
        class="font-weight-bold display-table-row px-0"
        style="border-bottom: 1px solid #78909c; margin-bottom: 14px; color: #3d4872; background-color: #fafafa; padding-top: 6px;"
      >
        <div
          class="display-table-head display-table-cell-option"
          style="overflow: visible;"
        >
          <v-menu
            transition="slide-y-transition"
            max-height="400"
            offset-y
            right
          >
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" class="ma-0 pa-0" @click.stop>
                <v-icon size="16">fa-bars</v-icon>
              </v-btn>
            </template>

            <v-list class="list-icon">
              <v-list-item
                v-for="(column, index) in columns"
                :key="`column${index}`"
              >
                <v-list-item-action
                  @click.stop="updateUserScreen()"
                  class="mt-3"
                >
                  <v-checkbox v-model="column.show" class="ma-0" />
                </v-list-item-action>
                <v-list-item-title
                  @click.stop="
                    column.show = !column.show;
                    updateUserScreen();
                  "
                >
                  {{ column.title }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <div class="display-table-head display-table-cell-avatar" />
        <div class="display-table-head display-table-cell-title">
          Title
        </div>
        <div
          v-for="(column, index) in columns.filter(a => a.show)"
          :key="`column${index}`"
          class="display-table-head display-table-cell-standard"
        >
          <div
            v-if="
              [
                'cpv',
                'country',
                'notice_type',
                'buyer_name',
                'bid_deadline',
                'publication_date',
                'scope_of_work',
                'segment',
                'brand',
                'financial',
                'contract_types',
                'procurement_method',
                'currency',
                'power',
                'voltage',
              ].includes(column.property)
            "
          >
            <v-menu
              v-model="column.menu"
              :close-on-content-click="false"
              :nudge-width="200"
              offset-y
            >
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" text small color="indigo darken-4">
                  <v-icon
                    text
                    class="pr-1"
                    :class="1 === 1 ? 'grey--text' : ''"
                    size="10"
                  >
                    fa fa-filter
                  </v-icon>
                  {{ column.title }}
                </v-btn>
              </template>

              <v-card class="pa-3">
                <SearchFacetRegion
                  v-if="column.property === 'region' && filter.region_lvl1 && searchState.facets  && searchState.facets.region_lvl1"
                  :region_lvl0="filter.region_lvl0"
                  :region_lvl1="filter.region_lvl1"
                  @filterChange="facetRegionChange($event, 'region_lvl1')"
                />

                <SearchFacet
                  v-if="column.property === 'bid_deadline' && filter.bid_deadline_timestamp && searchState.facets  && searchState.facets.bid_deadline_timestamp"
                  :checked="filter.bid_deadline_timestamp"
                  :facet="searchState.facets.bid_deadline_timestamp[0]"
                  @change="handleFacetChange($event, 'bid_deadline_timestamp')"
                  @checkAll="handleFacetCheckAll('bid_deadline_timestamp')"
                  @unCheckAll="handleFacetUnCheckAll('bid_deadline_timestamp')"
                />

                <SearchFacet
                  v-if="column.property === 'country' && filter.country && searchState.facets  && searchState.facets.country"
                  :checked="filter.country"
                  :facet="searchState.facets.country[0]"
                  @change="handleFacetChange($event, 'country')"
                  @checkAll="handleFacetCheckAll('country')"
                  @unCheckAll="handleFacetUnCheckAll('country')"
                />

                <SearchFacet
                  v-if="column.property === 'cpv' && filter.cpvs && searchState.facets  && searchState.facets.cpvs"
                  :checked="filter.cpvs"
                  :facet="searchState.facets.cpvs[0]"
                  @change="handleFacetChange($event, 'cpvs')"
                  @checkAll="handleFacetCheckAll('cpvs')"
                  @unCheckAll="handleFacetUnCheckAll('cpvs')"
                />

                <SearchFacet
                  v-if="column.property === 'notice_type' && filter.notice_type && searchState.facets  && searchState.facets.notice_type"
                  :checked="filter.notice_type"
                  :facet="searchState.facets.notice_type[0]"
                  @change="handleFacetChange($event, 'notice_type')"
                  @checkAll="handleFacetCheckAll('notice_type')"
                  @unCheckAll="handleFacetUnCheckAll('notice_type')"
                />

                <SearchFacet
                  v-if="column.property === 'publication_date' && filter.publication_timestamp && searchState.facets  && searchState.facets.publication_timestamp"
                  :checked="filter.publication_timestamp"
                  :facet="searchState.facets.publication_timestamp[0]"
                  @change="handleFacetChange($event, 'publication_timestamp')"
                  @checkAll="handleFacetCheckAll('publication_timestamp')"
                  @unCheckAll="handleFacetUnCheckAll('publication_timestamp')"
                />

                <SearchFacet
                  v-if="column.property === 'procurement_method' && filter.procurement_method && searchState.facets  && searchState.facets.procurement_method"
                  :checked="filter.procurement_method"
                  :facet="searchState.facets.procurement_method[0]"
                  @change="handleFacetChange($event, 'procurement_method')"
                  @checkAll="handleFacetCheckAll('procurement_method')"
                  @unCheckAll="handleFacetUnCheckAll('procurement_method')"
                />

                <SearchFacet
                  v-if="column.property === 'lang' && filter.lang && searchState.facets  && searchState.facets.lang"
                  :checked="filter.lang"
                  :facet="searchState.facets.lang[0]"
                  @change="handleFacetChange($event, 'lang')"
                  @checkAll="handleFacetCheckAll('lang')"
                  @unCheckAll="handleFacetUnCheckAll('lang')"
                />

                <SearchFacet
                  v-if="column.property === 'scope_of_work' && filter.scope_of_works && searchState.facets  && searchState.facets.scope_of_works"
                  :checked="filter.scope_of_works"
                  :facet="searchState.facets.scope_of_works[0]"
                  @change="handleFacetChange($event, 'scope_of_works')"
                  @checkAll="handleFacetCheckAll('scope_of_works')"
                  @unCheckAll="handleFacetUnCheckAll('scope_of_works')"
                />

                <SearchFacet
                  v-if="column.property === 'segment' && filter.segments && searchState.facets  && searchState.facets.segments"
                  :checked="filter.segments"
                  :facet="searchState.facets.segments[0]"
                  @change="handleFacetChange($event, 'segments')"
                  @checkAll="handleFacetCheckAll('segments')"
                  @unCheckAll="handleFacetUnCheckAll('segments')"
                />

                <SearchFacet
                  v-if="column.property === 'designs' && filter.designs && searchState.facets  && searchState.facets.designs"
                  :checked="filter.designs"
                  :facet="searchState.facets.designs[0]"
                  @change="handleFacetChange($event, 'designs')"
                  @checkAll="handleFacetCheckAll('designs')"
                  @unCheckAll="handleFacetUnCheckAll('designs')"
                />

                <SearchFacet
                  v-if="column.property === 'contract_types' && filter.contract_types && searchState.facets  && searchState.facets.contract_types"
                  :checked="filter.contract_types"
                  :facet="searchState.facets.contract_types[0]"
                  @change="handleFacetChange($event, 'contract_types')"
                  @checkAll="handleFacetCheckAll('contract_types')"
                  @unCheckAll="handleFacetUnCheckAll('contract_types')"
                />

                <SearchFacet
                  v-if="column.property === 'brand' && filter.brands && searchState.facets  && searchState.facets.brands"
                  :checked="filter.brands"
                  :facet="searchState.facets.brands[0]"
                  @change="handleFacetChange($event, 'brands')"
                  @checkAll="handleFacetCheckAll('brands')"
                  @unCheckAll="handleFacetUnCheckAll('brands')"
                />

                <SearchFacet
                  v-if="column.property === 'financial' && filter.financials && searchState.facets  && searchState.facets.financials"
                  :checked="filter.financials"
                  :facet="searchState.facets.financials[0]"
                  @change="handleFacetChange($event, 'financials')"
                  @checkAll="handleFacetCheckAll('financials')"
                  @unCheckAll="handleFacetUnCheckAll('financials')"
                />

                <SearchFacet
                  v-if="column.property === 'currency' && filter.currency && searchState.facets  && searchState.facets.currency"
                  :checked="filter.currency"
                  :facet="searchState.facets.currency[0]"
                  @change="handleFacetChange($event, 'currency')"
                  @checkAll="handleFacetCheckAll('currency')"
                  @unCheckAll="handleFacetUnCheckAll('currency')"
                />

                <SearchFacet
                  v-if="column.property === 'buyer_name' && filter.buyer_name && searchState.facets  && searchState.facets.buyer_name"
                  :checked="filter.buyer_name"
                  :facet="searchState.facets.buyer_name[0]"
                  @change="handleFacetChange($event, 'buyer_name')"
                  @checkAll="handleFacetCheckAll('buyer_name')"
                  @unCheckAll="handleFacetUnCheckAll('buyer_name')"
                />

                <SearchFacet
                  v-if="column.property === 'power' && filter.power && searchState.facets  && searchState.facets.power"
                  :checked="filter.power"
                  :facet="searchState.facets.power[0]"
                  @change="handleFacetChange($event, 'power')"
                  @checkAll="handleFacetCheckAll('power')"
                  @unCheckAll="handleFacetUnCheckAll('power')"
                />

                <SearchFacet
                  v-if="column.property === 'voltage' && filter.voltage && searchState.facets  && searchState.facets.voltage"
                  :checked="filter.voltage"
                  :facet="searchState.facets.voltage[0]"
                  @change="handleFacetChange($event, 'voltage')"
                  @checkAll="handleFacetCheckAll('voltage')"
                  @unCheckAll="handleFacetUnCheckAll('voltage')"
                />
              </v-card>
            </v-menu>
          </div>
          <div v-else>
            {{ column.title }}
          </div>
        </div>
      </div>
      <div v-if="results && results.length > 0">
        <div
          v-for="result in results"
          :key="result.id.raw"
          style="display: flex;"
        >
          <div
            class="cursor-pointer display-table-row pt-2 pb-1 px-0"
            style="border-bottom: 1px solid #d7d7d7;"
            @click.stop="$emit('tenderDialogShow', result)"
          >
            <div
              class="display-table-cell display-table-cell-option"
              style="overflow: visible;"
            >
              <v-menu transition="slide-y-transition" offset-y right>
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    v-on="on"
                    class="ma-0 pa-0"
                    @click.stop
                  >
                    <v-icon size="16">
                      fa-ellipsis-v
                    </v-icon>
                  </v-btn>
                </template>

                <v-list class="list-icon">
                  <v-list-item
                    @click="openTenderGroupChoice(result)"
                  >
                    <v-list-item-avatar>
                      <v-icon
                        color="blue-grey"
                        text
                      >
                        fa fa-circle
                      </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>
                      Assign to business pipeline
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    @click="openSentEmailDialog(result)"
                  >
                    <v-list-item-avatar>
                      <v-icon
                        color="blue-grey"
                        text
                      >
                        fa-bell
                      </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>
                      Notify
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    :to="{
                      name: 'TenderAdd',
                      params: { tender: result }
                    }"
                  >
                    <v-list-item-avatar>
                      <v-icon
                        color="blue-grey"
                        text
                      >
                        fa-copy
                      </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>
                      Duplicate
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    @click="sendToSalesforce(result)"
                  >
                    <v-list-item-avatar>
                      <v-icon
                        color="blue-grey"
                        text
                      >
                        fa-cloud
                      </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>
                      Send to salesforce
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
            <div
              class="display-table-cell display-table-cell-avatar"
              style="position: relative;"
            >
              <img
                :src="getCpvsLogoFromLabel(result.cpvs.raw)"
                alt="avatar"
                style="height: 32px;"
                :title="`${result.cpvs.raw} | ${getCpvsLogoFromLabel(result.cpvs.raw)}`"
              />
              <div
                v-if="getDataTenderGroups && getDataTenderGroups.loading === 1"
                style="display: inline-block; position: absolute; left: 12px; bottom: 0px;"
              >
                <div v-if="!tenderGroups(result)">
                  <v-btn
                    @click.stop="openTenderGroupChoice(result)"
                    text
                    icon
                    small
                    class="blue-grey--text text--lighten-4"
                    style="height: 16px; width: 16px; margin: 0px; background-color: #ffffff !important;"
                    title="Add tender to a business pipeline"
                  >
                    <v-icon size="14">fa-circle</v-icon>
                  </v-btn>
                </div>
                <div v-else>
                  <v-btn
                    v-for="(tenderGroup, indexSelect) in tenderGroups(result)"
                    :key="`tenderGroup${indexSelect}`"
                    @click.stop="openTenderGroupChoice(result)"
                    text
                    icon
                    small
                    style="height: 16px; width: 16px; margin: 0px; background-color: #ffffff !important;"
                    :title="tenderGroup.label"
                  >
                    <v-icon
                      :style="
                        `font-size: 16px; color:${
                          tenderGroup.color
                        };`
                      "
                    >
                      fa-circle
                    </v-icon>
                  </v-btn>
                </div>
              </div>
              <img
                v-if="
                  result.creation_timestamp &&
                  result.creation_timestamp.raw &&
                  now_timestamp &&
                  result.creation_timestamp.raw > now_timestamp
                "
                title="Tender add this day"
                src="/static/image/badgeNew.png"
                style="height: 24px; position: absolute; bottom: 2px; right: 2px;"
              />
              <div
                v-if="getUserType === 1 && result.datasource && result.datasource.raw === 'tenderinfo'"
                style="position: absolute; top: 2px; right: 8px; display: inline-block; background-color: #2196f3; color: #ffffff; border-radius: 100px; font-size: 10px; width: 14px;"
              >
                TI
              </div>
            </div>
            <div
              class="display-table-cell display-table-cell-title font-weight-bold snippet-zone"
              style="text-overflow: ellipsis; overflow: hidden;"
              v-html="result.title.snippet || result.title.raw"
            />
            <div
              v-for="(column, index) in columns.filter(a => a.show)"
              :key="`column${index}`"
              class="display-table-cell display-table-cell-standard caption"
            >
              <div v-if="column.property === 'buyer' && result.buyer && result.buyer.raw">
                <div
                  style="text-overflow: ellipsis; overflow: hidden;"
                  :style="
                    getIsPremiumMembership ||
                    getIsBusinessMembership ||
                    getIsFreeMembership
                      ? 'height: 42px;'
                      : 'height: 21px;'
                  "
                >
                  {{
                    getIsPremiumMembership ||
                    getIsBusinessMembership ||
                    getIsFreeMembership
                      ? result.buyer.raw.name
                      : `${result.buyer.raw.name.substring(0, 5)}...`
                  }}
                </div>
              </div>
              <div
                v-else-if="column.property === 'cpv' && result.cpvs && result.cpvs.raw"
                style="position: relative;"
                :title="result.cpvs.raw.join(', ')"
              >
                <div v-if="result.cpvs && result.cpvs.raw">
                  <div
                    v-for="(cpv, cpvIndex) of result.cpvs.raw"
                    :key="`cpvIndex${cpvIndex}`"
                    style="overflow: hidden; white-space: nowrap;"
                  >
                    <v-avatar class="ml-2" size="18">
                      <img :src="getCpvsLogoFromLabel(cpv)" alt="" />
                    </v-avatar>
                    {{ cpv }}
                  </div>
                </div>
                <div
                  v-if="
                    result.cpvs.raw &&
                    result.cpvs.raw.length > 2
                  "
                  class="blue-grey--text"
                  style="position: absolute; top: 18px; right: 0px; background-color: #dfe2ee; padding: 0px 4px; border-radius: 8px; border: 3px solid #ffffff;"
                >
                  +{{ result.cpvs.raw.length - 2 }} more
                </div>
              </div>
              <div
                v-else-if="column.property === 'bid_deadline' && result.bid_deadline_timestamp && result.bid_deadline_timestamp.raw"
                class="text-center"
              >
                <div v-if="result.bid_deadline_timestamp && result.bid_deadline_timestamp.raw">
                  {{ moment(result.bid_deadline_timestamp.raw).format("MM/DD/YYYY") }}
                </div>
              </div>
              <div
                v-else-if="column.property === 'publication_date' && result.publication_date && result.publication_date.raw"
                class="text-center"
              >
                <div v-if="result.publication_date && result.publication_date.raw">
                  {{ moment(result.publication_date.raw).format("MM/DD/YYYY") }}
                </div>
              </div>
              <div
                v-else-if="column.property === 'region' && result.region_lvl0 && result.region_lvl0.raw"
                class="text-center"
              >
                <div v-if="result.region_lvl0 && result.region_lvl0.raw">
                  {{
                    result.region_lvl0.raw && result.region_lvl0.raw.length
                      ? result.region_lvl0.raw[0]
                      : ''
                  }}
                </div>
              </div>
              <div
                v-else-if="column.property === 'scope_of_work' && result.scope_of_works && result.scope_of_works.raw"
                style="position: relative;"
                :title="
                  result && result.scope_of_works.raw
                    ? result.scope_of_works.raw.join(', ')
                    : ''
                "
              >
                <div v-if="result.scope_of_works && result.scope_of_works.raw">
                  <div
                    v-for="(scopeOfWork, scopeOfWorkIndex) of result.scope_of_works.raw"
                    :key="`scopeOfWorkIndex${scopeOfWorkIndex}`"
                    style="overflow: hidden; white-space: nowrap;"
                  >
                    {{ scopeOfWork }}
                  </div>
                  <div
                    v-if="
                      result.scope_of_works.raw &&
                      result.scope_of_works.raw.length > 2
                    "
                    class="blue-grey--text"
                    style="position: absolute; top: 18px; right: 0px; background-color: #dfe2ee; padding: 0px 4px; border-radius: 8px; border: 3px solid #ffffff;"
                  >
                    +{{ result.scope_of_works.raw.length - 2 }} more
                  </div>
                </div>
              </div>
              <div v-else-if="column.property === 'segment' && result.segments && result.segments.raw">
                <div v-if="result.segments && result.segments.raw">
                  <div
                    v-for="(segment, segmentIndex) of result.segments.raw"
                    :key="`segmentIndex${segmentIndex}`"
                    style="overflow: hidden; white-space: nowrap;"
                  >
                    {{ segment }}
                  </div>
                </div>
              </div>
              <div v-else-if="column.property === 'brand' && result.brands && result.brands.raw">
                <div v-if="result.brands && result.brands.raw">
                  <div
                    v-for="(brand, brandIndex) of result.brands.raw"
                    :key="`brandIndex${brandIndex}`"
                    style="overflow: hidden; white-space: nowrap;"
                  >
                    {{ brand }}
                  </div>
                </div>
              </div>
              <div v-else-if="column.property === 'financial' && result.financials && result.financials.raw">
                <div v-if="result.financials && result.financials.raw">
                  <div
                    v-for="(financial, financialIndex) of result.financials.raw"
                    :key="`financialIndex${financialIndex}`"
                    style="overflow: hidden; white-space: nowrap;"
                  >
                    {{ financial }}
                  </div>
                </div>
              </div>
              <div v-else-if="column.property === 'contract_types' && result.contract_types && result.contract_types.raw">
                <div
                  v-for="(contractType, contractTypeIndex) of result.contract_types.raw"
                  :key="`contractTypeIndex${contractTypeIndex}`"
                  style="overflow: hidden; white-space: nowrap;"
                >
                  {{ contractType }}
                </div>
              </div>
              <div
                v-else-if="column.property === 'power' && result.power && result.power.raw"
                style="position: relative;"
                :title="
                  result && result.power.raw
                    ? result.power.raw.join(', ')
                    : ''
                "
              >
                <div v-if="result.power && result.power.raw">
                  <div
                    v-for="(item, itemIndex) of result.power.raw"
                    :key="`itemIndex${itemIndex}`"
                    style="overflow: hidden; white-space: nowrap;"
                  >
                    {{ item }}
                  </div>
                  <div
                    v-if="
                      result.power.raw &&
                      result.power.raw.length > 2
                    "
                    class="blue-grey--text"
                    style="position: absolute; top: 18px; right: 0px; background-color: #dfe2ee; padding: 0px 4px; border-radius: 8px; border: 3px solid #ffffff;"
                  >
                    +{{ result.power.raw.length - 2 }} more
                  </div>
                </div>
              </div>
              <div
                v-else-if="column.property === 'voltage' && result.voltage && result.voltage.raw"
                style="position: relative;"
                :title="
                  result && result.voltage.raw
                    ? result.voltage.raw.join(', ')
                    : ''
                "
              >
                <div v-if="result.voltage && result.voltage.raw">
                  <div
                    v-for="(item, itemIndex) of result.voltage.raw"
                    :key="`itemIndex${itemIndex}`"
                    style="overflow: hidden; white-space: nowrap;"
                  >
                    {{ item }}
                  </div>
                  <div
                    v-if="
                      result.voltage.raw &&
                      result.voltage.raw.length > 2
                    "
                    class="blue-grey--text"
                    style="position: absolute; top: 18px; right: 0px; background-color: #dfe2ee; padding: 0px 4px; border-radius: 8px; border: 3px solid #ffffff;"
                  >
                    +{{ result.voltage.raw.length - 2 }} more
                  </div>
                </div>
              </div>
              <div v-else>
                <div v-if="result[column.property] && result[column.property].raw">
                  {{ result[column.property].raw }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center grey--text">
        <div><v-icon>block</v-icon></div>
        <div>There are no tenders found.</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import SearchFacet from '@/views/tender/components/SearchFacet'
import SearchFacetRegion from '@/views/tender/components/SearchFacetRegion'

export default {
  name: 'SearchResultsTable',

  components: {
    SearchFacet,
    SearchFacetRegion,
  },

  props: {
    results: {
      type: Array,
      required: true
    },
    
    filter: {
      type: Object,
      required: true
    },

    searchState: {
      type: Object,
      required: true
    },
  },

  data: () => ({
    moment,
    now_timestamp: null,
    columns: [
      {
        show: false,
        title: "CPV",
        property: "cpv",
        menu: null
      },
      {
        show: false,
        title: "Region",
        property: "region",
        menu: null
      },
      {
        show: true,
        title: "Country",
        property: "country",
        menu: null
      },
      {
        show: true,
        title: "Buyer",
        property: "buyer_name",
        menu: null
      },
      {
        show: true,
        title: "Bid Deadline",
        property: "bid_deadline",
        menu: null
      },
      {
        show: true,
        title: "Publication",
        property: "publication_date",
        menu: null
      },
      {
        show: true,
        title: "Notice type",
        property: "notice_type",
        menu: null
      },
      {
        show: false,
        title: "Biding type",
        property: "biding_type",
        menu: null
      },
      {
        show: false,
        title: "SOW",
        property: "scope_of_work",
        menu: null
      },
      {
        show: false,
        title: "Segment",
        property: "segment",
        menu: null
      },
      {
        show: false,
        title: "Brand",
        property: "brand",
        menu: null
      },
      {
        show: false,
        title: "Financial Organization",
        property: "financial",
        menu: null
      },
      {
        show: false,
        title: "Contract Type",
        property: "contract_types",
        menu: null
      },
      {
        show: false,
        title: "Method",
        property: "procurement_method",
        menu: null
      },
      {
        show: false,
        title: "Currency",
        property: "currency",
        menu: null
      },
      {
        show: false,
        title: "power",
        property: "power",
        menu: null
      },
      {
        show: false,
        title: "voltage",
        property: "voltage",
        menu: null
      },
      {
        show: false,
        title: "ID",
        property: "id",
        menu: null
      }
    ],
  }),

  computed: {
    ...mapGetters('defaultStore', [
      'getUserType',
      'getIsFreeMembership',
      'getIsPremiumMembership',
      'getIsBusinessMembership',
      'getScreenTenders',
      'getCpvsLogoFromLabel',
      'getDataTenderGroups',
    ]),

    tenderGroups() {
      return result => {
        if (
          !result.groups ||
          !result.groups.raw ||
          !this.getDataTenderGroups ||
          this.getDataTenderGroups.loading !== 1 ||
          !this.getDataTenderGroups.data
        ) {
          return null
        }
        const tenderGroups = this.getDataTenderGroups.data.filter(a =>
          result.groups.raw.includes(a.tenderGroupId.toString())
        )
        if (!tenderGroups || !tenderGroups.length) {
          return null
        }
        return tenderGroups
      };
    },
  },

  created() {
    this.initUserScreen();
    this.now_timestamp = new Date();
    this.now_timestamp.setHours(0);
    this.now_timestamp.setMinutes(0);
    this.now_timestamp.setSeconds(0);
    this.now_timestamp = this.now_timestamp.getTime();
  },

  watch: {
    columns() {
      this.updateUserScreen();
    },
  },

  methods: {
    ...mapActions('defaultStore', [
      'showInsufficientRightDialog',
      'setScreenTenders',
    ]),

    initUserScreen() {
      if (this.getScreenTenders.columns) {
        for (const column of this.getScreenTenders.columns) {
          const columnFind = this.columns.find(
            a => a.property === column.property
          );
          if (columnFind) {
            columnFind.show = column.show;
          }
        }
      }
    },

    updateUserScreen() {
      this.setScreenTenders({
        columns: this.columns
      });
    },

    handleFacetChange(event, facet) {
      this.$emit('handleFacetChange', {
        event,
        facet,
      })
    },

    handleFacetCheckAll(facet) {
      this.$emit('handleFacetCheckAll', facet)
    },

    handleFacetUnCheckAll(facet) {
      this.$emit('handleFacetUnCheckAll', facet)
    },

    openTenderGroupChoice(result) {
      this.$emit('openTenderGroupChoice', result)
    },

    sendToSalesforce(result) {
      this.$emit('sendToSalesforce', result)
    },
  },
}
</script>

<style>
.display-table-row {
  display: flex;
  align-content: stretch;
}
.display-table-row:hover {
  background-color: #f5f5f5;
}

.display-table-head {
  overflow: hidden;
  max-height: 50px;
  align-self: center;
}

.display-table-cell {
  overflow: hidden;
  max-height: 40px;
}

.display-table-cell-standard {
  width: 150px;
  min-width: 150px;
}

.display-table-cell-avatar {
  width: 60px;
  min-width: 60px;
  text-align: center;
}

.display-table-cell-title {
  min-width: 300px;
  max-width: 300px;
  flex: 2;
}

.display-table-cell-option {
  width: 26px;
  min-width: 26px;
  text-align: center;
}
</style>
