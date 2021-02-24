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
          :style="!getDatas || !getDatas.length ? 'opacity: 0.5;' : ''"
          dark
          block
          outlined
          color="blue-grey"
        >
          {{ $global.facetLabel(item.facet) }}
        </v-btn>
      </template>
      <div class="white">
        <div v-if="item.facet === 'cpvs'" @click.stop>
          <v-treeview
            :items="cpvItems"
            selectable
            hoverable
            open-on-click
          />
        </div>
        <v-list-item-group
          v-else
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
    cpvItems: [
      {
        id: 1,
        name: 'Petroleum products, fuel, electricity and other sources of energy',
        children: [
          {
            id: 2,
            name: 'electricity heating solar and nuclear energy',
            children: [
              { id: 11113, name: 'electricity' },
              { id: 11114, name: 'steam hot water and associated products' },
            ],
          },
        ],
      },
      {
        id: 5,
        name: 'Offgrid/energy access',
        children: [
          {
            id: 6,
            name: 'Microgrid',
            children: [
              {
                id: 7,
                name: 'electric rotary converters',
                children: [
                  { id: 8, name: 'Generating sets with compression ignition engines' },
                  { id: 9, name: 'power converters' },
                ],
              },
            ],
          },
          {
            id: 10,
            name: 'Bioenergy',
            children: [
              {
                id: 11,
                name: 'electric motors',
                children: [
                  { id: 12, name: 'adapters' },
                  { id: 13, name: 'generators' },
                  { id: 14, name: 'generating sets' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 15,
        name: 'Micro Hydro',
        children: [
          { id: 16, name: 'Power supply accessories' },
          { id: 17, name: 'electrical machinery apparatus equipment and consumables lighting' },
          { id: 18, name: 'electric motors generators and transformers' },
        ],
      },
      {
        id: 19,
        name: 'hybrid',
        children: [
          {
            id: 20,
            name: 'Grid connected',
            children: [
              { id: 21, name: 'Mini Wind' },
              { id: 22, name: 'Industrial / Network communication' },
              { id: 23, name: 'Fault location' },
            ],
          },
          { id: 24, name: 'Mining' },
          { id: 25, name: 'basic metals and related products' },
        ],
      },
    ],
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
    },
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