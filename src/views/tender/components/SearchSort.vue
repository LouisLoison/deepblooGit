<template>
  <div>
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="blue-grey"
          text
          small
          block
          v-bind="attrs"
          v-on="on"
        >
          <span class="grey--text pr-1">Sort by</span>
          {{ getLabel }}
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in items"
          :key="`item${index}`"
          @click="$emit('input', item.value)"
        >
          <v-list-item-title>
            {{ item.label }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'SearchSort',

  props: {
    value: {
      type: String,
      required: true
    }
  },

  data: () => ({
    items: [
      {
        label: 'Title',
        value: '',
      }, {
        label: 'Country',
        value: 'country',
      }, {
        label: 'Notice type',
        value: 'notice_type',
      }, {
        label: 'Bid deadline',
        value: 'bid_deadline_timestamp',
      },
    ],
  }),

  computed: {
    getLabel() {
      const item = this.items.find(a => a.value === this.value)
      if (item) {
        return item.label
      }
      return this.value
    },
  },
};
</script>
