<template>
  <v-dialog v-model="isShow" max-width="500">
    <v-card class="text-center">
      <v-card-title class="headline">
        Tender business pipeline choice
      </v-card-title>

      <v-card-text>
        <v-list>
          <v-list-item @click="choice(null)">
            <v-list-item-content>
              <span v-html="'none'" class="grey--text" />
            </v-list-item-content>
            <v-list-item-avatar>
              <v-icon :style="`font-size: 20px; color: #f5f5f5;`">
                fa-circle
              </v-icon>
            </v-list-item-avatar>
          </v-list-item>
          <v-divider class="ma-1" />
          <v-list-item
            v-for="(group, index) in getDataTenderGroups.data"
            :key="`group${index}`"
            @click="choice(group)"
          >
            <v-list-item-content>
              <span v-html="group.label" />
            </v-list-item-content>
            <v-list-item-avatar>
              <v-icon :style="`font-size: 30px; color:${group.color};`">
                fa-circle
              </v-icon>
            </v-list-item-avatar>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn small color="primary">
          Ok
        </v-btn>
        <v-btn text small color="primary" @click="isShow = false">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TenderGroupChoice',

  data: () => ({
    isShow: false,
    tender: null
  }),

  computed: {
    ...mapGetters([
      'getDataTenderGroups',
    ]),
  },

  methods: {
    async show(tender) {
      try {
        this.tender = tender
        this.isShow = true
      } catch (err) {
        this.isShow = false
      }
    },

    choice(group) {
      this.$emit('choice', {
        tender: this.tender,
        group
      })
      this.isShow = false
    }
  },
}
</script>
