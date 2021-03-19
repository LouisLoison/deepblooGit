<template>
<div class="search-panel">
 <v-navigation-drawer
        absolute
        clipped
        fixed
        expand-on-hover
        :style="
      getIsMobile
        ? 'margin-top: -44px; z-index:999'
        : `height: calc(100vh - ${isHeaderShow ? '114' : '40'}px); overflow: auto; margin-top: 0px; z-index:999`">
    <perfect-scrollbar
      class="search-panel__filters pa-0"
      style="background-color: #f5f5f5; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px; height: calc(100vh - 155px);"
      :style="!getIsMobile ? 'height: 100%; overflow: auto;' : ''"
    >
      <TendersAction />
      <v-expansion-panels
        v-model="panels"
        focusable
        accordion
        multiple
        class="pb-4"
      >
        <v-expansion-panel @click="updateUserScreen()" style="background-color: transparent;">
          <v-expansion-panel-header class="iconFilterGrid">
            <v-icon> fas fa-bookmark </v-icon>
            Pipelines</v-expansion-panel-header>
          <v-expansion-panel-content>
            <TendersGroup
              ref="TendersGroup"
              @erraseSearchFilter="erraseSearchFilter()"
              @change="
                tenderGroupChange(
                  $event.tenderGroupId,
                  $event.isWithoutGroup,
                  $event.isMyPipeline,
                  $event.isAllTenders
                )
              "
              @erraseFilter="erraseSearchFilter()"
              @updateBusinessPipelineSearch="updateBusinessPipelineSearch($event)"
              @eraseBusinessPipelineSearch="eraseBusinessPipelineSearch($event)"
              @addBusinessPipelineSearch="addBusinessPipelineSearch()"
            />
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel
          @change="updateUserScreen()"
          style="background-color: transparent;"
        >
          <v-expansion-panel-header class="iconFilterGrid">
            <v-icon> fas fa-filter </v-icon>
            Filters</v-expansion-panel-header>
          <v-expansion-panel-content>
            <TendersFilter
              v-if="searchState.wasSearched"
              :driver="driver"
              :searchState="searchState"
              @filterChange="filterChange($event)"
              ref="TendersFilter"
            />
            <div v-else class="text-center pa-5">
              <v-progress-circular
                :size="50"
                color="blue-grey lighten-4"
                indeterminate
              />
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel
          @change="updateUserScreen()"
          style="background-color: transparent;"
        >
          <v-expansion-panel-header class="iconFilterGrid">
            <v-icon>fas fa-users</v-icon>
            Your colleagues</v-expansion-panel-header>
          <v-expansion-panel-content>
            <TendersYourColleague />
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel
          @change="updateUserScreen()"
          style="background-color: transparent;"
        >
          <v-expansion-panel-header class="iconFilterGrid">
            <v-icon> fas fa-user </v-icon>Your profile</v-expansion-panel-header>
          <v-expansion-panel-content>
            <TendersYourProfile />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </perfect-scrollbar>
 </v-navigation-drawer>

    <div
      class="content-grid search-panel__results pt-3 px-3"
      style="margin-left: 50px; overflow: auto; height: 100%;"
    >
      <div class="searchbox-grid mb-1">
        <SearchHeader
          ref="searchInputValue"
          v-model="searchInputValue"
          @submit="handleFormSubmit($event)"
          @newValue="handleFormSubmit($event)"
        />
        <v-btn
          v-if="!getIsMobile"
          @click="displayType = 'CARD'"
          icon
          large
          :color="displayType === 'CARD' ? 'blue-grey' : 'grey'"
          class="mt-2 mb-0 mx-0"
          title="Card display"
        >
          <v-icon style="font-size: 24px;">fa-th</v-icon>
        </v-btn>
        <v-btn
          v-if="!getIsMobile"
          @click="displayType = 'TABLE'"
          icon
          large
          :color="displayType === 'TABLE' ? 'blue-grey' : 'grey'"
          class="mt-2 mb-0 mx-0"
          title="Table display"
        >
          <v-icon style="font-size: 24px;">fa-table</v-icon>
        </v-btn>
        <div v-if="!getIsMobile">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                :disabled="getUserType !== 1"
                v-bind="attrs"
                v-on="on"
                icon
                large
                :color="displayType === 'DASHBOARD' ? 'blue-grey' : 'grey'"
                class="mt-2 mb-0 mx-0"
                title="Dashboard"
              >
                <v-icon style="font-size: 24px;">fa-chart-pie</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="displayType = 'DASHBOARD'">
                <v-list-item-title>
                  Energie
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="displayType = 'DASHBOARD'">
                <v-list-item-title>
                  Solar in Asia
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="displayType = 'DASHBOARD'">
                <v-list-item-title>
                  Micro-Grid
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
      <div
        v-if="searchState.wasSearched && displayType !== 'DASHBOARD'"
        class="hit-header-grid pt-2 pb-2"
      >
        <div>
          <SearchResultsPerPage
            v-show="thereAreResults"
            v-model.number="resultsPerPage"
          />
        </div>
        <div style="overflow: hidden;">
          <SearchPagination
            v-show="thereAreResults"
            :total-pages="Math.min(searchState.totalPages, 100)"
            :click-handler="setCurrentPage"
            :searchState="searchState"
          />
        </div>
        <div>
          <v-btn
            :to="{ name: 'TenderInfo' }"
            target='_blank'
            small
            rounded
            dark
            class="blue-grey lighten-1 ma-0"
          >
            <v-icon class="pr-2" small>fa-question-circle</v-icon>
            How does it work / FAQ
          </v-btn>
        </div>
        <div>
          <SearchPagingInfo :search-state="searchState" />
        </div>
      </div>
      <TendersRefinement
        v-if="displayType !== 'DASHBOARD'"
        :searchInputValue="searchInputValue"
        :filter="filter"
        @searchInputValueRemove="searchInputValueRemove()"
        @facetItemRemove="facetItemRemove($event.facet, $event.item)"
      />
      <div v-show="searchState.wasSearched" class="sui-layout-body">
        <SearchResults
          ref="SearchResults"
          :results="searchState.results || []"
          :displayType="displayType"
          :filter="filter"
          :searchState="searchState"
          @updateUserScreen="updateUserScreen()"
          @moveTenderToGroup="moveTenderToGroup()"
          @handleFacetChange="$refs.TendersFilter.handleFacetChange($event.event, $event.facet)"
          @handleFacetCheckAll="$refs.TendersFilter.handleFacetCheckAll($event)"
          @handleFacetUnCheckAll="$refs.TendersFilter.handleFacetUnCheckAll($event)"
          @tenderOpen="tenderOpen($event)"
          @removeTender="removeTender($event)"
          @searchInputValueRemove="searchInputValueRemove()"
          @facetItemRemove="facetItemRemove($event.facet, $event.item)"
        />
      </div>
      <div v-if="!searchState.wasSearched" class="text-center pa-5">
        <div class="blue-grey--text text--lighten-2 pa-5">loading...</div>
        <div style="width: 250px; display: inline-block;">
          <v-progress-linear
            :height="6"
            color="blue-grey lighten-4"
            indeterminate
            rounded
            striped
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { SearchDriver } from '@elastic/search-ui'
import config from '@/searchConfig'
import CustomURLManager from '@/CustomURLManager'
import TendersAction from '@/views/tender/components/TendersAction'
import TendersGroup from '@/views/tender/components/TendersGroup'
import TendersFilter from '@/views/tender/components/TendersFilter'
import TendersYourColleague from '@/views/tender/components/TendersYourColleague'
import TendersYourProfile from '@/views/tender/components/TendersYourProfile'
import TendersRefinement from '@/views/tender/components/TendersRefinement'
import SearchResults from '@/views/tender/components/SearchResults'
import SearchHeader from '@/views/tender/components/SearchHeader'
import SearchPagingInfo from '@/views/tender/components/SearchPagingInfo'
import SearchPagination from '@/views/tender/components/SearchPagination'
import SearchResultsPerPage from '@/views/tender/components/SearchResultsPerPage'

let driver = null

export default {
  name: 'Tenders',

  components: {
    TendersAction,
    TendersGroup,
    TendersFilter,
    TendersYourColleague,
    TendersYourProfile,
    TendersRefinement,
    SearchResults,
    SearchHeader,
    SearchPagingInfo,
    SearchPagination,
    SearchResultsPerPage,
  },

  data: () => ({
    driver,
    loading: true,
    panels: [ 1 ],
    filter: {
      region_lvl0: [],
      region_lvl1: [],
      country: [],
      notice_type: [],
      currency: [],
      cpvs: [],
      user_id: [],
      bid_deadline_timestamp: [],
      publication_timestamp: [],
      procurement_method: [],
      lang: [],
      scope_of_works: [],
      segments: [],
      designs: [],
      contract_types: [],
      brands: [],
      datasource: [],
      groups: [],
      buyer_name: [],
      financials: [],
      power: [],
      voltage: [],
    },
    displayType: 'CARD',
    bidDeadlineFacet: 'NOT_EXPIRED',
    searchInputValue: '',
    searchState: {},
    resultsPerPage: 40,
    sortBy: 'relevance',
    isAllTenders: true,
    isMyPipeline: false,
    isWithoutGroup: false,
    tenderGroupId: null,
  }),

  computed: {
    ...mapGetters('defaultStore', [
      'getUserId',
      'getUserType',
      'isHeaderShow',
      'getIsMobile',
      'getScreenTenders',
      'getDataOpportunity',
      'getUserBusinessPipeline',
      'getDataTenderGroups',
    ]),

    thereAreResults() {
      return this.searchState.totalResults && this.searchState.totalResults > 0;
    },
  },

  watch: {
    resultsPerPage(newResultsPerPage) {
      if (driver && !this.loading) {
        driver.setResultsPerPage(newResultsPerPage)
        this.updateUserScreen()
      }
    },

    displayType() {
      this.updateUserScreen();
    },

    panels() {
      this.updateUserScreen()
    },
  },

  created() {
    this.initUserScreen()

    // Init bid deadline
    let now_timestamp = new Date()
    // now_timestamp.setDate(now_timestamp.getDate() + 1)
    now_timestamp.setHours(0)
    now_timestamp.setMinutes(0)
    now_timestamp.setSeconds(0)
    now_timestamp = now_timestamp.getTime()

    let more_1_week_timestamp = new Date()
    more_1_week_timestamp.setDate(more_1_week_timestamp.getDate() + 7)
    more_1_week_timestamp.setHours(23)
    more_1_week_timestamp.setMinutes(59)
    more_1_week_timestamp.setSeconds(59)
    more_1_week_timestamp = more_1_week_timestamp.getTime()

    config.searchQuery.facets.bid_deadline_timestamp.ranges = [
      { from: now_timestamp, name: 'Not expired'},
      { from: more_1_week_timestamp, name: 'Will expire in more than 1 week' },
      { from: now_timestamp, to: more_1_week_timestamp, name: 'Will expire in less than 1 week' },
      { from: 1, to: now_timestamp, name: 'Expired'},
    ]

    // Init source
    config.searchQuery.facets.user_id = {
      type: 'range',
      ranges: [
        { from: 0, name: 'Public tenders' },
        { from: 1, name: 'Opportunities from DB community' },
        { from: this.getUserId, to: this.getUserId + 1, name: 'My opportunities' },
      ]
    }

    // Init publication
    let nowStartDay_timestamp = new Date()
    nowStartDay_timestamp.setDate(nowStartDay_timestamp.getDate() - 2)
    nowStartDay_timestamp.setHours(0)
    nowStartDay_timestamp.setMinutes(0)
    nowStartDay_timestamp.setSeconds(0)
    nowStartDay_timestamp = nowStartDay_timestamp.getTime()

    let nowEndDay_timestamp = new Date()
    nowEndDay_timestamp.setDate(nowEndDay_timestamp.getDate() + 1)
    nowEndDay_timestamp.setHours(0)
    nowEndDay_timestamp.setMinutes(0)
    nowEndDay_timestamp.setSeconds(0)
    nowEndDay_timestamp = nowEndDay_timestamp.getTime()

    let week_1_ago_timestamp = new Date()
    week_1_ago_timestamp.setDate(week_1_ago_timestamp.getDate() - 7)
    week_1_ago_timestamp.setHours(0)
    week_1_ago_timestamp.setMinutes(0)
    week_1_ago_timestamp.setSeconds(0)
    week_1_ago_timestamp = week_1_ago_timestamp.getTime()

    let week_2_ago_timestamp = new Date()
    week_2_ago_timestamp.setDate(week_2_ago_timestamp.getDate() - 14)
    week_2_ago_timestamp.setHours(0)
    week_2_ago_timestamp.setMinutes(0)
    week_2_ago_timestamp.setSeconds(0)
    week_2_ago_timestamp = week_2_ago_timestamp.getTime()

    let week_3_ago_timestamp = new Date()
    week_3_ago_timestamp.setDate(week_3_ago_timestamp.getDate() - 21)
    week_3_ago_timestamp.setHours(0)
    week_3_ago_timestamp.setMinutes(0)
    week_3_ago_timestamp.setSeconds(0)
    week_3_ago_timestamp = week_3_ago_timestamp.getTime()

    let month_ago_timestamp = new Date()
    month_ago_timestamp.setDate(month_ago_timestamp.getDate() - 31)
    month_ago_timestamp.setHours(0)
    month_ago_timestamp.setMinutes(0)
    month_ago_timestamp.setSeconds(0)
    month_ago_timestamp = month_ago_timestamp.getTime()

    let year = new Date().getFullYear()
    let yearPast = year - 1

    config.searchQuery.facets.publication_timestamp.ranges = [
      { from: nowStartDay_timestamp, to: nowEndDay_timestamp, name: 'Today'},
      { from: week_1_ago_timestamp, name: 'This week' },
      { from: week_2_ago_timestamp, to: now_timestamp, name: '2 weeks ago' },
      { from: week_3_ago_timestamp, to: now_timestamp, name: '3 weeks ago' },
      { from: month_ago_timestamp, to: now_timestamp, name: 'This month'},
      { from: new Date(year, 0, 1).getTime(), to: now_timestamp, name: year.toString()},
      { from: new Date(yearPast, 0, 1).getTime(), to: new Date(year, 0, 1).getTime(), name: yearPast.toString()},
    ]

    driver = new SearchDriver(config)
    driver.URLManager = CustomURLManager
    driver.setResultsPerPage(this.resultsPerPage)
    driver.clearFilters()
    this.driver = driver
  },

  mounted() {
    this.loadCpvs()

    // Hide header
    if (this.$route.query.header === 'hide') {
      this.setHeaderShow(false)
    }

    if (this.$route.params && (this.$route.query.tenderId || this.$route.query.tenderUuid)) {
      this.$refs.SearchResults.tenderOpen({
        tender_id: {
          raw: this.$route.query.tenderId
        },
        id: {
          raw: this.$route.query.tenderId
        },
        tenderUuid: {
          raw: this.$route.query.tenderUuid
        },
      })
    }

    if (this.$route.query.userToken) {
      this.userLogin({
        userToken: this.$route.query.userToken,
      })
    }

    const {
      searchTerm,
      sortField,
      resultsPerPage,
      filters,
      facets
    } = driver.getState()

    // restoring UI from url query
    this.searchInputValue = searchTerm
    this.sortBy = sortField
    this.resultsPerPage = resultsPerPage
    filters.forEach(filter => {
      if (
        facets &&
        facets[filter.field] &&
        facets[filter.field][0] &&
        facets[filter.field][0].type === 'range'
      ) {
        this[filter.field] = filter.values.map(value => value.name)
      } else {
        this[filter.field] = filter.values
      }
    })

    driver.subscribeToStateChanges(state => {
      this.searchState = state
    })

    // Get user memberships
    if (this.getUserId) {
      this.loadUserMemberships()
      this.loadUserNotifys()
      this.loadOpportunity()
      this.setUserConnexion('connexionTender')
      this.loadTenderGroups()
      this.loadBusinessPipeline()
    }

    this.loading = false
  },

  methods: {
    ...mapActions('defaultStore', [
      'userLogin',
      'setHeaderShow',
      'loadUserMemberships',
      'loadUserNotifys',
      'loadOpportunity',
      'setUserConnexion',
      'setScreenTenders',
      'loadCpvs',
      'loadTenderGroups',
      'updateTenderGroup',
      'loadBusinessPipeline',
      'updateBusinessPipeline',
    ]),

    initUserScreen() {
      if (this.getScreenTenders) {
        if (this.getScreenTenders.displayType) {
          this.displayType = this.getScreenTenders.displayType
        }
        if (
          this.getScreenTenders.panels !== undefined &&
          this.getScreenTenders.panels !== null
        ) {
          this.panels = this.getScreenTenders.panels
        }
        if (
          this.getScreenTenders.resultsPerPage !== undefined &&
          this.getScreenTenders.resultsPerPage !== null
        ) {
          this.resultsPerPage = this.getScreenTenders.resultsPerPage
        }
      }
    },

    updateUserScreen() {
      if (this.loading) {
        return
      }
      this.setScreenTenders({
        displayType: this.displayType,
        panels: this.panels,
        resultsPerPage: this.resultsPerPage,
      })
    },

    setCurrentPage(page) {
      driver.setCurrent(page)
    },

    moveTenderToGroup() {
      if (
        this.$refs &&
        this.$refs.TendersGroup
      ) {
        this.$refs.TendersGroup.loadTenderGroupLink()
      }
    },

    filterChange(filter) {
      this.filter = {
        ...this.filter,
        ...filter,
      }
      this.setSearchFilter()
    },

    searchInputValueRemove() {
      this.searchInputValue = ''
      this.$refs.searchInputValue.setValue('')
    },

    facetItemRemove(facet, item) {
      const event = {
        target: {
          value: item,
          checked: false,
        }
      }
      if (this.$refs.TendersFilter) {
        this.$refs.TendersFilter.handleFacetChange(event, facet.field)
      }
    },

    async tenderOpen(result) {
      try {
        this.driver.trackClickThrough(result.id.raw, [])
      } catch (err) {
        console.log(err)
      }
    },

    removeTender(result) {
      if (this.searchState.results && result.id && result.id.raw) {
        this.searchState.results = this.searchState.results.filter(a => a.id.raw !== result.id.raw)
      }
    },

    tenderGroupChange(
      tenderGroupId,
      isWithoutGroup,
      isMyPipeline,
      isAllTenders
    ) {
      this.erraseSearchFilter()
      this.isAllTenders = isAllTenders
      this.isWithoutGroup = isWithoutGroup
      this.tenderGroupId = tenderGroupId
      this.filter.groups = []
      if (this.tenderGroupId) {
        const value = tenderGroupId.toString()
        this.filter.groups.push(value)
      }
      if (this.isMyPipeline !== isMyPipeline) {
        this.isMyPipeline = isMyPipeline
        this.filter.cpvs = []
        this.filter.region_lvl0 = []
        this.filter.region_lvl1 = []
      }
      this.isMyPipeline = isMyPipeline

      if (
        this.filter.groups
        && this.filter.groups.length
      ) {
        for (const tenderGroupId of this.filter.groups) {
          const tenderGroup = this.getDataTenderGroups.data.find(a => a.tenderGroupId === parseInt(tenderGroupId, 10))
          if (
            tenderGroup
            && tenderGroup.searchRequest
          ) {
            const searchRequest = JSON.parse(tenderGroup.searchRequest)
            this.$refs.searchInputValue.setValue(searchRequest.searchInputValue)
            for (const field in searchRequest.filter) {
              for (const value of searchRequest.filter[field]) {
                if (!this.filter[field].includes(value)) {
                  this.filter[field].push(value)
                }
              }
            }
          } else {
            // this.driver.addFilter('groups', tenderGroupId, 'any')
          }
        }
      }
      
      this.setSearchFilter()
    },

    handleFormSubmit(event) {
      this.searchInputValue = event || ''
      this.setSearchFilter()
    },

    erraseSearchFilter() {
      this.$refs.searchInputValue.sentValue('')
      for (let facet in this.filter) {
        if (facet === 'groups') {
          continue
        }
        this.filter[facet] = []
      }
      this.$refs.TendersFilter.updateFilter(this.filter)
      this.setSearchFilter()
    },

    setSearchFilter() {
      driver.clearFilters()
      driver.getActions().setSearchTerm(this.searchInputValue)
      
      for (let facet in this.filter) {
        for (let value of this.filter[facet]) {
          const facetFromDriver = this.driver.getState().facets[facet][0]
          let valueforApi =
            facetFromDriver.type === 'range'
              ? facetFromDriver.data.find(item => item.value.name === value).value
              : value
          if (facet === 'groups') {
            valueforApi = []
            for (const tenderGroupId of this.filter[facet]) {
              const tenderGroup = this.getDataTenderGroups.data.find(a => a.tenderGroupId === parseInt(tenderGroupId, 10))
              if (
                !tenderGroup
                || !tenderGroup.searchRequest
              ) {
                valueforApi.push(tenderGroupId)
              }
            }
          }
          if (
            valueforApi
            && (
              (facet === 'groups' && valueforApi.length)
              || facet !== 'groups'
            )
          ) {
            this.driver.addFilter(facet, valueforApi, 'any')
          }
        }
      }
    },

    updateBusinessPipelineSearch(tenderGroup) {
      tenderGroup.searchRequest = JSON.stringify({
        searchInputValue: this.searchInputValue,
        filter: this.filter,
      })
      this.updateTenderGroup(tenderGroup)
      if (
        this.$refs &&
        this.$refs.TendersGroup
      ) {
        this.$refs.TendersGroup.loadTenderGroupLink()
      }
      /*
      this.updateBusinessPipeline({
        searchInputValue: this.searchInputValue,
        filter: this.filter,
      })
      */
    },

    eraseBusinessPipelineSearch(tenderGroup) {
      tenderGroup.searchRequest = ''
      this.updateTenderGroup(tenderGroup)
      if (
        this.$refs &&
        this.$refs.TendersGroup
      ) {
        this.$refs.TendersGroup.loadTenderGroupLink()
      }
    },

    addBusinessPipelineSearch() {
      const tenderGroup = {
        label: '',
        color: '#aaaaaa',
        searchRequest: JSON.stringify({
          searchInputValue: this.searchInputValue,
          filter: this.filter,
        })
      }
      this.$refs.TendersGroup.openGroupDialog(tenderGroup)
    },
  }
}
</script>

<style>
@media screen and (max-width: 640px) {
  .content-grid {
    display: grid;
    grid-template-columns: 100%;
    grid-gap: 0px 0px;
  }
  .hit-header-grid {
    display: grid;
    grid-template-columns: 100%;
    grid-gap: 0px 0px;
  }
}
@media screen and (min-width: 640px) {
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 0px 0px;
  }
  .hit-header-grid {
    display: grid;
    grid-template-columns: 190px 1fr 220px 100px;
    grid-gap: 0px 0px;
  }
}

.searchbox-grid {
  display: grid;
  grid-template-columns: 1fr 50px 50px 50px;
  grid-gap: 0px 0px;
  background-color: #f5f5f5;
  height: 55px;
}

.ps__rail-y {
 z-index: 100;
}

.search-panel .v-expansion-panel-content__wrap {
  padding: 0px !important;
}

.search-panel .v-expansion-panel::before {
    box-shadow: none;
}
.iconFilterGrid {
  display: grid;
  grid-template-columns: 10px 1fr 20px;
  grid-gap: 25px;
}
</style>
