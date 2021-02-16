<template>
  <div
    ref="facet"
    style="max-height: 290px;"
    :style="this.minHeight ? `min-height: ${this.minHeight}px;` : ''"
  >
    <div style="position: relative; height: 35px;">
      {{ $global.facetLabel(facet.field) }}
      <div style="position: absolute; right: 0px; top: 0px;">
        <v-btn
          v-if="!isSearchOpen"
          @click="isSearchOpen = true"
          icon
          small
          color="blue-grey"
          title="Search"
        >
          <v-icon style="font-size: 14px;">fas fa-search</v-icon>
        </v-btn>
        <v-btn
          :disabled="!getUnChecked || !getUnChecked.length"
          @click="checkAll()"
          icon
          small
          color="blue-grey"
          title="Checked all"
        >
          <v-icon style="font-size: 14px;">fas fa-clone</v-icon>
        </v-btn>
        <v-btn
          :disabled="!getChecked || !getChecked.length"
          @click="unCheckAll()"
          icon
          small
          color="blue-grey"
          title="Unchecked all"
        >
          <v-icon style="font-size: 14px;">far fa-clone</v-icon>
        </v-btn>
      </div>
    </div>
    <div v-if="isSearchOpen" class="pb-2">
      <v-text-field
        v-model="search"
        solo
        dense
        hide-details
        label="Search"
        color="blue-grey"
        class="search"
        prepend-inner-icon="fa-search"
        append-outer-icon="fa-window-close"
        @click:append-outer="closeSearch()"
      />
    </div>
    <div v-if="facet.data.length">
      <div v-if="getChecked && getChecked.length">
        <div
          v-for="(facetItem, index) in getChecked"
          :key="`facetItemChecked${index}`"
          @click.stop="$emit('change', { target: { value: getValue(facetItem, facet.type), checked: false } })"
          class="facet-item-grid"
          style="color: #3a4570; cursor: pointer !important;"
        >
          <div>
            <v-icon color="blue" style="font-size: 14px;">fas fa-check-square</v-icon>
          </div>
          <div style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
            <span
              v-if="!getValue(facetItem, facet.type) || getValue(facetItem, facet.type).trim() === ''"
              style="color: #9e9e9e;"
            >
              none
            </span>
            <span v-else :title="getValueLabel(facetItem, facet.type)">
              {{ getValueLabel(facetItem, facet.type) }}
            </span>
          </div>
          <div class="text-right">
            <span
              v-if="facetItem.count >= 0"
              class="result-count"
            >
              {{ facetItem.count }}
            </span>
          </div>
        </div>
        <div
          v-if="getUnChecked && getUnChecked.length"
          style="margin: 5px; border-bottom: 1px solid #dfe2ee;"
        />
      </div>
      <div
        v-for="(facetItem, index) in getUnChecked"
        :key="`facetItemUnChecked${index}`"
        @click.stop="$emit('change', { target: { value: getValue(facetItem, facet.type), checked: true } })"
        class="facet-item-grid"
        style="color: #3a4570; cursor: pointer !important;"
      >
        <div>
          <v-icon color="blue-grey" style="font-size: 14px;">far fa-square</v-icon>
        </div>
        <div style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
          <span
            v-if="!getValue(facetItem, facet.type) || getValue(facetItem, facet.type).trim() === ''"
            style="color: #9e9e9e;"
          >
            none
          </span>
          <span v-else :title="getValueLabel(facetItem, facet.type)">
            {{ getValueLabel(facetItem, facet.type) }}
          </span>
        </div>
        <div class="text-right">
          <span
            v-if="facetItem.count >= 0"
            class="result-count"
          >
            {{ facetItem.count }}
          </span>
        </div>
      </div>
    </div>
    <div v-else class="text-center grey--text">
      No data
    </div>
  </div>
</template>

<script>
import constLanguage from '@/assets/constants/languages.json'

export default {
  name: 'SearchFacet',

  props: {
    facet: {
      type: Object,
      required: true
    },

    checked: {
      type: Array,
      required: true
    },
  },

  data: () => ({
    isSearchOpen: false,
    search: '',
    minHeight: 0,
    dataSearchFacets: {
      loading: null,
      query: null,
      data: null,
    },
    itemCache: [],
  }),

  computed: {
    getChecked() {
      const datas = []
      if (this.checked) {
        if (this.facet.type !== 'range') {
          for (const item of this.checked) {
            const data = this.facet.data.find(a => a.value === item)
            if (data) {
              datas.push(data)
            } else {
              datas.push({
                count: 0,
                value: item,
              })
            }
          }
        } else {
          for (const item of this.checked) {
            const data = this.facet.data.find(a => a.value.name === item)
            if (data) {
              datas.push(data)
            } else {
              datas.push({
                count: 0,
                value: item
              })
            }
          }
        }
      }
      return datas
    },

    getUnChecked() {
      let items = []
      if (this.facet.type !== 'range') {
        items = this.facet.data.filter(
          a => !this.checked || !this.checked.includes(a.value)
        )
        if (
          this.search
          && this.search.trim() !== ''
        ) {
          items = items.filter(
            a => a.value && a.value.toUpperCase().includes(this.search.toUpperCase())
          )
        }
      } else {
        items = this.facet.data.filter(
          a => !this.checked || !this.checked.includes(a.value.name)
        )
        if (
          this.search
          && this.search.trim() !== ''
        ) {
          items = items.filter(
            a => a.value && a.value.name && a.value.name.toUpperCase().includes(this.search.toUpperCase())
          )
        }
      }

      if (items.length < 10) {
        for (const itemValue of this.itemCache) {
          if (
            !items.find(a => a.value === itemValue)
            && !this.getChecked.find(a => a.value === itemValue)
          ) {
            items.push({
              count: -1,
              value: itemValue,
            })
          }
        }
      }
      return items.slice(0, 10)
    },
  },

  watch: {
    'facet.data'() {
      this.itemCache = [...new Set([...this.facet.data.map(a => a.value),...this.itemCache])].slice(0, 10)
      this.minHeight = Math.max(this.minHeight, this.$refs.facet.clientHeight)
      if (this.minHeight >= 290) {
        this.minHeight = 290
      }
      this.mergeDatas()
    },

    search() {
      this.searchFacet()
    },

    getUnChecked() {
      this.searchFacet()
    },
  },

  mounted() {
    this.itemCache = [
      ...this.facet.data.map(a => a.value),
      ...this.itemCache,
    ].slice(0, 10)
  },

  methods: {
    getLanguageLabel(lang) {
      let language = constLanguage.find(a => a.alpha2 === lang);
      if (!language) {
        return lang;
      }
      return language.English;
    },

    isChecked(value) {
      return this.checked && this.checked.includes(value)
    },

    getValue(facetItem, type) {
      return type === 'range' ? facetItem.value.name : facetItem.value
    },

    getValueLabel(facetItem, type) {
      let value = this.getValue(facetItem, type)
      if (this.facet.field === 'lang') {
        value = this.getLanguageLabel(value)
      }
      return value
    },

    checkAll() {
      this.$emit('checkAll')
    },

    unCheckAll() {
      this.$emit('unCheckAll')
    },

    closeSearch() {
      this.search = ''
      this.isSearchOpen = false
    },

    async searchFacet() {
      try {
        if (
          !this.search
          || this.search === ''
        ) {
          this.dataSearchFacets.query = ''
          this.dataSearchFacets.data = []
          return
        }
        if (
          this.dataSearchFacets.query === this.search
          || this.getUnChecked.length > 10
        ) {
          return
        }

        this.dataSearchFacets.loading = 0
        const res = await this.$api.post("/Elasticsearch/searchFacet", {
          query: this.search,
          facet: this.facet.field,
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataSearchFacets.query = this.search
        this.dataSearchFacets.data = res.data
        this.mergeDatas()
        this.dataSearchFacets.loading = 1
      } catch (err) {
        this.dataSearchFacets.loading = -1
        this.$api.error(err, this)
      }
    },

    mergeDatas() {
      if (this.dataSearchFacets.data) {
        for (const searchFacet of this.dataSearchFacets.data) {
          if (!this.facet.data.find(a => a.value === searchFacet)) {
            this.facet.data.push({
              count: -1,
              value: searchFacet,
              checked: false,
            })
          }
        }
      }
    },
  }
}
</script>

<style>
.facet-item-grid {
  display: grid;
  grid-template-columns: 16px 1fr 40px;
  grid-gap: 0px 0px;
}
.facet-item-grid:hover {
  background-color: #f6f6f6;
}

.result-label {
  max-width: 200px;
  overflow: hidden;
  display: inline-block;
  height: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-left: 3px;
  margin-right: 3px;
}

.result-count {
  padding: .1rem .4rem;
  font-size: .7rem;
  color: #3a4570;
  background-color: #dfe2ee;
  border-radius: 8px;
  white-space: nowrap;
}

.search .v-input__icon--prepend-inner .v-icon.v-icon {
  font-size: 16px;
}
</style>
