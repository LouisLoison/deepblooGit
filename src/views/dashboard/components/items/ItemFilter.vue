<template>
  <div>
    <v-menu
      offset-y
      max-height="400"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          :style="item.data.isDataEmpty ? 'opacity: 0.5;' : ''"
          dark
          block
          outlined
          color="blue-grey"
        >
          {{ $global.facetLabel(item.facet) }}
        </v-btn>
      </template>
      <div class="white">
        <v-list-item-group
          v-model="settings"
          :multiple="item.data.multiple"
          active-class=""
        >
          <v-list-item
            v-for="(data, index) in getDatas"
            :key="index"
            @click.stop
          >
            <template v-slot:default="{ active }">
              <v-list-item-action>
                <v-checkbox :input-value="active" />
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title>{{ data.value }}</v-list-item-title>
              </v-list-item-content>

              <v-list-item-action>
                <v-list-item-action-text>
                  <span class="result-count">
                    {{ data.count }}
                  </span>
                </v-list-item-action-text>
              </v-list-item-action>
            </template>
          </v-list-item>
        </v-list-item-group>
      </div>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'ItemFilter',

  props: {
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
    datas: [
      { title: 'Data 1' },
      { title: 'Data 2' },
      { title: 'Data 3' },
      { title: 'Data 4' },
    ],
    settings: [],
  }),

  computed: {
    getDatas() {
      if (
        !this.dataSearch.data
        || !this.item.facet
      ) {
        return []
      }
      const facet = this.dataSearch.data.facets[this.item.facet]
      if (facet && facet.length && facet[0].data && facet[0].data.length) {
        return facet[0].data
      }
      return []
    }
  },

  methods: {
  },
}
</script>

<style scoped>
.result-count {
    padding: .1rem .4rem;
    font-size: .7rem;
    color: #3a4570;
    background-color: #dfe2ee;
    border-radius: 8px;
    white-space: nowrap;
}
</style>