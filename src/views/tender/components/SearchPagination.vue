<template>
  <div class="pagination">
    <v-pagination
      v-model="searchState.current"
      :length="searchState.totalPages"
      @input="changePage()"
      color="blue"
    />
  </div>
</template>

<script>
export default {
  name: 'SearchPagination',

  props: {
    searchState: {
      type: Object,
      required: true
    },
    clickHandler: {
      type: Function,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
  },

  methods: {
    changePage() {
      this.clickHandler(this.searchState.current)
    }
  },

}
</script>

<style>
.pagination .v-pagination {
  height: 28px;
}

.pagination .v-pagination__item {
  margin: 0px 3px !important;
  height: 28px;
  min-width: 28px;
}

.pagination .v-pagination__navigation {
  margin: 0px 3px !important;
  height: 28px;
  min-width: 28px;
}
</style>
