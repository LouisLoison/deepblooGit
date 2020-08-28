<template>
  <div class="pt-2 pl-2">
    <v-text-field
      :value="value"
      @keyup="sentValue($event.target.value)"
      label=""
      prepend-inner-icon="fa-search"
      placeholder="Search here..."
      class="ma-0 pa-0"
    />
  </div>
</template>

<script>
export default {
  name: 'SearchHeader',

  props: {
    value: {
      required: true,
      type: String
    }
  },

  methods: {
    sentValue(value) {
      this.$emit('newValue', value)
    },
  }
}
</script>
