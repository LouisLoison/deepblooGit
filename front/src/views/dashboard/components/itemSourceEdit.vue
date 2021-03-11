<template>
  <div>
    <div class="grey--text">Facet</div>
    <v-menu offset-y max-height="400">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="blue-grey"
          dark
          small
          block
          v-bind="attrs"
          v-on="on"
        >
          <span v-if="item.data.source.main.facet && item.data.source.main.facet.trim() !== ''">
            {{ $global.facetLabel(item.data.source.main.facet) }}
          </span>
          <span v-else class="grey--text">
            None
          </span>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(facet, index) in facets"
          :key="`facet${index}`"
          @click="changeMainFacet(facet.name)"
        >
          <v-list-item-title>
            <v-icon v-if="facet.type === 'STRING'" x-small class="blue-grey--text mr-2" title="String">fa-sort-alpha-up</v-icon>
            <v-icon v-else-if="facet.type === 'NUMBER'" x-small class="blue-grey--text mr-2" title="Numeric">fa-sort-numeric-up</v-icon>
            <v-icon v-else-if="facet.type === 'TIMESTAMP'" x-small class="blue-grey--text mr-2" title="Date">fa-calendar</v-icon>
            {{ $global.facetLabel(facet.name) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <div
      v-if="hasFacetCountMax"
      class="pt-3"
    >
      <div v-if="getFacetObject(item.data.source.main.facet) && getFacetObject(item.data.source.main.facet).type === 'TIMESTAMP'">
        <div class="grey--text">
          Periods
        </div>
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              color="blue-grey"
              dark
              small
              block
            >
              {{ item.data.source.main.count }} {{ item.data.source.main.type }}(S)
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="changeMainType('DAY')">
              <v-list-item-title>Day</v-list-item-title>
            </v-list-item>
            <v-list-item @click="changeMainType('WEEK')">
              <v-list-item-title>Week</v-list-item-title>
            </v-list-item>
            <v-list-item @click="changeMainType('MONTH')">
              <v-list-item-title>Month</v-list-item-title>
            </v-list-item>
            <v-list-item @click="changeMainType('YEAR')">
              <v-list-item-title>Year</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <div class="period-grid pt-2">
          <div class="grey--text pt-1">
            Before
          </div>
          <v-slider
            :value="item.data.source.main.count"
            @change="changeMainCount($event)"
            color="blue-grey"
            label=""
            min="0"
            max="20"
            thumb-label
            hide-details
          />
        </div>
        <div class="period-grid pt-0">
          <div class="grey--text pt-1">
            After
          </div>
          <v-slider
            :value="item.data.source.main.count2"
            @change="changeMainCount2($event)"
            color="blue-grey"
            label=""
            min="0"
            max="20"
            thumb-label
            hide-details
          />
        </div>
      </div>
      <div v-else>
        <div class="grey--text">
          Count max
          <span
            v-if="item.data.source.main.count > 0"
            class="grey--text"
          >
            ({{ item.data.source.main.count }})
          </span>
        </div>
        <div class="source-main-count">
          <v-switch
            :input-value="item.data.source.main.count ? true : false"
            @change="$event ? changeMainCount(10) : changeMainCount(null)"
            dense
            hide-details
            class="pa-0 ml-2 mr-0 mt-1 mb-0"
          />
          <v-slider
            v-if="item.data.source.main.count"
            :value="item.data.source.main.count"
            @change="changeMainCount($event)"
            color="blue-grey"
            label=""
            min="1"
            max="20"
            thumb-label
            hide-details
          />
        </div>
      </div>
    </div>
    <div v-if="hasSecondary" class="pt-3">
      <div class="grey--text">Secondary dimension</div>
      <v-menu offset-y max-height="400">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="blue-grey"
            dark
            small
            block
            v-bind="attrs"
            v-on="on"
          >
            <span v-if="item.data.source.secondary.facet && item.data.source.secondary.facet.trim() !== ''">
              {{ $global.facetLabel(item.data.source.secondary.facet) }}
            </span>
            <span v-else class="grey--text">
              None
            </span>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="changeSecondaryFacet(null)">
            <v-list-item-title class="grey--text">
              None
            </v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item
            v-for="(facet, index) in getSecondaryFacets"
            :key="`facet${index}`"
            @click="changeSecondaryFacet(facet.name)"
          >
            <v-list-item-title>
              <v-icon v-if="facet.type === 'STRING'" x-small class="blue-grey--text mr-2" title="String">fa-sort-alpha-up</v-icon>
              <v-icon v-else-if="facet.type === 'NUMBER'" x-small class="blue-grey--text mr-2" title="Numeric">fa-sort-numeric-up</v-icon>
              <v-icon v-else-if="facet.type === 'TIMESTAMP'" x-small class="blue-grey--text mr-2" title="Date">fa-calendar</v-icon>
              {{ $global.facetLabel(facet.name) }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <div class="grey--text pt-3">
        Count max
        <span
          v-if="item.data.source.secondary.count > 0"
          class="grey--text"
        >
          ({{ item.data.source.secondary.count }})
        </span>
      </div>
      <div class="source-main-count">
        <v-switch
          :input-value="item.data.source.secondary.count ? true : false"
          @change="$event ? changeSecondaryCount(10) : changeSecondaryCount(null)"
          dense
          hide-details
          class="pa-0 ml-2 mr-0 mt-1 mb-0"
        />
        <v-slider
          v-if="item.data.source.secondary.count"
          :value="item.data.source.secondary.count"
          @change="changeSecondaryCount($event)"
          color="blue-grey"
          label=""
          min="1"
          max="20"
          thumb-label
          hide-details
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'itemDataChoice',

  props: {
    item: {
      type: Object,
      required: true,
    },
    facets: {
      type: Array,
      required: true,
    },
    hasFacetCountMax: {
      type: Boolean,
      default: false,
      required: false,
    },
    hasSecondary: {
      type: Boolean,
      default: false,
      required: false,
    },
  },

  computed: {
    getSecondaryFacets() {
      let facets = this.facets.filter(a => a.type !== 'TIMESTAMP')
      if (this.item.data.source.main.facet) {
        facets = facets.filter(a => a.name !== this.item.data.source.main.facet)
      }
      return facets
    },
  },

  methods: {
    getFacetObject(facet) {
      return this.facets.find(a => a.name === facet)
    },

    changeMainFacet(facet) {
      const itemSource = JSON.parse(JSON.stringify(this.item.data.source))
      itemSource.main.facet = facet
      const facetObject = this.getFacetObject(facet)
      if (facetObject && facetObject.type === 'TIMESTAMP') {
        if (!itemSource.main.type || itemSource.main.type.trim() === '') {
          itemSource.main.type = 'DAY'
        }
        if (!itemSource.main.count) {
          itemSource.main.count = 10
        }
      }
      this.updateItemSource(itemSource)
    },

    changeMainCount(value) {
      const itemSource = JSON.parse(JSON.stringify(this.item.data.source))
      itemSource.main.count = value
      this.updateItemSource(itemSource)
    },

    changeMainCount2(value) {
      const itemSource = JSON.parse(JSON.stringify(this.item.data.source))
      itemSource.main.count2 = value
      this.updateItemSource(itemSource)
    },

    changeMainType(value) {
      const itemSource = JSON.parse(JSON.stringify(this.item.data.source))
      itemSource.main.type = value
      this.updateItemSource(itemSource)
    },

    changeSecondaryFacet(facet) {
      const itemSource = JSON.parse(JSON.stringify(this.item.data.source))
      itemSource.secondary.facet = facet
      const facetObject = this.getFacetObject(facet)
      if (facetObject && facetObject.type === 'TIMESTAMP') {
        if (!itemSource.secondary.type || itemSource.secondary.type.trim() === '') {
          itemSource.secondary.type = 'DAY'
        }
        if (!itemSource.secondary.count) {
          itemSource.secondary.count = 10
        }
      }
      this.updateItemSource(itemSource)
    },

    changeSecondaryCount(value) {
      const itemSource = JSON.parse(JSON.stringify(this.item.data.source))
      itemSource.secondary.count = value
      this.updateItemSource(itemSource)
    },

    changePeriodCount(value) {
      this.$emit('changePeriodCount', value)
    },

    updateItemSource(itemSource) {
      this.$emit('updateItemSource', itemSource)
    }
  },
}
</script>

<style scoped>
.source-main-count {
  display: grid;
  grid-template-columns: 50px 1fr;
  grid-gap: 0px 0px;
}
.period-grid {
  display: grid;
  grid-template-columns: 40px 1fr;
  grid-gap: 0px 0px;
}
</style>