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
            v-for="(group, index) in getTenderGroups"
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
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'TenderGroupChoice',

  data: () => ({
    tender: undefined,
  }),
  mounted () {
    this.tender = this.getPipelineDialogTender
  },
  computed: {
    isShow: {
      get () {
        return this.getPipelineDialogState
      },
      set (value) {
        this.UPDATE_PIPELINE_STATE(value)
      }
    },
    ...mapGetters('appSearchTender', [
      'getPipelineDialogState',
      'getPipelineDialogTender'
    ]),
    ...mapGetters('defaultStore', [
      'getDataTenderGroups',
    ]),

    getTenderGroups() {
      return this.getDataTenderGroups.data.filter(
        a => !a.searchRequest || a.searchRequest.trim() === ''
      )
    },
  },

  methods: {
    ...mapMutations('appSearchTender', [
      'UPDATE_PIPELINE_STATE'
    ]),
    async show(tender) {
      console.log('show-me')
      try {
        this.tender = tender
        this.isShow = true
      } catch (err) {
        this.isShow = false
      }
    },

    choice(group) {
      console.log('teder: ' + this.tender)
      this.$emit('choice', {
        tender: this.tender,
        group,
      })
      this.isShow = false
    }
  },
}
</script>
