<template>
  <div class="pa-3">
    <div v-if="!dataTenderGroups.loading" class="text-center pa-5">
      <v-progress-circular :size="50" color="grey" indeterminate />
    </div>
    <div v-else>
      <!-- All tenders -->
      <div>
        <v-btn
          @click="isAllTendersChange()"
          :color="isAllTenders ? 'blue-grey lighten-2' : 'blue-grey'"
          :depressed="isAllTenders"
          :dark="isAllTenders"
          :text="!isAllTenders"
          small
          block
          class="ma-1"
        >
          See all tenders
        </v-btn>
      </div>

      <!-- My pipeline of tenders -->
      <div>
        <v-btn
          @click.stop="isMyPipelineChange()"
          :color="isMyPipeline ? 'red lighten-2' : 'red'"
          :depressed="isMyPipeline"
          :dark="isMyPipeline"
          :text="!isMyPipeline"
          small
          block
          :style="getIsPremiumMembership ? 'opacity: 0.5;' : ''"
          class="ma-1"
        >
          My pipeline of tenders
        </v-btn>
      </div>

      <v-divider class="ma-1"></v-divider>

      <!-- Tenders without business pipeline -->
      <div
        class="group-list-grid"
        @click.stop="isWithoutGroupChange()"
        :style="
          !isWithoutGroup
            ? ''
            : `background-color: #c1c9ce !important; border-color: #c1c9ce !important;`
        "
      >
        <div class="text-center pa-1" style="pointer-events: none;">
          <v-avatar
            v-if="!isWithoutGroup"
            size="40"
            class="mr-3"
            style="min-width: 40px;"
            :style="{
              'background-color': `#c1c9ce !important`,
              'border-color': `#c1c9ce !important`
            }"
          >
            <v-icon
              size="14"
              class="white--text"
            >
              fa-filter
            </v-icon>
          </v-avatar>
          <v-avatar v-else size="40" class="mr-3" color="white">
            <span
              class="body-2 headline"
              :style="{ color: `#c1c9ce !important` }"
            />
          </v-avatar>
        </div>
        <div
          class="cursor-pointer"
          style="display: flex; align-items: center; text-shadow: rgb(255, 255, 255) 1px 0px 10px;"
        >
          Without business pipeline
        </div>
        <div @click.stop></div>
      </div>

      <!-- Tender business pipeline -->
      <drop
        v-for="(group, index) of dataTenderGroups.data"
        :key="`group${index}`"
        @drop="tenderDrop(group, $event.tender, $event)"
        @dragenter="group.over = true"
        @dragleave="group.over = false"
      >
        <div
          class="group-list-grid"
          @click="tenderGroupChange(group.tenderGroupId)"
          :style="
            group.over
              ? 'background-color: #e2e2e2 !important; border-color: #e2e2e2 !important;'
              : group.tenderGroupId === tenderGroupId
              ? `background-color: ${group.color} !important; border-color: ${
                  group.color
                } !important;`
              : ''
          "
        >
          <div class="text-center pa-1" style="pointer-events: none;">
            <v-avatar
              v-if="!group.select"
              size="40"
              class="mr-3"
              style="min-width: 40px;"
              :style="{
                'background-color': `${group.color} !important`,
                'border-color': `${group.color} !important`
              }"
            >
              <v-icon
                v-if="group.searchRequest && group.searchRequest !== ''"
                size="14"
                class="white--text"
              >
                fa-filter
              </v-icon>
              <span
                v-else
                class="body-2 headline white--text"
              >
                {{ group.count > -1 ? group.count : "--" }}
              </span>
            </v-avatar>
            <v-avatar v-else size="40" class="mr-3" color="white">
              <span
                class="body-2 headline"
                :style="{ color: `${group.color} !important` }"
              >
                {{ group.count > -1 ? group.count : "--" }}
              </span>
            </v-avatar>
          </div>
          <div
            class="cursor-pointer"
            style="display: flex; align-items: center; text-shadow: rgb(255, 255, 255) 1px 0px 10px;"
          >
            {{ group.label }}
          </div>
          <div
            @click.stop
            class="ml-2 mr-1 pl-1 group-action"
            style="margin-left: -100px !important;"
          >
            <v-btn
              depressed
              rounded
              text
              x-small
              @click="tenderGroupChange(group.tenderGroupId, true)"
            >
              Errase filters
            </v-btn>
            <v-menu
              transition="slide-y-transition"
              offset-y
              left
              dense
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  icon
                >
                  <v-icon size="16">
                    fa-ellipsis-v
                  </v-icon>
                </v-btn>
              </template>

              <v-list dense class="list-icon">
                <v-list-item
                  @click="saveBusinessPipeline(group)"
                  avatar
                  style="height: 20px;"
                >
                  <v-list-item-avatar>
                    <v-icon size="14" text>fa-save</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-title>
                    Save current search
                  </v-list-item-title>
                </v-list-item>

                <v-list-item
                  @click="eraseBusinessPipeline(group)"
                  :disabled="!group.searchRequest || group.searchRequest === ''"
                  avatar
                  style="height: 20px;"
                >
                  <v-list-item-avatar>
                    <v-icon size="14" text>fa-trash</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-title>
                    Erase search filter
                  </v-list-item-title>
                </v-list-item>

                <v-divider />

                <v-list-item
                  @click="openGroupDialog(group)"
                  avatar
                  style="height: 20px;"
                >
                  <v-list-item-avatar>
                    <v-icon size="14" text>fa-edit</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-title>
                    Edit
                  </v-list-item-title>
                </v-list-item>

                <v-list-item
                  @click="deleteTenderGroupDialog(group)"
                  avatar
                  style="height: 20px;"
                >
                  <v-list-item-avatar>
                    <v-icon size="14" text color="red">fa-trash</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-title class="red--text">
                    Delete
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>
      </drop>

      <!-- Add a business pipeline -->
      <div
        v-if="getIsBusinessMembership"
        class="group-list-grid"
        @click="openGroupDialog()"
      >
        <div class="text-center pa-1">
          <v-avatar size="40" class="ml-2">
            <v-icon block text class="mr-3">fa-plus</v-icon>
          </v-avatar>
        </div>
        <div style="display: flex; align-items: center;">
          Add a business pipeline
        </div>
        <div></div>
      </div>
    </div>

    <!-- Dialog -->
    <v-dialog v-model="isGroupDialog" max-width="500">
      <v-card class="text-center">
        <v-card-title class="headline">
          Tender business pipeline
        </v-card-title>

        <v-card-text v-if="groupDialog">
          <v-form v-model="groupValid" ref="groupForm" lazy-validation>
            <v-text-field
              label="Label"
              v-model="groupDialog.label"
              :rules="notEmptyRules"
              required
              class="mb-4"
            />

            <v-select
              label="Color"
              v-model="groupDialog.color"
              :items="colors"
              :rules="notEmptyRules"
              required
              class="mb-4"
            >
              <template slot="selection" scope="data">
                <v-icon
                  class="mr-1"
                  :style="{ color: `${data.item} !important` }"
                >
                  fa-circle
                </v-icon>
                {{ data.item }}
              </template>
              <template slot="item" scope="data">
                <v-icon
                  class="mr-1"
                  :style="{ color: `${data.item} !important` }"
                >
                  fa-circle
                </v-icon>
                {{ data.item }}
              </template>
            </v-select>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small color="primary" @click="updateGroup()">Save</v-btn>
          <v-btn text small color="primary" @click="isGroupDialog = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'TendersGroup',

  props: {
    tenderCount: {
      type: Number,
      default: -1
    },
    isWithoutGroupProp: {
      type: Boolean,
      default: false
    },
    tenderGroupIdProp: {
      type: Number,
      default: null
    }
  },

  data: () => ({
    tenderGroupId: null,
    dataTenderGroups: {
      loading: null,
      data: null,
      error: null
    },
    dataTenderGroupLinks: {
      loading: null,
      data: null,
      error: null
    },
    isAllTenders: true,
    isMyPipeline: false,
    isWithoutGroup: false,
    tenderGroupArchive: {
      count: -1,
      select: false,
      over: false
    },
    tenderGroupDelete: {
      count: -1,
      select: false,
      over: false
    },
    archiveGroupTenders: [],
    archiveSelect: false,
    archiveOver: false,
    deleteGroupTenders: [],
    deleteSelect: false,
    deleteOver: false,
    groupDialog: false,
    isGroupDialog: false,
    groupValid: false,
    colors: [
      '#96d232',
      '#2e84db',
      '#6a60ff',
      '#4ac4cf',
      '#ffb629',
      '#c969e6',
      '#af1c09',
    ],
    notEmptyRules: [v => !!v || 'Data is required']
  }),

  computed: {
    ...mapGetters([
      'getUserId',
      'getDataTenderGroups',
      'getIsFreeMembership',
      'getIsPremiumMembership',
      'getIsBusinessMembership',
    ])
  },

  async mounted() {
    await this.load()
    this.loadTenderGroupLink()
    this.isWithoutGroup = this.isWithoutGroupProp
    this.tenderGroupId = this.tenderGroupIdProp
  },

  methods: {
    ...mapActions([
      'showConfirmModal',
      'loadTenderGroups',
    ]),

    async load() {
      try {
        if (!this.getUserId) {
          this.dataTenderGroups.data = []
          this.dataTenderGroups.loading = 1
          return
        }
        this.loadTenderGroups()
        this.dataTenderGroups.loading = 0
        const res = await this.$api.post('/Tender/TenderGroupList', {
          userId: this.getUserId
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataTenderGroups.data = []
        for (const tenderGroup of res.data) {
          this.dataTenderGroups.data.push({
            tenderGroupId: tenderGroup.tenderGroupId,
            color: tenderGroup.color,
            label: tenderGroup.label,
            searchRequest: tenderGroup.searchRequest,
            count: -1,
            tenders: [],
            expand: false,
            select: false,
            over: false
          })
        }
        this.dataTenderGroups.loading = 1
      } catch (err) {
        this.dataTenderGroups.loading = -1
        this.$api.error(err, this)
      }
    },

    async loadTenderGroupLink() {
      try {
        if (!this.getUserId) {
          this.dataTenderGroupLinks.data = []
          this.dataTenderGroupLinks.loading = 1
          return
        }
        this.dataTenderGroupLinks.loading = 0
        const res = await this.$api.post('/Tender/TenderGroupLinkList', {
          userId: this.getUserId
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataTenderGroupLinks.data = res.data
        for (const tenderGroup of this.dataTenderGroups.data) {
          tenderGroup.count = 0
        }
        for (const tenderGroupLink of this.dataTenderGroupLinks.data) {
          const tenderGroup = this.dataTenderGroups.data.find(
            a => a.tenderGroupId === tenderGroupLink.tenderGroupId
          )
          if (tenderGroup) {
            tenderGroup.count = tenderGroup.count + 1
          }
        }
        this.dataTenderGroupLinks.loading = 1
      } catch (err) {
        this.dataTenderGroupLinks.loading = -1
        this.$api.error(err, this)
      }
    },

    openGroupDialog(group) {
      if (!this.getUserId) {
        return
      }
      if (!group) {
        group = {
          label: '',
          color: '#ffffff'
        }
      }
      this.groupDialog = JSON.parse(JSON.stringify(group))
      this.isGroupDialog = true
      this.$nextTick(() => {
        this.$refs.groupForm.resetValidation()
      })
    },

    tenderDrop(tenderGroup, tender) {
      const tenders = [tender]
      this.groupTenderMove(tenderGroup, tenders)
    },

    async groupTenderMove(tenderGroup, tenders) {
      try {
        for (const tender of tenders) {
          const res = await this.$api.post('/Tender/TenderGroupMove', {
            userId: this.getUserId,
            tenderGroupId: tenderGroup.tenderGroupId,
            tenderId: tender.id
          })
          if (!res.success) {
            throw new Error(res.Error)
          }
        }
      } catch (err) {
        this.$api.error(err, this)
      }
    },

    async updateGroup() {
      if (!this.$refs.groupForm.validate()) {
        return
      }
      this.isGroupDialog = false
      try {
        this.groupDialog.userId = this.getUserId
        const res = await this.$api.post('/Tender/TenderGroupAddUpdate', {
          tenderGroup: this.groupDialog
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        await this.load();
        this.loadTenderGroupLink()
      } catch (err) {
        this.$api.error(err, this)
      }
    },

    deleteTenderGroupDialog(tenderGroup) {
      if (!tenderGroup.tenderGroupId) {
        return
      }
      var message = "Do you really want to delete this group of tender ?<br>";
      message += `<span class="black--text">${tenderGroup.label}</span><br>`;
      this.showConfirmModal({
        headerClass: "white--text red lighten-1",
        headerIcon: "fa-trash",
        title: "Delete",
        message: message,
        buttons: [
          {
            libelle: "Yes",
            class: "red--text",
            action: async dialog => {
              await this.deleteTenderGroup(tenderGroup)
              dialog.close()
            }
          },
          { libelle: "No", text: true, class: "" }
        ]
      })
    },

    async deleteTenderGroup(tenderGroup) {
      try {
        const res = await this.$api.post('/Tender/TenderGroupDelete', {
          tenderGroupId: tenderGroup.tenderGroupId
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        await this.load()
        this.loadTenderGroupLink()
      } catch (err) {
        this.$api.error(err, this)
      }
    },

    isAllTendersChange() {
      this.isAllTenders = true
      this.isMyPipeline = false
      this.$emit('change', {
        isAllTenders: this.isAllTenders,
        isMyPipeline: this.isMyPipeline,
        isWithoutGroup: this.isWithoutGroup,
        tenderGroupId: this.tenderGroupId
      })
    },

    saveBusinessPipeline(tenderGroup) {
      this.$emit('updateBusinessPipelineSearch', tenderGroup)
    },

    eraseBusinessPipeline(tenderGroup) {
      this.$emit('eraseBusinessPipelineSearch', tenderGroup)
    },

    isMyPipelineChange() {
      if (this.getIsPremiumMembership) {
        this.$emit('insufficientRight')
        return
      }
      this.isAllTenders = false
      this.isMyPipeline = true
      this.$emit('erraseSearchFilter')
      this.$emit('change', {
        isAllTenders: this.isAllTenders,
        isMyPipeline: this.isMyPipeline,
        isWithoutGroup: this.isWithoutGroup,
        tenderGroupId: this.tenderGroupId
      })
    },

    isWithoutGroupChange() {
      this.isWithoutGroup = !this.isWithoutGroup
      if (this.tenderGroupId >= 0) {
        this.tenderGroupId = null
      }
      this.$emit('change', {
        isAllTenders: this.isAllTenders,
        isMyPipeline: this.isMyPipeline,
        isWithoutGroup: this.isWithoutGroup,
        tenderGroupId: this.tenderGroupId
      })
    },

    tenderGroupChange(tenderGroupId, erraseFilter) {
      this.isWithoutGroup = false
      if (this.tenderGroupId === tenderGroupId) {
        this.tenderGroupId = null
      } else {
        this.tenderGroupId = tenderGroupId
      }
      this.$emit('change', {
        isAllTenders: this.isAllTenders,
        isMyPipeline: this.isMyPipeline,
        isWithoutGroup: this.isWithoutGroup,
        tenderGroupId: this.tenderGroupId
      })
      if (erraseFilter) {
        this.$emit('erraseFilter')
      }
    }
  }
}
</script>

<style>
.group-list-grid {
  display: grid;
  grid-template-columns: 50px 1fr 50px;
  grid-gap: 0px 0px;
  cursor: pointer;
}
.group-list-grid:hover {
  background-color: #e2e2e2;
}

.group-list-over {
  background-color: #f8ffef;
}

.group-over .item-list {
  background-color: #f8ffef;
}

.group-over {
  background-color: rgba(66, 128, 156, 0.2);
  border-radius: 10px;
  font-weight: 600;
  padding: 0px 5px;
}

.group-list-grid .group-action{
  display: none;
}
.group-list-grid:hover .group-action{
  display: block;
}

.group-action {
  background-color: rgb(223 226 238 / 50%);
  border-radius: 50px;
  white-space: nowrap !important;
  margin-top: 7px !important;
  height: 35px;
}
</style>
