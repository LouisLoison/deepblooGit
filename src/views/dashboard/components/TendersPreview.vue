<template>
  <div>
    <TendersRefinement />
  </div>
</template>

<script>
import TendersRefinement from '@/views/tender/components/TendersRefinement'

export default {
  name: 'ItemCard',

  components: {
    TendersRefinement,
  },

  props: {
    display: {
      type: String,
      required: false,
    },

    selectedUuid: {
      type: String,
      required: false,
    },

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
  }),

  methods: {
    selectItem(item) {
      this.$emit('selectItem', item)
    },

    deleteItem(item) {
      this.$emit('deleteItem', item)
    },

    openTender(tender) {
      this.$emit('openTender', tender)
    },
  },
}
</script>
