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
        <div class="text-center">
          <v-btn
            rounded
            color="blue-grey lighten-5"
            @click="organizationSynchro()"
            title="Organization synchro"
          >
            <v-icon size="14" class="pr-2">fa-refresh</v-icon>
            Organization
          </v-btn>
        </div>

        <v-card class="pa-3 mt-3">
          <div class="title">CPV</div>
          <v-text-field
            v-model="cpvSearch"
            label="Search"
            append-icon="fa-search"
            class="mt-1"
          />
          <v-checkbox
            v-for="cpv in getCpvs"
            :key="cpv.code"
            v-model="cpv.checked"
            input-value="true"
            :value="cpv.code"
            :label="cpv.name"
            hide-details
            class="groupe-item ma-0"
            :class="cpv.checked ? 'groupe-item-active' : ''"
          >
            <div slot="label">
              {{ cpv.name }}
              <span class="groupe-item-bulle">{{ cpv.count }}</span>
            </div>
          </v-checkbox>
        </v-card>
      </perfect-scrollbar>
      <div :class="!getIsMobile ? 'pa-0' : 'px-2'" style="overflow: auto;">
        <div
          v-if="!dataOrganizations.loading || dataOrganizations.loading === 0"
          class="pa-5 text-center"
        >
          <div class="pa-2 grey--text">Loading...</div>
          <v-progress-circular :size="50" color="grey" indeterminate />
        </div>
        <div
          v-else-if="dataOrganizations.loading === -1"
          class="pa-5 text-center"
        >
          <v-icon class="red--text">error</v-icon>
          <div class="pa-2 red--text">Error while loading data</div>
        </div>
        <div
          v-else-if="
            dataOrganizations.loading === 1 &&
              dataOrganizations.data.length === 0
          "
          class="pa-5 text-center"
        >
          <div class="pa-2 black--text">No organization</div>
        </div>
        <div v-else>
          <v-card-title v-if="getOrganizations.length > 0">
            <v-chip
              v-if="!getIsMobile"
              outlined
              color="grey"
              title="Organization count"
              class="pl-2"
            >
              <v-icon left>fa-bank</v-icon>{{ getOrganizations.length }}
            </v-chip>
            <v-spacer></v-spacer>
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
              small
              color="blue-grey lighten-5"
              title="refresh organization liste"
              @click="loadOrganizations()"
            >
              <v-icon>fa-refresh</v-icon>
            </v-btn>
          </v-card-title>
          <div
            :style="
              !getIsMobile ? 'height: calc(100vh - 248px); overflow: auto;' : ''
            "
          >
            <v-data-table
              :headers="headers"
              :items="getOrganizations"
              hide-actions
              :pagination.sync="pagination"
              class="elevation-1"
              sort-icon="fa-caret-down"
            >
              <template slot="items" slot-scope="props">
                <tr
                  @click="organizationOpen(props.item)"
                  style="cursor: pointer;"
                >
                  <td class="text-center caption red--text">
                    {{ props.item.organizationId }}
                  </td>
                  <td class="blue-grey--text body-2 font-weight-bold">
                    {{ props.item.name }}
                  </td>
                  <td class="blue-grey--text body-2">
                    <div v-if="props.item.cpvs && props.item.cpvs.length > 0">
                      <span
                        style="color: #AAAAAA; border: 1px solid #AAAAAA; border-radius: 10px; padding: 0px 4px 0px 8px; margin-right: 5px; text-align: center;"
                      >
                        {{ props.item.cpvs.length }}
                      </span>
                      {{
                        props.item.cpvs
                          .slice(0, 4)
                          .map(a => a.name)
                          .join(", ")
                      }}
                      <span v-if="props.item.cpvs.length > 4">, ...</span>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
          <div :class="!getIsMobile ? 'text-center py-1' : 'text-center py-3'">
            <v-pagination
              v-model="pagination.page"
              :length="pages"
            ></v-pagination>
          </div>
        </div>
      </div>
    </div>

    <v-dialog
      v-if="dialogOrganization"
      v-model="dialogOrganization"
      scrollable
      :max-width="!getIsMobile ? '700px' : null"
      :fullscreen="getIsMobile"
      :hide-overlay="getIsMobile"
    >
      <v-card v-if="organization" style="position: relative;">
        <v-toolbar dark dense color="blue-grey lighten-4 black--text">
          <div class="title">
            Organization #{{ organization.organizationId }}
          </div>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon light @click="dialogOrganization = false">
              <v-icon color="grey darken-2" style="font-size: 30px;">
                close
              </v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text>
          <v-form
            v-model="validOrganization"
            ref="form"
            lazy-validation
            class="pa-4"
          >
            <v-text-field
              label="name *"
              v-model="organization.name"
              :rules="notEmptyRules"
              required
            />

            <div v-if="countryItems">
              <v-autocomplete
                label="Country"
                v-model="organizationCountrys"
                :disabled="false"
                :items="countryItems"
                chips
                item-text="name"
                item-value="name"
                multiple
              >
                <template slot="selection" slot-scope="data">
                  <v-chip
                    :selected="data.selected"
                    outlined
                    close
                    color="black"
                    class="chip--select-multi"
                    @input="removeCountry(data.item)"
                  >
                    {{ data.item.name }}
                  </v-chip>
                </template>
                <template slot="item" slot-scope="data">
                  <template v-if="typeof data.item !== 'object'">
                    <v-list-item-content v-text="data.item"></v-list-item-content>
                  </template>
                  <template v-else>
                    <img
                      :src="data.item.avatar"
                      class="pa-2"
                      style="height: 40px; width: 40px;"
                    />
                    <v-list-item-content>
                      <v-list-item-title v-html="data.item.name" />
                      <v-list-item-subtitle
                        v-html="`${data.item.code} - ${data.item.group}`"
                      />
                    </v-list-item-content>
                  </template>
                </template>
              </v-autocomplete>
            </div>

            <div v-if="!getIsMobile && organizationCpvs">
              <div class="cpv-grid">
                <div class="grey--text text--darken-1 pt-3">CPV</div>
                <div></div>
                <div></div>
                <div></div>
                <div>
                  <v-menu
                    bottom
                    left
                    origin="top right"
                    transition="scale-transition"
                    max-height="400px"
                  >
                    <template slot="activator" slot-scope="{ on }">
                      <v-btn icon color="green--text" v-on="on" title="Add CPV">
                        <v-icon>fa-plus</v-icon>
                      </v-btn>
                    </template>

                    <v-card>
                      <v-card-actions
                        class="white"
                        style=" position: -webkit-sticky; position: sticky; top: 0; z-index: 100;"
                      >
                        <v-text-field
                          v-model="cpvItemsSearch"
                          hide-details
                          prepend-icon="fa-search"
                          single-line
                          @click.stop
                        />
                        <v-spacer></v-spacer>
                        <v-btn text @click="menu = false">Cancel</v-btn>
                      </v-card-actions>
                      <v-list>
                        <v-list-item
                          v-for="(item, i) in getCpvItems"
                          :key="i"
                          @click="organizationCpvAdd(item)"
                        >
                          <template v-if="item.header">
                            <v-list-item-title
                              class="blue-grey--text text--lighten-2"
                              >{{ item.header }}</v-list-item-title
                            >
                          </template>
                          <template v-else>
                            <v-list-item-avatar>
                              <img :src="item.avatar" />
                            </v-list-item-avatar>
                            <v-list-item-title>{{ item.name }}</v-list-item-title>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </v-menu>
                </div>
              </div>
              <div
                v-for="organizationCpv in organizationCpvs.filter(
                  a => !a.isDelete
                )"
                :key="organizationCpv.code"
                class="cpv-grid"
              >
                <div>
                  <v-avatar size="40">
                    <img :src="organizationCpv.avatar" class="pa-1" />
                  </v-avatar>
                </div>
                <div class="pt-2 font-weight-bold">
                  {{ organizationCpv.name }}
                </div>
                <div>
                  <div v-if="organizationCpv.isManual" class="pt-2">
                    <v-rating v-model="organizationCpv.rating" />
                  </div>
                  <v-btn
                    v-else
                    small
                    color="blue-grey"
                    class="white--text"
                    dark
                    @click="organizationCpv.isManual = true"
                  >
                    Add manual rating
                  </v-btn>
                </div>
                <div class="pt-2">
                  <v-icon
                    size="30"
                    class="blue-grey--text mr-2"
                    :class="
                      organizationCpv.isManual
                        ? 'text--lighten-2'
                        : 'text--lighten-5'
                    "
                    title="Manual"
                  >
                    fa-user
                  </v-icon>
                  <v-icon
                    size="30"
                    class="blue-grey--text"
                    :class="
                      organizationCpv.isSynchro
                        ? 'text--lighten-2'
                        : 'text--lighten-5'
                    "
                    title="Automatic synchronization"
                  >
                    refresh
                  </v-icon>
                </div>
                <div>
                  <v-btn
                    v-if="organizationCpv.isSynchro"
                    text
                    icon
                    color="red"
                    title="Exclude CPV"
                  >
                    <v-icon @click="organizationCpvExclude(organizationCpv)"
                      >fa-ban</v-icon
                    >
                  </v-btn>
                  <v-btn v-else text icon color="red" title="Delete CPV">
                    <v-icon @click="organizationCpvDelete(organizationCpv)"
                      >delete</v-icon
                    >
                  </v-btn>
                </div>
              </div>
            </div>

            <div
              v-if="
                !getIsMobile &&
                  organizationCpvs &&
                  organizationCpvs.filter(a => a.isDelete).length > 0
              "
            >
              <div>
                <div class="grey--text text--darken-1 pt-3">CPV exclude</div>
              </div>
              <div
                v-for="organizationCpv in organizationCpvs.filter(
                  a => a.isDelete
                )"
                :key="organizationCpv.code"
                class="cpv-grid-exclude"
              >
                <div>
                  <v-avatar size="40">
                    <img :src="organizationCpv.avatar" class="pa-1" />
                  </v-avatar>
                </div>
                <div class="pt-2 font-weight-bold">
                  {{ organizationCpv.name }}
                </div>
                <div>
                  <v-btn text icon color="green" title="Restore CPV">
                    <v-icon @click="organizationCpvRestore(organizationCpv)"
                      >fa-check</v-icon
                    >
                  </v-btn>
                  <v-btn text icon color="red" title="Delete CPV">
                    <v-icon @click="organizationCpvDelete(organizationCpv)"
                      >delete</v-icon
                    >
                  </v-btn>
                </div>
              </div>
            </div>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer />
          <v-btn color="green darken-1" text @click="organizationAddUpdate()">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import constRegions from '@/assets/constants/regions.json'

export default {
  name: 'SettingOrganization',

  data: () => ({
    moment,
    search: null,
    cpvSearch: null,
    dataOrganizations: {
      loading: null
    },
    typeGroup: 0,
    headers: [
      { text: " Id", value: "organizationId", align: "center" },
      { text: "Name ", value: "name", align: "left", sortable: true },
      { text: "CPV ", value: "cpvs", align: "left", sortable: true },
    ],
    pagination: {
      rowsPerPage: 20,
      sortBy: "name",
      descending: false
    },
    dialogOrganization: false,
    validOrganization: false,
    organization: null,
    types: [
      { id: 1, name: "Admin" },
      { id: 2, name: "Premium" },
      { id: 3, name: "Public" }
    ],
    cpvs: [],
    organizationCpv: null,
    organizationCpvs: null,
    cpvItems: null,
    cpvItemsSearch: null,
    organizationCountrys: null,
    countryItems: null,
    notEmptyRules: [v => !!v || "Data is required"]
  }),

  computed: {
    ...mapGetters([
      'getIsMobile',
      'getDataCpvs',
    ]),

    pages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      )
        return 0;

      return Math.ceil(
        this.getOrganizations.length / this.pagination.rowsPerPage
      );
    },

    getCpvs() {
      if (!this.cpvs) {
        return [];
      }
      let cpvs = null;
      if (!this.cpvSearch || this.cpvSearch.trim() === "") {
        cpvs = this.cpvs;
      } else {
        cpvs = this.cpvs.filter(a =>
          a.name.toLowerCase().includes(this.cpvSearch.toLowerCase())
        );
      }
      return cpvs;
    },

    getCpvItems() {
      if (!this.cpvItems) {
        return [];
      }
      let cpvItems = this.cpvItems.filter(
        a =>
          a &&
          a.code &&
          !this.organizationCpvs.map(a => a.code).includes(a.code)
      );
      if (this.cpvItemsSearch && this.cpvItemsSearch.trim() !== "") {
        cpvItems = cpvItems.filter(
          a =>
            a &&
            a.name &&
            a.name.toLowerCase().includes(this.cpvItemsSearch.toLowerCase())
        );
      }
      return cpvItems;
    },

    getOrganizations() {
      if (!this.dataOrganizations || !this.dataOrganizations.data) {
        return [];
      }
      let organizations = null;
      if (!this.search || this.search.trim() === "") {
        organizations = this.dataOrganizations.data;
      } else {
        organizations = this.dataOrganizations.data.filter(a =>
          a.name.toLowerCase().includes(this.search.toLowerCase())
        );
      }
      let cpvCodes = this.getCpvs.filter(a => a.checked).map(c => c.code);
      if (cpvCodes.length > 0) {
        organizations = organizations.filter(a =>
          a.cpvs.map(b => b.code).some(r => cpvCodes.indexOf(r) >= 0)
        );
      }
      return organizations;
    }
  },

  async mounted() {
    await this.loadCpvs()
    this.loadOrganizations()
    // this.setHeaderShow(false)

    // Create CPV list
    this.cpvItems = [];
    let constCpvSort = this.getDataCpvs.data.sort((a, b) => {
      if (a.category < b.category) {
        return -1;
      }
      if (a.category > b.category) {
        return 1;
      }
      return 0;
    });
    let categoryCurrent = null;
    for (let cpv of constCpvSort) {
      if (!cpv.active || !cpv.code) {
        continue;
      }
      if (categoryCurrent !== cpv.category) {
        this.cpvItems.push({
          header: cpv.category && cpv.category !== "" ? cpv.category : "Other"
        });
        categoryCurrent = cpv.category;
      }
      this.cpvItems.push({
        name: cpv.label,
        code: cpv.code,
        active: cpv.active,
        group: cpv.category && cpv.category !== "" ? cpv.category : "Other",
        avatar:
          cpv && cpv.logo && cpv.logo != ""
            ? cpv.logo
            : "https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png"
      });
    }

    // Create country list
    this.countryItems = [];
    for (let region of constRegions) {
      this.countryItems.push({
        header: region.label
      });

      if (region.countrys) {
        for (let country of region.countrys) {
          this.countryItems.push({
            name: country,
            code: country,
            group: region.label,
            avatar: "https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png"
          });
        }
      }
      if (region.regions) {
        for (let regionSub of region.regions) {
          for (let country of regionSub.countrys) {
            this.countryItems.push({
              name: country,
              code: country,
              group: regionSub.label,
              avatar: "https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png"
            });
          }
        }
      }
    }
  },

  methods: {
    ...mapActions([
      'setHeaderShow',
      'loadCpvs',
    ]),

    loadOrganizations() {
      this.dataOrganizations.loading = 0;
      let filter = {};
      if (this.typeGroup) {
        filter.type = this.typeGroup;
      }
      this.$api
        .post("/Organization/List", { filter })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.dataOrganizations.data = res.data;
          this.dataOrganizations.loading = 1;
          this.initCpvs();
        })
        .catch(err => {
          this.dataOrganizations.loading = -1;
          this.$api.error(err, this);
        });
    },

    initCpvs() {
      this.cpvs = [];
      for (let organization of this.dataOrganizations.data) {
        if (organization.cpvs) {
          for (let cpv of organization.cpvs) {
            let cpvFound = this.cpvs.find(a => a.code === cpv.code);
            if (!cpvFound) {
              cpvFound = {
                code: cpv.code,
                name: cpv.name,
                count: 1,
                checked: false
              };
              this.cpvs.push(cpvFound);
            } else {
              cpvFound.count++;
            }
          }
        }
      }
      this.cpvs.sort((a, b) => {
        if (a.count < b.count) {
          return 1;
        }
        if (a.count > b.count) {
          return -1;
        }
        return 0;
      });
    },

    remove(item) {
      const index = this.organizationCpv.indexOf(item.name);
      if (index >= 0) {
        this.organizationCpv.splice(index, 1);
      }
    },

    organizationOpen(organization) {
      this.dialogOrganization = true;
      this.organization = JSON.parse(JSON.stringify(organization));
      this.organizationCountrys = [];
      if (this.organization.countrys) {
        this.organizationCountrys = this.organization.countrys.split("|");
      }
      if (this.organization.cpvs) {
        this.organizationCpv = this.organization.cpvs.map(a => a.name.trim());
      } else {
        this.organizationCpv = [];
      }
      this.organizationCpvs = [];
      for (let cpv of this.organization.cpvs) {
        let cpvFound = this.organizationCpvs.find(a => a.code === cpv.code);
        let constCpvFound = this.getDataCpvs.data.find(
          a => a.code === parseInt(cpv.code, 10)
        );
        if (!cpvFound) {
          cpvFound = {
            code: cpv.code,
            name: cpv.name,
            isSynchro: false,
            isManual: false,
            isDelete: false,
            rating: cpv.rating,
            avatar:
              constCpvFound && constCpvFound.logo && constCpvFound.logo != ""
                ? constCpvFound.logo
                : "https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png"
          };
          this.organizationCpvs.push(cpvFound);
        }
        if (cpv.origineType === 1) {
          cpvFound.isSynchro = true;
        }
        if (cpv.origineType === 2) {
          cpvFound.isManual = true;
        }
        if (cpv.origineType === -1) {
          cpvFound.isDelete = true;
        }
      }
    },

    organizationCpvAdd(cpv) {
      this.organizationCpvs.push({
        code: cpv.code,
        name: cpv.name,
        isSynchro: false,
        isManual: true,
        isDelete: false,
        rating: 0,
        avatar: cpv.avatar
      });
    },

    organizationCpvExclude(organizationCpv) {
      organizationCpv.isDelete = true;
    },

    organizationCpvRestore(organizationCpv) {
      organizationCpv.isDelete = false;
    },

    organizationCpvDelete(organizationCpv) {
      this.organizationCpvs = this.organizationCpvs.filter(
        a => a.code !== organizationCpv.code
      );
    },

    removeCountry(item) {
      const index = this.organizationCountrys.indexOf(item.name);
      if (index >= 0) this.organizationCountrys.splice(index, 1);
    },

    organizationSetPremium(organization) {
      this.dataOrganizations.loading = 0;
      this.$api
        .post("/Organization/SetPremium", {
          organizationId: organization.organizationId
        })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.loadOrganizations();
        })
        .catch(err => {
          this.dataOrganizations.loading = -1;
          this.$api.error(err, this);
        });
    },

    organizationSynchro() {
      this.dataOrganizations.loading = 0;
      this.$api
        .post("/Hivebrite/CompanieSynchro")
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.loadOrganizations();
        })
        .catch(err => {
          this.dataOrganizations.loading = -1;
          this.$api.error(err, this);
        });
    },

    membershipSynchro() {
      this.dataOrganizations.loading = 0;
      this.$api
        .post("/Hivebrite/MembershipSynchro")
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.loadOrganizations();
        })
        .catch(err => {
          this.dataOrganizations.loading = -1;
          this.$api.error(err, this);
        });
    },

    passwordGet() {
      this.organization.password = Math.random()
        .toString(36)
        .slice(-10);
    },

    organizationAddUpdate() {
      this.dataOrganizations.loading = 0;
      this.organization.name = this.organization.name.trim();
      this.organization.countrys = this.organizationCountrys.join("|");
      let cpvs = [];
      for (let cpvItem of this.organizationCpvs) {
        if (cpvItem.isSynchro) {
          cpvs.push({
            code: cpvItem.code,
            name: cpvItem.name.trim(),
            origineType: 1
          });
        }
        if (cpvItem.isManual) {
          cpvs.push({
            code: cpvItem.code,
            name: cpvItem.name.trim(),
            origineType: 2,
            rating: cpvItem.rating
          });
        }
        if (cpvItem.isDelete) {
          cpvs.push({
            code: cpvItem.code,
            name: cpvItem.name.trim(),
            origineType: -1
          });
        }
      }
      this.organization.cpvs = cpvs;
      this.$api
        .post("/Organization/AddUpdate", { organization: this.organization })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.loadOrganizations();
          this.dialogOrganization = false;
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    }
  }
};
</script>

<style>
@media screen and (max-width: 600px) {
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 0px 0px;
  }

  .cpv-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 0px 0px;
  }

  .cpv-grid-exclude {
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

  .cpv-grid {
    display: grid;
    grid-template-columns: 50px 1fr 180px 60px 40px;
    grid-gap: 0px 0px;
  }

  .cpv-grid-exclude {
    display: grid;
    grid-template-columns: 50px 1fr 110px;
    grid-gap: 0px 0px;
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
.groupe-item-bulle {
  padding: 0.1rem 0.4rem;
  font-size: 0.8rem;
  color: #3a4570;
  background-color: #dfe2ee;
  border-radius: 8px;
}
</style>
