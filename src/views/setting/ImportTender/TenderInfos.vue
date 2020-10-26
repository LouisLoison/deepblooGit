<template>
  <div>
    <div
      class="content-grid pt-4 pr-2"
      :style="
        getIsMobile
          ? 'margin-top: -44px;'
          : 'height: calc(100vh - 114px); overflow: auto; margin-top: -16px;'
      "
    >
      <perfect-scrollbar
        v-if="!getIsMobile"
        class="pa-3"
        :style="!getIsMobile ? 'height: 100%; overflow: auto;' : ''"
      >
        <v-btn
          :to="{ name: 'SettingImportStatistique' }"
          outlined
          block
          color="blue-grey"
          class="mb-3"
        >
          <v-icon size="16" class="mr-3">fa-arrow-left</v-icon>
          Statistics
        </v-btn>
        <div
          v-if="!dataImportTenderInfoFacets.loading || dataImportTenderInfoFacets.loading === 0"
          class="pa-5 text-center"
        >
          <v-progress-circular :size="50" color="grey" indeterminate />
        </div>
        <div v-else>
          <v-card class="pa-3 mb-3">
            <div class="title pb-0">File source</div>
            <div
              v-for="(fileSource, index) in facets.fileSources"
              :key="`fileSource${index}`"
              style="position: relative;"
            >
              <v-checkbox
                v-model="fileSource.selected"
                @change="loadImportTenderInfos()"
                :label="fileSource.fileSource.split('.')[0]"
                :value="fileSource.fileSource"
                hide-details
                class="mt-1"
              />
              <span
                class="result-count"
                style="position: absolute; right: 0px; top: calc(50% - 10px);"
              >
                {{ fileSource.count }}
              </span>
            </div>
          </v-card>

          <v-card class="pa-3 mb-3">
            <div class="title pb-0">Merge method</div>
            <div
              v-for="(mergeMethod, index) in facets.mergeMethods"
              :key="`mergeMethod${index}`"
              style="position: relative;"
            >
              <v-checkbox
                v-model="mergeMethod.selected"
                @change="loadImportTenderInfos()"
                :label="mergeMethod.mergeMethod"
                :value="mergeMethod.mergeMethod"
                hide-details
                class="mt-1"
              />
              <span
                class="result-count"
                style="position: absolute; right: 0px; top: calc(50% - 10px);"
              >
                {{ mergeMethod.count }}
              </span>
            </div>
          </v-card>

          <v-card class="pa-3 mb-3">
            <div class="title pb-0">Status</div>
            <div
              v-for="(status, index) in facets.statuss"
              :key="`status${index}`"
              style="position: relative;"
            >
              <v-checkbox
                v-model="status.selected"
                @change="loadImportTenderInfos()"
                :label="getStatusLabel(status.status)"
                hide-details
                class="mt-1"
              />
              <span
                class="result-count"
                style="position: absolute; right: 0px; top: calc(50% - 10px);"
              >
                {{ status.count }}
              </span>
            </div>
          </v-card>
        </div>
      </perfect-scrollbar>

      <div :class="!getIsMobile ? 'pa-0' : 'px-2'" style="overflow: auto;">
        <div
          v-if="!dataImportTenderInfos.loading || dataImportTenderInfos.loading === 0"
          class="pa-5 text-center"
        >
          <div class="pa-2 grey--text">Loading...</div>
          <v-progress-circular :size="50" color="grey" indeterminate />
        </div>
        <div v-else-if="dataImportTenderInfos.loading === -1" class="pa-5 text-center">
          <v-icon class="red--text">error</v-icon>
          <div class="pa-2 red--text">Error while loading data</div>
        </div>
        <div
          v-else-if="dataImportTenderInfos.loading === 1 && dataImportTenderInfos.data.length === 0"
          class="pa-5 text-center"
        >
          <div class="pa-2 black--text">No import tenderInfo</div>
        </div>
        <div v-else>
          <v-card-title>
            <v-chip
              v-if="!getIsMobile"
              outlined
              color="grey"
              title="User count"
              class="pl-2"
            >
              <v-icon class="ml-0" left>fa-database</v-icon>{{ getImportTenderInfos().length }}
            </v-chip>
            <v-spacer />
            <v-text-field
              v-model="search"
              append-icon="fa-search"
              label="Search"
              single-line
              hide-details
              :style="!getIsMobile ? '' : 'width: 100%;'"
            />
            <v-btn
              v-if="!getIsMobile"
              fab
              x-small
              color="blue-grey lighten-5"
              title="refresh import tenderInfo list"
              class="ml-2"
              @click="loadImportTenderInfos()"
            >
              <v-icon>fa-sync-alt</v-icon>
            </v-btn>
          </v-card-title>
          <div :style="!getIsMobile ? 'height: calc(100vh - 248px); overflow: auto;' : ''">
            <v-data-table
              :headers="headers"
              :items="getImportTenderInfos()"
              class="elevation-1"
              header-props.sort-icon="fa-caret-down"
            >
              <template v-slot:item="{ item }">
                <tr @click="importTenderInfoOpen(item)" style="cursor: pointer;">
                  <td class="text-center caption red--text">
                    {{ item.importTenderInfoId }}
                  </td>
                  <td class="blue-grey--text body-2 font-weight-bold">
                    {{ item.short_desc }}
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <ImportTenderInfoDialog ref="ImportTenderInfoDialog" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import ImportTenderInfoDialog from '@/components/modal/ImportTenderInfoDialog'

export default {
  name: 'ImportTenderInfo',

  components: {
    ImportTenderInfoDialog,
  },

  data: () => ({
    moment,
    search: null,
    facets: null,
    dataImportTenderInfoFacets: {
      loading: null,
      data: null
    },
    dataImportTenderInfos: {
      loading: null,
      data: null
    },
    typeGroup: 0,
    headers: [
      { text: "Id", value: "importTenderInfoId", align: "center" },
      { text: "Title", value: "short_desc", align: "center" },
    ],
    pagination: {
      rowsPerPage: 20,
      sortBy: "importTenderInfoId",
      descending: true
    },
    dialogUser: false,
    validUser: false,
    importTenderInfo: null,
    UserCpvs: null,
    types: [
      { id: 3, name: "Public" },
      { id: 5, name: "Free" },
      { id: 2, name: "Premium" },
      { id: 4, name: "Business" },
      { id: 6, name: "Bus Dev" },
      { id: 1, name: "Admin" }
    ],
    isActive: false,
    hasConnexionTender: false,
    hasConnexionBusiness: false,
    notifSend: false,
    loadingUserSynchroFull: false,
    cpvs: [],
    cpvItems: null,
    regions: [],
    regionItems: null,
    countries: [],
    countryItems: null,
    notEmptyRules: [v => !!v || "Data is required"]
  }),

  computed: {
    ...mapGetters([
      'getIsMobile',
      'getDataCpvs',
      'getCpvsLogoFromCode',
    ]),

    pages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) {
        return 0;
      }

      return Math.ceil(this.getImportTenderInfos().length / this.pagination.rowsPerPage);
    }
  },

  async mounted() {
    this.setHeaderShow(true)
    this.loadImportTenderInfoFacets()
    this.loadImportTenderInfos()
  },

  methods: {
    ...mapActions([
      "setHeaderShow",
      "loadCpvs",
    ]),

    async loadImportTenderInfos() {
      try {
        this.dataImportTenderInfos.loading = 0
        this.pagination.page = 1
        let filter = {}
        if (this.facets) {
          const fileSources = this.facets.fileSources.filter(a => a.selected).map(a => a.fileSource)
          if (fileSources) {
            filter.fileSources = fileSources
          }
          const mergeMethods = this.facets.mergeMethods.filter(a => a.selected).map(a => a.mergeMethod)
          if (mergeMethods) {
            filter.mergeMethods = mergeMethods
          }
          const statuss = this.facets.statuss.filter(a => a.selected).map(a => a.status)
          if (statuss) {
            filter.statuss = statuss
          }
        }
        const res = await this.$api.post("/TenderImport/importTenderInfos", { filter })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataImportTenderInfos.data = res.data.entries
        this.dataImportTenderInfos.loading = 1
      } catch (err) {
        this.dataImportTenderInfos.loading = -1
        this.$api.error(err, this)
      }
    },

    async loadImportTenderInfoFacets() {
      try {
        this.dataImportTenderInfoFacets.loading = 0
        let filter = {}
        const res = await this.$api.post("/TenderImport/importTenderInfoFacets", { filter })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataImportTenderInfoFacets.data = res.data
        this.facets = this.dataImportTenderInfoFacets.data
        for (const fileSource of this.facets.fileSources) {
          fileSource.selected = false
        }
        for (const mergeMethod of this.facets.mergeMethods) {
          mergeMethod.selected = false
        }
        for (const status of this.facets.statuss) {
          status.selected = false
        }
        this.dataImportTenderInfoFacets.loading = 1
      } catch (err) {
        this.dataImportTenderInfoFacets.loading = -1
        this.$api.error(err, this)
      }
    },

    getImportTenderInfos() {
      if (!this.dataImportTenderInfos.data) {
        return [];
      }
      let importTenderInfos = null;
      if (!this.search || this.search.trim() === "") {
        importTenderInfos = this.dataImportTenderInfos.data;
      } else {
        importTenderInfos = this.dataImportTenderInfos.data.filter(
          a =>
            a.username.toLowerCase().includes(this.search.toLowerCase()) ||
            a.email.toLowerCase().includes(this.search.toLowerCase())
        );
      }
      return importTenderInfos;
    },

    importTenderInfoOpen(importTenderInfo) {
      this.$refs.ImportTenderInfoDialog.show(importTenderInfo)
    },

    importTenderInfoSetPremium(importTenderInfo) {
      this.dataImportTenderInfos.loading = 0;
      this.$api
        .post("/User/SetPremium", { importTenderInfoId: importTenderInfo.importTenderInfoId })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.loadImportTenderInfos();
        })
        .catch(err => {
          this.dataImportTenderInfos.loading = -1;
          this.$api.error(err, this);
        });
    },

    logAs(importTenderInfo) {
      this.$router.replace({
        name: "Login",
        params: { email: importTenderInfo.email, password: importTenderInfo.password }
      });
    },

    importTenderInfoSynchro() {
      this.dataImportTenderInfos.loading = 0;
      this.$api
        .post("/User/Synchro")
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.loadImportTenderInfos();
        })
        .catch(err => {
          this.dataImportTenderInfos.loading = -1;
          this.$api.error(err, this);
        });
    },

    getUserCpvs() {
      this.UserCpvs = null;
      this.$api
        .post("/User/UserCpvs", {
          importTenderInfoId: this.importTenderInfo.importTenderInfoId
        })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.UserCpvs = res.data;
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    },

    importTenderInfoSynchroFull() {
      this.loadingUserSynchroFull = true;
      this.$api
        .post("/User/SynchroFull", {
          importTenderInfoId: this.importTenderInfo.importTenderInfoId
        })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.importTenderInfo = {
            ...this.importTenderInfo,
            ...res.data
          }
          let importTenderInfoFind = this.dataImportTenderInfos.data.find(
            a => a.importTenderInfoId === this.importTenderInfo.importTenderInfoId
          );
          if (importTenderInfoFind) {
            this.importTenderInfoFind = {
              ...importTenderInfoFind,
              ...res.data
            }
          }
          this.getUserCpvs();
          this.loadImportTenderInfos();
        })
        .catch(err => {
          this.$api.error(err, this);
        })
        .then(() => {
          this.loadingUserSynchroFull = false;
        });
    },

    membershipSynchro() {
      this.dataImportTenderInfos.loading = 0;
      this.$api
        .post("/Hivebrite/MembershipSynchro")
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.loadImportTenderInfos();
        })
        .catch(err => {
          this.dataImportTenderInfos.loading = -1;
          this.$api.error(err, this);
        });
    },

    passwordGet() {
      this.importTenderInfo.password = Math.random()
        .toString(36)
        .slice(-10);
    },

    getStatusLabel(status) {
      if (status === 1) {
        return "Ok"
      } else if (status === 5) {
        return "Merge"
      } else if (status === -10) {
        return "Delete"
      }
      return status
    },

    async importTenderInfoAddUpdate() {
      try {
        this.dataImportTenderInfos.loading = 0;
        this.importTenderInfo.notifCpvs = this.cpvs.join();
        this.importTenderInfo.notifRegions = this.regions.join();
        this.importTenderInfo.notifCountries = this.countries.join();
        const res = await this.$api.post("/User/AddUpdate", {
          importTenderInfo: this.importTenderInfo
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.loadImportTenderInfos();
        this.dialogUser = false;
      } catch (err) {
        this.dataImportTenderInfos.loading = -1;
        this.$api.error(err, this);
      }
    }
  }
}
</script>

<style>
@media screen and (max-width: 600px) {
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 0px 0px;
  }
  .importTenderInfo-type-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 0px 0px;
  }
}
@media screen and (min-width: 600px) {
  .content-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    grid-gap: 0px 0px;
  }
  .importTenderInfo-type-grid {
    display: grid;
    grid-template-columns: 1fr 200px;
    grid-gap: 0px 30px;
  }
}

.v-input--selection-controls__input {
  height: 18px;
  margin-right: 0px;
}

.groupe-item:hover label {
  color: #0096db;
}
.groupe-item-active label {
  color: #3a4570 !important;
  font-weight: 600;
}

.result-count {
  padding: .1rem .4rem;
  font-size: .7rem;
  color: #3a4570;
  background-color: #dfe2ee;
  border-radius: 8px;
  white-space: nowrap;
}
</style>
