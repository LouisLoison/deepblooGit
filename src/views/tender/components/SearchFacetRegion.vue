<template>
  <div class="search-facet-region">
    <div class="pt-3 px-3 pb-1">
      Region
    </div>
    <v-treeview
      :items="getItems"
      v-model="active"
      dense
      selectable
      hoverable
      open-on-click
      selected-color="blue-grey"
    >
      <!--
      <template v-slot:prepend="{ item, open }">
        <v-icon v-if="item.children && item.children.length" size="10" class="pr-1">
          {{ open ? 'fas fa-folder-open' : 'fas fa-folder' }}
        </v-icon>
      </template>
      -->
      <template v-slot:append="{ item }">
        <span
          v-if="item.count"
          class="result-count"
        >
          {{ item.count }}
        </span>
      </template>
    </v-treeview>
  </div>
</template>

<script>
import constRegions from '@/assets/constants/regions.json'

export default {
  name: 'SearchFacetRegion',

  props: {
    region_lvl0: {
      type: Array,
      required: true
    },
    region_lvl1: {
      type: Array,
      required: true
    },
  },

  data: () => ({
    constRegions,
    active: [],
  }),

  computed: {
    getItems() {
      const regions = JSON.parse(JSON.stringify(this.constRegions))
      let regionId = 0

      const facetRegionLvl0 = this.region_lvl0
      const facetRegionLvl1 = this.region_lvl1

      let items = []
      for (const region of regions) {
        if (region.label === "Worldwide") {
          continue
        }
        regionId = regionId + 1
        const facet = facetRegionLvl0.find(a => a.value === region.label)
        const regionItem = {
          id: regionId,
          name: region.label,
          count: facet ? facet.count : null,
          isSub: false,
          children: [],
        }
        if (region.regions && region.regions.length) {
          for (const regionSub of region.regions) {
            regionId = regionId + 1
            const facetSub = facetRegionLvl1.find(a => a.value === `${region.label} > ${regionSub.label}`)
            const regionSubItem = {
              id: regionId,
              name: regionSub.label,
              count: facetSub ? facetSub.count : null,
              isSub: true,
              children: [],
            }
            regionItem.children.push(regionSubItem)
          }
        }
        items.push(regionItem)
      }

      return items
    },
  },

  watch: {
		active() {
      const filter = {
        region_lvl0: [],
        region_lvl1: [],
      }
      for (const item of this.getItems) {
        if (this.active.includes(item.id)) {
          filter.region_lvl0.push(item.name)
        }
        for (const itemSub of item.children) {
          if (this.active.includes(itemSub.id)) {
            filter.region_lvl1.push(`${item.name} > ${itemSub.name}`)
          }
        }
      }
      this.$emit('filterChange', filter)
    },
  },

  methods: {
    filterChange(filter) {
      let activeNew = this.active
      for (const item of this.getItems) {
        if (!filter.region_lvl0.includes(item.name)) {
          activeNew = activeNew.filter(a => a !== item.id)
        }
        
        let parentCheked = false
        if (filter.region_lvl0.includes(item.name)) {
          parentCheked = true
        }
        for (const itemSub of item.children) {
          if (!filter.region_lvl1.includes(`${item.name} > ${itemSub.name}`)) {
            activeNew = activeNew.filter(a => a !== itemSub.id)
          }

          if (
            parentCheked
            && !activeNew.includes(itemSub.id)
          ) {
            activeNew.push(itemSub.id)
          }
        }
      }
      if (JSON.stringify(this.active) !== JSON.stringify(activeNew)) {
        this.active = activeNew
      }
    },
  }

}
</script>

<style>
.search-facet-region .v-treeview--dense .v-treeview-node__root {
    min-height: 24px;
}

.search-facet-region .mdi-checkbox-blank-outline {
  margin: 0px !important;
  padding: 0px !important;
  font-size: 16px;
  width: 16px;
}
.search-facet-region .mdi-checkbox-blank-outline::before {
  font-size: 16px;
}

.search-facet-region .mdi-checkbox-marked {
  margin: 0px !important;
  padding: 0px !important;
  font-size: 16px;
  width: 16px;
}
.search-facet-region .mdi-checkbox-marked::before {
  font-size: 16px;
  color: #2196F3;
}

.search-facet-region .mdi-minus-box {
  margin: 0px !important;
  padding: 0px !important;
  font-size: 16px;
  width: 16px;
}
.search-facet-region .mdi-minus-box::before {
  font-size: 16px;
  color: #9e9e9e;
}

/*
.search-facet-region .v-treeview-node__level {
  width: 16px;
}
*/

.search-facet-region .v-treeview-node__prepend {
  margin: 0px !important;
}

.search-facet-region .v-treeview-node__prepend {
  min-width: 2px;
}

.search-facet-region .v-treeview-node__label{
  color: rgb(58, 69, 112);
}
</style>
