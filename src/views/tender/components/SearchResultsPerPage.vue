<template>
  <div>
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="blue-grey"
          text small
          v-bind="attrs"
          v-on="on"
        >
          {{ value }} tenders per page
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(perPage, index) in perPages"
          :key="index"
          @click="$emit('input', perPage)"
        >
          <v-list-item-title>
            {{ perPage }} tenders per page
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'SearchResultsPerPage',

  props: {
    value: {
      type: Number,
      required: true
    }
  },

  data: () => ({
    perPages: [40, 80, 120],
  }),

};
</script>

<style scoped>
.hitsPerPage-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding: .3rem 2rem .3rem .3rem;
  max-width: 100%;
  background-color: #fff;
  background-image: url(data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M0 7.3l2.8-2.8 9.2 9.3 9.2-9.3L24 7.3 12 19.5z' fill='%233A4570'/%3E%3C/svg%3E);
  background-repeat: no-repeat;
  background-size: 10px 10px;
  background-position: 92% 50%;
  border: 1px solid #c4c8d8;
  border-radius: 5px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding: .3rem 2rem .3rem .3rem;
  max-width: 100%;
  background-color: #fff;
  background-image: url(data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M0 7.3l2.8-2.8 9.2 9.3 9.2-9.3L24 7.3 12 19.5z' fill='%233A4570'/%3E%3C/svg%3E);
  background-repeat: no-repeat;
  background-size: 10px 10px;
  background-position: 92% 50%;
  border: 1px solid #c4c8d8;
  border-radius: 5px;
}
</style>