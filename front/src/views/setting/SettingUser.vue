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
        <div class="text-center mb-3">
          <v-btn
            rounded
            color="success"
            class="ma-1"
            dark
          >
            Add user
          </v-btn>
          <v-btn
            rounded
            color="blue-grey lighten-5"
            class="ma-1"
            @click="userSynchro()"
            title="User synchro"
          >
            <v-icon size="14" class="pr-2">fa-refresh</v-icon>
            User
          </v-btn>
          <v-btn
            rounded
            class="ma-1"
            color="blue-grey lighten-5"
            @click="membershipSynchro()"
            title="Membership synchro"
          >
            <v-icon size="14" class="pr-2">fa-refresh</v-icon>
            Membership
          </v-btn>
        </div>

        <v-card class="pa-3 mb-3">
          <div class="title pb-3">Type</div>
          <v-radio-group
            v-model="typeGroup"
            class="ma-0"
            @change="loadUsers()"
          >
            <v-radio label="All" :value="0" />
            <v-radio
              v-for="(type, index) in types"
              :key="`type${index}`"
              :label="type.name"
              :value="type.id"
            />
          </v-radio-group>
        </v-card>

        <v-card class="pa-3 mb-3">
          <v-radio-group
            v-model="typeGroup"
            hide-details
            class="ma-0"
            @change="loadUsers()"
          >
            <v-checkbox
              v-model="isActive"
              input-value="true"
              hide-details
              class="groupe-item mx-0 my-1"
              :class="isActive ? 'groupe-item-active' : ''"
            >
              <div slot="label">
                Is active
              </div>
            </v-checkbox>
            <v-checkbox
              v-model="hasConnexionTender"
              input-value="true"
              hide-details
              class="groupe-item mx-0 my-1"
              :class="hasConnexionTender ? 'groupe-item-active' : ''"
            >
              <div slot="label">
                Tender connexion
              </div>
            </v-checkbox>
            <v-checkbox
              v-model="hasConnexionBusiness"
              input-value="true"
              hide-details
              class="groupe-item mx-0 my-1"
              :class="hasConnexionBusiness ? 'groupe-item-active' : ''"
            >
              <div slot="label">
                Business+ connexion
              </div>
            </v-checkbox>
            <v-checkbox
              v-model="notifSend"
              input-value="true"
              hide-details
              class="groupe-item mx-0 my-1"
              :class="notifSend ? 'groupe-item-active' : ''"
            >
              <div slot="label">
                Sent notification
              </div>
            </v-checkbox>
          </v-radio-group>
        </v-card>
      </perfect-scrollbar>
      <div :class="!getIsMobile ? 'pa-0' : 'px-2'" style="overflow: auto;">
        <div
          v-if="!dataUsers.loading || dataUsers.loading === 0"
          class="pa-5 text-center"
        >
          <div class="pa-2 grey--text">Loading...</div>
          <v-progress-circular :size="50" color="blue-grey lighten-4" indeterminate />
        </div>
        <div v-else-if="dataUsers.loading === -1" class="pa-5 text-center">
          <v-icon class="red--text">error</v-icon>
          <div class="pa-2 red--text">Error while loading data</div>
        </div>
        <div
          v-else-if="dataUsers.loading === 1 && dataUsers.data.length === 0"
          class="pa-5 text-center"
        >
          <div class="pa-2 black--text">No user</div>
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
              <v-icon left>fa-users</v-icon>{{ getUsers().length }}
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
              title="refresh user liste"
              class="ml-2"
              @click="loadUsers()"
            >
              <v-icon>fa-sync-alt</v-icon>
            </v-btn>
          </v-card-title>
          <div :style="!getIsMobile ? 'height: calc(100vh - 248px); overflow: auto;' : ''">
            <v-data-table
              :headers="headers"
              :items="getUsers()"
              class="elevation-1"
              header-props.sort-icon="fa-caret-down"
            >
              <template v-slot:item="{ item }">
                <tr @click="userOpen(item)" style="cursor: pointer;">
                  <td>
                    <v-badge color="trensparente" bottom overlap>
                      <template v-slot:badge>
                        <v-icon
                          v-if="!item.status"
                          small
                          class="red--text"
                          style="margin-top: -14px; text-shadow: 0px 0px 3px #000000; font-size: 10px;"
                          title="Inactive user"
                        >
                          fa-dot-circle
                        </v-icon>
                      </template>
                      <v-avatar v-if="item.photo">
                        <img :src="item.photo" alt="-" />
                      </v-avatar>
                    </v-badge>
                  </td>
                  <td class="text-center pl-0">
                    <v-chip v-if="item.type === 1" outlined color="red">
                      Admin
                    </v-chip>
                    <v-chip v-else-if="item.type === 2" outlined color="blue">
                      Premium
                    </v-chip>
                    <v-chip v-else-if="item.type === 4" outlined color="green">
                      Business +
                    </v-chip>
                    <v-chip v-else-if="item.type === 5" outlined color="grey">
                      Free
                    </v-chip>
                    <v-chip v-else-if="item.type === 3" outlined color="grey">
                      Public
                    </v-chip>
                  </td>
                  <td class="blue-grey--text body-2 font-weight-bold">
                    {{ item.username }}
                  </td>
                  <td>{{ item.email }}</td>
                  <td class="text-center caption red--text">
                    {{ item.userId }}
                  </td>
                  <td class="text-center caption red--text">
                    <v-icon v-if="item.membershipFree" color="green"
                      >fa-check</v-icon
                    >
                  </td>
                  <td class="text-xs-right text-no-wrap">
                    <v-btn
                      v-if="item.type === 3"
                      small
                      class="blue white--text"
                      title="Set user premium"
                      @click="userSetPremium(item)"
                      >Set to premium</v-btn
                    >
                    <v-btn
                      v-if="item.type !== 3"
                      small
                      class="blue white--text"
                      title="Set user premium"
                      @click="logAs(item)"
                    >
                      Log as
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
        </div>
      </div>
    </div>

    <v-dialog
      v-if="dialogUser"
      v-model="dialogUser"
      scrollable
      :max-width="!getIsMobile ? '700px' : null"
      :fullscreen="getIsMobile"
      :hide-overlay="getIsMobile"
    >
      <v-card v-if="user" style="position: relative;">
        <v-toolbar dark dense color="blue-grey lighten-4 black--text">
          <div class="title">
            <v-avatar v-if="user.photo" size="35">
              <img :src="user.photo" alt="-" />
            </v-avatar>
            User #{{ user.userId }}
          </div>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon light @click="dialogUser = false">
              <v-icon color="grey darken-2" style="font-size: 30px;">
                fa-times
              </v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text>
          <v-form v-model="validUser" ref="form" lazy-validation class="pa-4">
            <v-text-field
              label="Username *"
              v-model="user.username"
              :rules="notEmptyRules"
              required
            />

            <v-text-field
              label="Email *"
              v-model="user.email"
              :rules="notEmptyRules"
              required
            />

            <v-text-field
              label="Password"
              v-model="user.password"
              type="text"
              required
              :append-icon="'fa-cog'"
              @click:append="passwordGet()"
            />

            <div class="user-type-grid">
              <div>
                <v-select
                  label="Type *"
                  v-model="user.type"
                  item-text="name"
                  item-value="id"
                  :rules="notEmptyRules"
                  :items="types"
                  required
                />
              </div>
              <div>
                <v-checkbox
                  v-model="user.membershipFree"
                  label="Free membership"
                />
              </div>
            </div>

            <v-text-field
              label="Dashboard"
              v-model="user.dashboardUrl"
              type="text"
              required
            />
          </v-form>
          <div class="px-0 pb-5">
            <v-expansion-panels inset multiple focusable>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Interested by following business opportunities (CPV)
                </v-expansion-panel-header>
                <v-expansion-panel-content class="pt-3">
                  <div
                    v-if="!UserCpvs || !UserCpvs.length"
                    class="grey--text"
                  >
                    none
                  </div>
                  <div v-else>
                    <v-chip
                      v-for="(cpv, index) in UserCpvs"
                      :key="index"
                      outlined
                      class="ma-1"
                    >
                      <v-avatar class="mr-1">
                        <img
                          :src="getCpvsLogoFromCode([cpv.cpvCode])"
                          alt=""
                        />
                      </v-avatar>
                      {{ cpv.cpvName }}
                    </v-chip>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Interested in business opportunities in these areas
                </v-expansion-panel-header>
                <v-expansion-panel-content class="pt-3">
                  <div
                    v-if="!user.regions || !user.regions === ''"
                    class="grey--text"
                  >
                    none
                  </div>
                  <div v-else>
                    <v-chip
                      v-for="(region, index) in user.regions.split(',')"
                      :key="index"
                      outlined
                      class="ma-1"
                    >
                      {{ region }}
                    </v-chip>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Notify options
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-autocomplete
                    label="CPV"
                    v-model="cpvs"
                    :items="cpvItems"
                    chips
                    item-text="name"
                    item-value="code"
                    multiple
                    autocomplete="none"
                  >
                    <template slot="selection" slot-scope="data">
                      <v-chip
                        :input-value="data.selected"
                        close
                        class="chip--select-multi"
                        @click:close="cpvRemove(data.item)"
                      >
                        <v-avatar>
                          <img :src="data.item.avatar" class="pa-1" />
                        </v-avatar>
                        {{ data.item.name }}
                      </v-chip>
                    </template>
                    <template slot="item" slot-scope="data">
                      <template v-if="typeof data.item !== 'object'">
                        <v-list-item-content
                          v-text="data.item"
                        ></v-list-item-content>
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
                  <v-autocomplete
                    label="Regions"
                    v-model="regions"
                    :items="regionItems"
                    multiple
                    autocomplete="none"
                  >
                    <template slot="selection" slot-scope="data">
                      <v-chip
                        :input-value="data.selected"
                        close
                        class="chip--select-multi"
                        @click:close="regionRemove(data.item)"
                      >
                        {{ data.item }}
                      </v-chip>
                    </template>
                  </v-autocomplete>
                  <v-switch
                    v-model="user.notifSend"
                    :label="
                      `Send notifications: ${user.notifSend ? 'Yes' : 'No'}`
                    "
                  />
                  <v-divider />
                  <v-switch
                    v-model="user.notifPostEmail"
                    :label="
                      `New user post: ${user.notifPostEmail ? 'Yes' : 'No'}`
                    "
                  />
                  <v-switch
                    v-model="user.notifTripEmail"
                    :label="
                      `New trip around me: ${
                        user.notifTripEmail ? 'Yes' : 'No'
                      }`
                    "
                  />
                  <v-switch
                    v-model="user.notifEventEmail"
                    :label="`Event: ${user.notifEventEmail ? 'Yes' : 'No'}`"
                  />
                  <v-switch
                    v-model="user.notifCommentEmail"
                    :label="
                      `Comment: ${user.notifCommentEmail ? 'Yes' : 'No'}`
                    "
                  />
                  <v-switch
                    v-model="user.notifVentureEmail"
                    :label="
                      `Project comment: ${
                        user.notifVentureEmail ? 'Yes' : 'No'
                      }`
                    "
                  />
                  <v-switch
                    v-model="user.notifBusinessRequest"
                    :label="
                      `Business opportunities: ${
                        user.notifBusinessRequest ? 'Yes' : 'No'
                      }`
                    "
                  />
                  <v-switch
                    v-model="user.notifDigestEmail"
                    :label="`Digest: ${user.notifDigestEmail ? 'Yes' : 'No'}`"
                  />
                  <v-switch
                    v-model="user.notifCurrentLocationEmail"
                    :label="
                      `Current location: ${
                        user.notifCurrentLocationEmail ? 'Yes' : 'No'
                      }`
                    "
                  />
                  <v-switch
                    v-model="user.notifEmailingComEmail"
                    :label="
                      `Emailing campaign: ${
                        user.notifEmailingComEmail ? 'Yes' : 'No'
                      }`
                    "
                  />
                  <v-switch
                    v-model="user.notifForumPostEmail"
                    :label="
                      `Forum Post Email: ${
                        user.notifForumPostEmail ? 'Yes' : 'No'
                      }`
                    "
                  />
                  <v-switch
                    v-model="user.notifContactByPost"
                    :label="
                      `Contact by post: ${
                        user.notifContactByPost ? 'Yes' : 'No'
                      }`
                    "
                  />
                  <v-switch
                    v-model="user.notifContactByPhone"
                    :label="
                      `notifContactByPhone: ${
                        user.notifContactByPhone ? 'Yes' : 'No'
                      }`
                    "
                  />
                  <v-switch
                    v-model="user.notifContactBySms"
                    :label="
                      `notifContactBySms: ${
                        user.notifContactBySms ? 'Yes' : 'No'
                      }`
                    "
                  />
                  <v-switch
                    v-model="user.doNotContact"
                    :label="
                      `Do not contact: ${user.doNotContact ? 'Yes' : 'No'}`
                    "
                  />
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          <div class="px-3 pt-3">
            <div>
              <span class="grey--text pr-2">Status:</span>
              {{ user.status ? "Active" : "Inactive" }}
            </div>
            <div>
              <span class="grey--text pr-2">Last tender connexion:</span>
              <span v-if="user.connexionTender">
                {{ moment(user.connexionTender).format("YYYY-MM-DD HH:mm:ss") }}
                <span class="grey--text pl-1">
                  ({{ moment(user.connexionTender).fromNow() }})
                </span>
              </span>
            </div>
            <div>
              <span class="grey--text pr-2">Last business+ connexion:</span>
              <span v-if="user.connexionBusiness">
                {{
                  moment(user.connexionBusiness).format("YYYY-MM-DD HH:mm:ss")
                }}
                <span class="grey--text pl-1">
                  ({{ moment(user.connexionBusiness).fromNow() }})
                </span>
              </span>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
            color="blue darken-1"
            text
            :href="`https://platform.deepbloo.com/users/${user.hivebriteId}`"
            target="_blank"
          >
            Open in DeepBloo
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="!getIsMobile"
            color="blue darken-1"
            text
            :loading="loadingUserSynchroFull"
            :disabled="loadingUserSynchroFull"
            @click="userSynchroFull()"
          >
            Synchro
          </v-btn>
          <v-btn
            @click="userAddUpdate()"
            color="green darken-1"
            text
          >
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
  name: 'SettingUser',

  data: () => ({
    moment,
    search: null,
    dataUsers: {
      loading: null,
      data: null
    },
    typeGroup: 0,
    headers: [
      { text: '', value: 'photo', align: 'center' },
      { text: ' Type', value: 'type', align: 'center' },
      { text: 'Name ', value: ' username', align: 'left', sortable: true },
      { text: 'Email ', value: ' email', align: 'left', sortable: true },
      { text: ' Id', value: 'userId', align: 'center' },
      { text: ' Free', value: 'membershipFree', align: 'center' },
      { text: '', align: 'right', sortable: false }
    ],
    pagination: {
      rowsPerPage: 20,
      sortBy: 'userId',
      descending: true
    },
    dialogUser: false,
    validUser: false,
    user: null,
    UserCpvs: null,
    types: [
      { id: 3, name: 'Public' },
      { id: 5, name: 'Free' },
      { id: 2, name: 'Premium' },
      { id: 4, name: 'Business +' },
      { id: 1, name: 'Admin' }
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
    notEmptyRules: [v => !!v || 'Data is required']
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
        return 0
      }

      return Math.ceil(this.getUsers().length / this.pagination.rowsPerPage)
    }
  },

  async mounted() {
    this.setHeaderShow(true)
    this.loadUsers()

    // Create CPV list
    await this.loadCpvs()
    this.cpvItems = []
    let constCpvSort = this.getDataCpvs.data.sort((a, b) => {
      if (a.category < b.category) {
        return -1
      }
      if (a.category > b.category) {
        return 1
      }
      return 0
    });
    let categoryCurrent = null
    for (let cpv of constCpvSort) {
      if (!cpv.active || !cpv.code) {
        continue
      }
      if (categoryCurrent !== cpv.category) {
        this.cpvItems.push({
          header: cpv.category && cpv.category !== '' ? cpv.category : 'Other'
        })
        categoryCurrent = cpv.category
      }
      this.cpvItems.push({
        name: cpv.label,
        code: cpv.code,
        active: cpv.active,
        group: cpv.category && cpv.category !== '' ? cpv.category : 'Other',
        avatar:
          cpv && cpv.logo && cpv.logo != ''
            ? cpv.logo
            : 'https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png'
      })
    }

    // Create country list
    this.regionItems = []
    this.countryItems = []
    for (let region of constRegions) {
      this.regionItems.push(region.label)
      if (region.countrys) {
        this.countryItems = this.countryItems.concat(region.countrys)
      }
      if (region.regions) {
        for (let regionSub of region.regions) {
          this.countryItems = this.countryItems.concat(regionSub.countrys)
        }
      }
    }
    this.countryItems = this.countryItems.sort()
  },

  methods: {
    ...mapActions([
      'setHeaderShow',
      'loadCpvs',
    ]),

    async loadUsers() {
      try {
        this.dataUsers.loading = 0
        this.pagination.page = 1
        let filter = {}
        if (this.typeGroup) {
          filter.type = this.typeGroup
        }
        if (this.isActive) {
          filter.status = 1
        }
        if (this.notifSend) {
          filter.notifSend = 1
        }
        filter.hasConnexionTender = this.hasConnexionTender
        filter.hasConnexionBusiness = this.hasConnexionBusiness
        const res = await this.$api.post('/User/List', { filter })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataUsers.data = res.data
        this.dataUsers.loading = 1
      } catch (err) {
        this.dataUsers.loading = -1
        this.$api.error(err, this)
      }
    },

    getUsers() {
      if (!this.dataUsers.data) {
        return []
      }
      let users = null
      if (!this.search || this.search.trim() === '') {
        users = this.dataUsers.data
      } else {
        users = this.dataUsers.data.filter(
          a =>
            a.username.toLowerCase().includes(this.search.toLowerCase()) ||
            a.email.toLowerCase().includes(this.search.toLowerCase())
        )
      }
      return users
    },

    userOpen(user) {
      this.dialogUser = true
      this.user = JSON.parse(JSON.stringify(user))
      this.getUserCpvs()
      this.cpvs = []
      if (this.user.notifCpvs && this.user.notifCpvs.trim() !== '') {
        const notifCpvs = this.user.notifCpvs.split(',')
        this.cpvs = this.cpvItems.filter(
          a => a.code && notifCpvs.includes(a.code.toString())
        )
      }
      this.regions = []
      if (this.user.notifRegions && this.user.notifRegions.trim() !== '') {
        const notifRegions = this.user.notifRegions.split(',')
        this.regions = this.regionItems.filter(a => notifRegions.includes(a))
      }
      this.countries = []
      if (this.user.notifCountries && this.user.notifCountries.trim() !== '') {
        const notifCountries = this.user.notifCountries.split(',')
        this.countries = this.countryItems.filter(a =>
          notifCountries.includes(a)
        )
      }
    },

    userSetPremium(user) {
      this.dataUsers.loading = 0
      this.$api
        .post('/User/SetPremium', { userId: user.userId })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error)
          }
          this.loadUsers()
        })
        .catch(err => {
          this.dataUsers.loading = -1
          this.$api.error(err, this)
        })
    },

    logAs(user) {
      this.$router.replace({
        name: 'Login',
        params: { email: user.email, password: user.password }
      })
    },

    userSynchro() {
      this.dataUsers.loading = 0
      this.$api
        .post('/User/Synchro')
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error)
          }
          this.loadUsers()
        })
        .catch(err => {
          this.dataUsers.loading = -1
          this.$api.error(err, this)
        })
    },

    getUserCpvs() {
      this.UserCpvs = null
      this.$api
        .post('/User/UserCpvs', {
          userId: this.user.userId
        })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error)
          }
          this.UserCpvs = res.data
        })
        .catch(err => {
          this.$api.error(err, this)
        })
    },

    cpvRemove(item) {
      const index = this.cpvs.indexOf(item.code)
      if (index >= 0) {
        this.cpvs.splice(index, 1)
      }
    },

    regionRemove(item) {
      const index = this.regions.indexOf(item)
      if (index >= 0) {
        this.regions.splice(index, 1)
      }
    },

    userSynchroFull() {
      this.loadingUserSynchroFull = true
      this.$api
        .post('/User/SynchroFull', {
          userId: this.user.userId
        })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error)
          }
          this.user = {
            ...this.user,
            ...res.data
          }
          let userFind = this.dataUsers.data.find(
            a => a.userId === this.user.userId
          )
          if (userFind) {
            this.userFind = {
              ...userFind,
              ...res.data
            }
          }
          this.getUserCpvs()
          this.loadUsers()
        })
        .catch(err => {
          this.$api.error(err, this)
        })
        .then(() => {
          this.loadingUserSynchroFull = false
        })
    },

    membershipSynchro() {
      this.dataUsers.loading = 0
      this.$api
        .post('/Hivebrite/MembershipSynchro')
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error)
          }
          this.loadUsers()
        })
        .catch(err => {
          this.dataUsers.loading = -1
          this.$api.error(err, this)
        })
    },

    passwordGet() {
      this.user.password = Math.random()
        .toString(36)
        .slice(-10)
    },

    async userAddUpdate() {
      try {
        this.dataUsers.loading = 0
        this.user.notifCpvs = this.cpvs.join()
        this.user.notifRegions = this.regions.join()
        this.user.notifCountries = this.countries.join()
        const res = await this.$api.post('/User/AddUpdate', {
          user: this.user
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.loadUsers()
        this.dialogUser = false
      } catch (err) {
        this.dataUsers.loading = -1
        this.$api.error(err, this)
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
  .user-type-grid {
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
  .user-type-grid {
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
</style>
