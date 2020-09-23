<template>
  <v-container fluid class="pt-0">
    <div v-if="!dataCpvs.loading" class="text-center">
      <div class="pa-2 grey--text">Loading...</div>
      <v-progress-circular :size="50" color="grey" indeterminate />
    </div>
    <div v-else>
      <v-card-title v-if="!getIsMobile">
        <v-dialog
          ref="dialog"
          v-model="newCpvModal"
          :return-value.sync="newCpvDate"
          persistent
          lazy
          full-width
          width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="newCpvDate"
              label="New CPV date"
              prepend-icon="fa-calendar"
              readonly
              v-on="on"
              style="max-width: 150px"
            />
          </template>
          <v-date-picker v-model="newCpvDate" scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="newCpvModal = false">
              Cancel
            </v-btn>
            <v-btn text color="primary" @click="$refs.dialog.save(newCpvDate)">
              OK
            </v-btn>
          </v-date-picker>
        </v-dialog>
        <v-select
          v-if="dataCpvCategories.loading"
          v-model="cpvCategories"
          :items="dataCpvCategories.data"
          attach
          chips
          clearable
          multiple
          label="Category"
          class="my-0 ml-4 pt-1 cpv-category"
        />
        <v-spacer />
        <v-btn
          fab
          small
          color="blue-grey lighten-5"
          class="mr-2"
          title="Export CSV"
          @click="downloadCsv()"
        >
          <v-icon>fa-file</v-icon>
        </v-btn>
        <v-btn
          fab
          small
          color="blue-grey lighten-5"
          class="mr-2"
          title="Add CPV"
          @click="openCpvDialog()"
        >
          <v-icon>fa-plus</v-icon>
        </v-btn>
        <v-btn
          fab
          small
          color="blue-grey lighten-5"
          class="mr-2"
          title="refresh user liste"
          @click="loadUsers()"
        >
          <v-icon>fa-sync</v-icon>
        </v-btn>
      </v-card-title>

      <div class="cpv-grid">
        <div></div>
        <div>
          <v-text-field
            v-model="filterLabel"
            label="Label"
            clearable
            append-icon="fa-search"
          />
        </div>
        <div>
          <v-text-field
            v-model="filterWord"
            label="Words"
            clearable
            append-icon="fa-search"
          />
        </div>
        <div>
          <v-text-field
            v-model="filterExclusion"
            label="Exclusions"
            clearable
            append-icon="fa-search"
          />
        </div>
        <div />
      </div>

      <div
        v-for="(cpv, index) in getCpvs.slice((page - 1) * perPage, page * perPage)"
        :key="`cpv${index}`"
        class="cpv-grid py-3"
        style="border-bottom: 1px solid #e0e0e0;"
      >
        <div class="text-center">
          <v-avatar size="24">
            <img
              :src="
                cpv.logo && cpv.logo.trim() !== ''
                  ? cpv.logo
                  : 'https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png'
              "
              alt=""
            />
          </v-avatar>
        </div>
        <div class="subheading">
          <div class="red--text" style="font-size: 12px; line-height: 14px;">
            {{ cpv.category }}
          </div>
          <div class="grey--text" style="font-size: 12px; line-height: 14px;">
            {{ cpv.code }}
          </div>
          <div style="line-height: 22px;">
            {{ cpv.label }}
          </div>
        </div>
        <div style="word-break: break-word; overflow: hidden;">
          <v-chip
            v-for="(cpvWord, wordIndex) in cpv.cpvWords"
            :key="`cpvWord${wordIndex}`"
            close
            small
            outlined
            :color="isNewWord(cpvWord) ? 'red' : 'primary'"
            class="cursor-pointer"
            :class="!getIsMobile ? '' : 'mx-0'"
            :style="
              filterWord.trim() !== '' &&
              cpvWord.word
                .toUpperCase()
                .includes(filterWord.trim().toUpperCase())
                ? 'background-color: #fffad1 !important;'
                : ''
            "
            @input="deleteCpvWordDialog(cpv, cpvWord)"
            @click.stop="$refs.cpvWordDialog.show(cpvWord)"
          >
            {{ cpvWord.word }}
          </v-chip>
          <v-btn
            text
            small
            color="green"
            class="my-0 py-0"
            @click="openWordAddDialog(cpv)"
          >
            <v-icon class="pr-2">fa-plus</v-icon>
            Add a word
          </v-btn>
        </div>
        <div style="word-break: break-word; overflow: hidden;">
          <v-chip
            v-for="(cpvExclusion, exclusionIndex) in cpv.cpvExclusions"
            :key="`cpvExclusion${exclusionIndex}`"
            close
            small
            outlined
            :color="isNewWord(cpvExclusion) ? 'red' : 'primary'"
            class="cursor-pointer"
            :class="!getIsMobile ? '' : 'mx-0'"
            @input="deleteCpvExclusionDialog(cpv, cpvExclusion)"
            @click.stop="$refs.cpvExclusionDialog.show(cpvExclusion)"
          >
            {{ cpvExclusion.word }}
          </v-chip>
          <v-btn
            text
            small
            color="green"
            class="my-0 py-0"
            @click="openExclusionAddDialog(cpv)"
          >
            <v-icon class="pr-2">fa-plus</v-icon>
            Add an exclusion
          </v-btn>
        </div>
        <div>
          <v-btn
            icon
            small
            class="ma-0"
            title="Edit CPV"
            @click="openCpvDialog(cpv)"
          >
            <v-icon>fa-edit</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            class="ma-0 red--text"
            title="Delete CPV"
            @click="dialogRemoveOpen(cpv)"
          >
            <v-icon>fa-trash</v-icon>
          </v-btn>
        </div>
      </div>

      <v-pagination
        v-model="page"
        :length="Math.ceil(getCpvs.length / perPage)"
        @input="initPageGroupTenders()"
      />
    </div>

    <!-- Dialog -->
    <cpvWordDialog ref="cpvWordDialog" @ModalUpdate="loadCpvs()" />

    <v-dialog v-model="isCpvDialog" max-width="500">
      <v-card class="text-center">
        <v-toolbar dark dense color="blue-grey lighten-4 black--text">
          <div class="title">
            <span v-if="!cpvDialog || !cpvDialog.cpvId">New CPV</span>
            <span v-else>CPV #{{ cpvDialog.cpvId }}</span>
          </div>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon light @click="isCpvDialog = false">
              <v-icon color="grey darken-2">
                close
              </v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text v-if="cpvDialog">
          <v-form v-model="cpvValid" ref="cpvForm" lazy-validation>
            <v-layout row wrap>
              <v-flex xs6>
                <v-text-field
                  v-model="cpvDialog.code"
                  label="Code"
                  clearable
                  :rules="notEmptyRules"
                  required
                />
              </v-flex>
              <v-flex xs6>
                <v-switch
                  v-model="cpvDialog.active"
                  :label="`Active: ${cpvDialog.active.toString()}`"
                />
              </v-flex>
            </v-layout>
            <v-text-field
              v-model="cpvDialog.label"
              label="Label"
              clearable
              :rules="notEmptyRules"
              required
            />
            <v-text-field
              v-model="cpvDialog.category"
              label="Category"
              clearable
              required
            />
            <v-text-field v-model="cpvDialog.logo" label="Logo" clearable />
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="updateCpvDialog()">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isWordAddDialog" max-width="500">
      <v-card class="text-center">
        <v-card-text v-if="cpvDialog">
          <v-form v-model="wordAddValid" ref="wordAddForm" lazy-validation>
            <v-text-field
              v-model="wordAdd"
              label="Word"
              clearable
              :rules="wordAddRules"
              required
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small color="primary" @click="updateWordAddDialog()">
            Add
          </v-btn>
          <v-btn text small color="primary" @click="isWordAddDialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isExclusionAddDialog" max-width="500">
      <v-card class="text-center">
        <v-card-text v-if="cpvDialog">
          <v-form
            v-model="exclusionAddValid"
            ref="exclusionAddForm"
            lazy-validation
          >
            <v-text-field
              v-model="exclusionAdd"
              label="Word"
              clearable
              :rules="wordAddRules"
              required
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small color="primary" @click="updateExclusionAddDialog()">
            Add
          </v-btn>
          <v-btn
            text
            small
            color="primary"
            @click="isExclusionAddDialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog -->
    <v-dialog v-if="dialogRemove" v-model="dialogRemove" max-width="400">
      <v-card>
        <v-card-title class="headline">
          Are you sure you want to remove this CPV ?
        </v-card-title>

        <v-card-text v-if="cpv">
          <div>
            <v-avatar size="24">
              <img :src="cpv.logo" alt="" />
            </v-avatar>
            {{ cpv.category }}
          </div>
          <div>{{ cpv.code }}</div>
          <div>{{ cpv.label }}</div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="grey darken-1"
            text
            @click="dialogRemove = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="red darken-1"
            text
            :loading="loadingRemove"
            @click="deleteCpv(cpv)"
          >
            remove
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="loadingCsv" persistent width="300">
      <v-card color="blue-grey darken-4" dark>
        <v-card-text>
          Please stand by
          <v-progress-linear indeterminate color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Vue from 'vue'
import moment from 'moment'
import cpvWordDialog from '@/components/modal/cpvWordDialog'

export default {
  name: 'SettingCpv',

  components: {
    cpvWordDialog,
  },

  data: () => ({
    moment,
    dataCpvs: {
      loading: null,
      data: null
    },
    page: 1,
    perPage: 25,
    filterLabel: "",
    filterWord: "",
    filterExclusion: "",
    isCpvDialog: false,
    cpvValid: null,
    cpvDialog: null,
    isWordAddDialog: false,
    wordAddDialog: null,
    wordAdd: null,
    wordAddValid: null,
    isExclusionAddDialog: false,
    exclusionAddDialog: null,
    exclusionAdd: null,
    exclusionAddValid: null,
    wordAddRules: [],
    cpv: null,
    dialogRemove: false,
    loadingRemove: false,
    newCpvDate: new Date().toISOString().substr(0, 10),
    newCpvModal: false,
    cpvCategories: null,
    dataCpvCategories: {
      loading: false,
      data: null
    },
    loadingCsv: false,
    notEmptyRules: [v => !!v || "Data is required"],
  }),

  computed: {
    ...mapGetters([
      'getIsMobile',
    ]),

    getCpvs() {
      let cpvs = this.dataCpvs.data
      if (this.cpvCategories && this.cpvCategories.length) {
        cpvs = cpvs.filter(a => this.cpvCategories.includes(a.category.trim()))
      }
      if (this.filterLabel && this.filterLabel.trim() !== "") {
        cpvs = cpvs.filter(a =>
          a.label.toUpperCase().includes(this.filterLabel.toUpperCase().trim())
        )
      }
      if (this.filterWord && this.filterWord.trim() !== "") {
        cpvs = cpvs.filter(a =>
          a.cpvWords.find(b =>
            b.word.toUpperCase().includes(this.filterWord.toUpperCase().trim())
          )
        )
      }
      return cpvs
    }
  },

  mounted() {
    this.wordAddRules = [
      v => !!v || "Data is required",
      v =>
        (this.cpvDialog.cpvWords &&
          !this.cpvDialog.cpvWords.find(
            a => a && v && a.word.toUpperCase() === v.toUpperCase().trim()
          )) ||
        "Word already exist"
    ]
    this.loadCpvs()
    this.loadCpvCategories()
  },

  methods: {
    ...mapActions([
      'showConfirmModal',
    ]),

    async loadCpvs() {
      try {
        this.dataCpvs.loading = 0
        const res = await this.$api.post("/Cpv/CpvList")
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataCpvs.data = res.data
        this.dataCpvs.loading = 1
      } catch (err) {
        this.dataCpvs.loading = -1
        this.$api.error(err, this)
      }
    },

    async loadCpvCategories() {
      try {
        this.dataCpvCategories.loading = 0
        const res = await this.$api.post("/Cpv/cpvCategories")
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataCpvCategories.data = res.data
        this.dataCpvCategories.loading = 1
      } catch (err) {
        this.dataCpvCategories.loading = -1
        this.$api.error(err, this)
      }
    },

    openCpvDialog(cpv) {
      this.cpvDialog = null
      if (cpv) {
        this.cpvDialog = JSON.parse(JSON.stringify(cpv))
      } else {
        this.cpvDialog = {
          active: true,
          category: "",
          logo: null,
          picture: null,
          code: null,
          label: "",
          words: []
        }
      }
      this.isCpvDialog = true
      Vue.nextTick(() => {
        this.$refs.cpvForm.resetValidation()
      })
    },

    async updateCpvDialog() {
      if (!this.$refs.cpvForm.validate()) {
        return
      }
      try {
        let cpv = {
          cpvId: this.cpvDialog.cpvId,
          code: this.cpvDialog.code,
          label: this.cpvDialog.label,
          active: this.cpvDialog.active,
          logo: this.cpvDialog.logo,
          picture: this.cpvDialog.picture,
          category: this.cpvDialog.category,
          status: 1,
          creationDate: !this.cpvDialog.cpvId ? new Date() : undefined,
          updateDate: new Date()
        }
        const res = await this.$api.post("/cpv/CpvAddUpdate", { cpv })
        if (!res.success) {
          throw new Error(res.Error)
        }
        let cpvFind = this.dataCpvs.data.find(a => a.cpvId === res.data.cpvId)
        if (!cpvFind) {
          this.dataCpvs.data.unshift(res.data)
        } else {
          cpvFind.cpvId = res.data.cpvId
          cpvFind.active = res.data.active
          cpvFind.category = res.data.category
          cpvFind.logo = res.data.logo
          cpvFind.picture = res.data.picture
          cpvFind.code = res.data.code
          cpvFind.label = res.data.label
        }
      } catch (err) {
        this.$api.error(err, this)
      }
      this.isCpvDialog = false
      this.$forceUpdate()
    },

    deleteCpv(cpv) {
      this.loadingRemove = true
      this.$api
        .post("/cpv/cpvDelete", {
          cpvId: cpv.cpvId
        })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error)
          }
          this.dataCpvs.data = this.dataCpvs.data.filter(
            a => a.cpvId !== cpv.cpvId
          )
          this.loadingRemove = false
          this.dialogRemove = false
        })
        .catch(err => {
          this.$api.error(err, this)
        })
    },

    openWordAddDialog(cpv) {
      this.wordAdd = ""
      this.cpvDialog = cpv
      this.isWordAddDialog = true
      Vue.nextTick(() => {
        this.$refs.wordAddForm.resetValidation()
      })
    },

    async updateWordAddDialog() {
      if (!this.$refs.wordAddForm.validate()) {
        return
      }
      this.wordAdd = this.wordAdd.trim()
      for (const wordTemp of this.wordAdd.split(",")) {
        let word = wordTemp.trim()
        try {
          const res = await this.$api.post("/cpv/CpvWordAddUpdate", {
            cpvWord: {
              cpvId: this.cpvDialog.cpvId,
              word: word,
              status: 1,
              creationDate: new Date(),
              updateDate: new Date()
            }
          })
          if (!res.success) {
            throw new Error(res.Error)
          }
          this.addWord(this.cpvDialog, res.data)
        } catch (err) {
          this.$api.error(err, this)
        }
      }
      this.isWordAddDialog = false
      this.$forceUpdate()
    },

    addWord(cpv, cpvWord) {
      const cpvFind = cpv.cpvWords.find(
        a => a.word.toUpperCase() === cpvWord.word.toUpperCase().trim()
      )
      if (cpvFind) {
        return false
      }
      cpv.cpvWords.push(cpvWord)
      return true
    },

    deleteCpvWordDialog(cpv, cpvWord) {
      if (!cpvWord.cpvWordId) {
        return
      }
      var message = "Do you really want to delete this CPV word ?<br>"
      message += `CPV: <span class="black--text">${cpv.label}</span><br>`
      message += `Word: <span class="black--text">${cpvWord.word}</span><br>`
      this.showConfirmModal({
        headerClass: "white--text red lighten-1",
        headerIcon: "fa-trash",
        title: "Delete",
        message: message,
        buttons: [
          {
            libelle: "Yes",
            class: "red--text",
            action: dialog => {
              this.deleteCpvWord(cpv, cpvWord)
              dialog.close()
            }
          },
          { libelle: "No", text: true, class: "" }
        ]
      })
    },

    async deleteCpvWord(cpv, cpvWord) {
      try {
        const res = await this.$api.post("/cpv/cpvWordDelete", {
          cpvWordId: cpvWord.cpvWordId
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        const index = cpv.cpvWords.findIndex(
          a => a.word.toUpperCase() === cpvWord.word.toUpperCase().trim()
        )
        if (index > -1) {
          cpv.cpvWords.splice(index, 1)
        }
        this.$forceUpdate()
      } catch (err) {
        this.$api.error(err, this)
      }
    },

    openExclusionAddDialog(cpv) {
      this.exclusionAdd = ""
      this.cpvDialog = cpv
      this.isExclusionAddDialog = true
      Vue.nextTick(() => {
        this.$refs.exclusionAddForm.resetValidation()
      })
    },

    async updateExclusionAddDialog() {
      if (!this.$refs.exclusionAddForm.validate()) {
        return
      }
      this.exclusionAdd = this.exclusionAdd.trim()
      for (const wordTemp of this.exclusionAdd.split(",")) {
        let word = wordTemp.trim()
        try {
          const res = await this.$api.post("/cpv/CpvExclusionAddUpdate", {
            cpvExclusion: {
              cpvId: this.cpvDialog.cpvId,
              word: word,
              status: 1
            }
          })
          if (!res.success) {
            throw new Error(res.Error)
          }
          this.addExclusion(this.cpvDialog, res.data)
        } catch (err) {
          this.$api.error(err, this)
        }
      }
      this.isExclusionAddDialog = false
      this.$forceUpdate()
    },

    addExclusion(cpv, cpvExclusion) {
      const cpvFind = cpv.cpvExclusions.find(
        a => a.word.toUpperCase() === cpvExclusion.word.toUpperCase().trim()
      )
      if (cpvFind) {
        return false
      }
      cpv.cpvExclusions.push(cpvExclusion)
      return true
    },

    deleteCpvExclusionDialog(cpv, cpvExclusion) {
      if (!cpvExclusion.cpvExclusionId) {
        return
      }
      var message = "Do you really want to delete this CPV word ?<br>"
      message += `CPV: <span class="black--text">${cpv.label}</span><br>`
      message += `Word: <span class="black--text">${cpvExclusion.word}</span><br>`
      this.showConfirmModal({
        headerClass: "white--text red lighten-1",
        headerIcon: "fa-trash",
        title: "Delete",
        message: message,
        buttons: [
          {
            libelle: "Yes",
            class: "red--text",
            action: dialog => {
              this.deleteCpvExclusion(cpv, cpvExclusion)
              dialog.close()
            }
          },
          { libelle: "No", text: true, class: "" }
        ]
      })
    },

    async deleteCpvExclusion(cpv, cpvExclusion) {
      try {
        const res = await this.$api.post("/cpv/cpvExclusionDelete", {
          cpvExclusionId: cpvExclusion.cpvExclusionId
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        const index = cpv.cpvExclusions.findIndex(
          a => a.word.toUpperCase() === cpvExclusion.word.toUpperCase().trim()
        )
        if (index > -1) {
          cpv.cpvExclusions.splice(index, 1)
        }
        this.$forceUpdate()
      } catch (err) {
        this.$api.error(err, this)
      }
    },

    dialogRemoveOpen(cpv) {
      this.cpv = cpv
      this.dialogRemove = true
    },

    isNewWord(cpvWord) {
      this.newCpvDate
      // if (moment(cpvWord.creationDate).format("LL") === moment().format("LL")) {
      if (cpvWord.creationDate >= this.newCpvDate) {
        return true
      }
      return false
    },

    async downloadCsv() {
      this.loadingCsv = true
      try {
        const res = await this.$api.post("/cpv/downloadCsv")
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.$api.fileDownload(res.data.fileName)
      } catch (err) {
        this.$api.error(err, this)
      }
      this.loadingCsv = false
    }
  }
}
</script>

<style>
@media screen and (max-width: 600px) {
  .cpv-grid {
    display: grid;
    grid-template-columns: 30px 100px 2fr 1fr 30px;
    grid-gap: 0px 2px;
  }
}
@media screen and (min-width: 600px) {
  .cpv-grid {
    display: grid;
    grid-template-columns: 40px 150px 2fr 1fr 30px;
    grid-gap: 0px 2px;
  }
}

.word {
  border: 1px solid #2781ba;
  border-radius: 10px;
  padding: 0px 10px 0px 6px;
  margin: 1px;
  color: #2781ba;
  white-space: nowrap;
  position: relative;
}

.word-close {
  font-size: 8px;
  padding: 1px 3px 0px 3px;
  background-color: #E91E63;
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  opacity: 0.5;
  font-family: monospace;
  position: absolute;
  right: 2px;
  top: 2px;
  font-weight: bold;
}
.word-close:hover {
  opacity: 1;
}

.cpv-category .v-select__selections input {
  display: none;
}
</style>
