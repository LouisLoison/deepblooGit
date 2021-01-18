<template>
  <div class="pt-2 pl-2">
    <v-combobox
      v-model="text"
      :loading="loading"
      :items="suggestions"
      :search-input.sync="search"
      :menu-props="{ closeOnClick: true, closeOnContentClick: true, disableKeys: true, openOnClick: false }"
      @keyup="sentValue($event.target.value)"
      @click:clear="sentValue(null)"
      prepend-inner-icon="fa-search"
      clearable
      flat
      hide-no-data
      hide-details
      placeholder="Search here..."
      class="ma-0 pa-0"
    />
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'SearchHeader',

  props: {
    value: {
      required: true,
      type: String,
    }
  },

  data: () => ({
    suggestions: [],
    loading: false,
    text: null,
    search: null,
    sentValuefunc: null,
  }),

  watch: {
    search (value) {
      if (value && value.length && value !== this.value) {
        this.getSuggestion(value)
      } else {
        this.suggestions = []
      }
    },
    text (value) {
      this.sentValue(value)
    },
  },
  
  methods: {
    setValue(value) {
      if (this.sentValuefunc) {
        clearTimeout(this.sentValuefunc)
      }
      this.$emit('newValue', value)
      this.sentValuefunc = null
      this.search = value
      this.text = value
    },

    sentValue(value) {
      if (this.sentValuefunc) {
        clearTimeout(this.sentValuefunc)
      }
      this.sentValuefunc = setTimeout(() => {
        this.$emit('newValue', value)
        this.sentValuefunc = null
        this.search = value
      }, 500)
    },

    async getSuggestion(value) {
      this.loading = true
      const response = await axios
        .create({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VUE_APP_SEARCH_KEY}`
          }
        })
        .post(`${process.env.VUE_APP_SEARCH_ENDPOINT}/api/as/v1/engines/${process.env.VUE_APP_SEARCH_ENGINE}/query_suggestion`, {
          'query': value,
          'types': {
            'documents': {
              'fields': [
                'title'
              ]
            }
          },
          'size': 10,
        })

      if (
        response.data
        && response.data.results
        && response.data.results.documents
        && response.data.results.documents.length
      ) {
        this.suggestions = response.data.results.documents.map(a => a.suggestion)
      }
      // this.text = value
      // this.search = value
      this.loading = false
    },
  }
}
</script>
