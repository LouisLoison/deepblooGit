<template>
  <v-app id="add" class="grey lighten-5" style="text-align: center;">
    <v-btn
      :to="{ name: 'Tenders' }"
      fixed
      top
      right
      fab
      small
      dark
      color="blue-grey lighten-1"
      style="opacity: 0.8;"
      title="Cancel"
    >
      <v-icon>fa-times</v-icon>
    </v-btn>
    <v-img :src="cpvsPicture()" aspect-ratio="2.75" height="300" />
    <div class="text-xs-center">
      <v-avatar
        class="elevation-10"
        size="200"
        style="margin-top: -250px; background-color: rgba(255, 255, 255, 0.77); border: 3px solid #ffffff; opacity: 0.8;"
      >
        <img class="pa-4" :src="cpvsLogo()" alt="" />
      </v-avatar>
    </div>

    <v-layout row justify-center>
      <div v-if="isUserLoggedIn" style="width: 800px; padding: 20px;">
        <div v-if="!objectID" class="display-1 pt-4">Create an opportunity</div>
        <div v-else class="display-1 pt-4">Tender #{{ objectID }}</div>

        <div v-if="!objectID || dataTender.loading === 1">
          <v-form v-model="valid" ref="form" lazy-validation>
            <v-card class="pa-3 mt-3">
              <div v-if="cpvItems">
                <v-autocomplete
                  label="CPV *"
                  v-model="cpvs"
                  :disabled="false"
                  :items="cpvItems"
                  filled
                  chips
                  item-text="name"
                  item-value="name"
                  multiple
                >
                  <template slot="selection" slot-scope="data">
                    <v-chip
                      :input-value="data.selected"
                      close
                      class="chip--select-multi"
                      @input="remove(data.item)"
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
              </div>

              <v-text-field
                label="Title *"
                v-model="title"
                :rules="notEmptyRules"
                required
              />

              <div class="py-3">
                <v-textarea
                  label="Description *"
                  v-model="description"
                  :rules="notEmptyRules"
                  name="input-7-1"
                  auto-grow
                />
              </div>

              <v-text-field
                label="Link to tender documentation (please start with https:// or http://)"
                v-model="sourceUrls"
                required
                prepend-icon="fa-link"
              />

              <v-autocomplete
                label="Country *"
                v-model="country"
                :rules="notEmptyRules"
                :items="countryItems"
                persistent-hint
                prepend-icon="fa-globe-africa"
                autocomplete="none"
              />
            </v-card>

            <v-card class="pa-3 mt-3">
              <v-select
                label="Procurement method *"
                v-model="procurementMethod"
                :rules="notEmptyRules"
                :items="procurementMethods"
                required
              />

              <v-text-field label="Procurement id" v-model="procurementId" />

              <v-select
                label="Notice type *"
                v-model="noticeType"
                :rules="notEmptyRules"
                :items="noticeTypes"
                required
              />

              <v-text-field label="Estimated cost" v-model="estimatedCost" />

              <v-select
                label="Currency"
                v-model="currency"
                :items="currencies"
                required
              />
            </v-card>

            <v-card class="pa-3 mt-3">
              <v-layout row xs12 wrap>
                <v-flex xs12 md6 class="px-5">
                  <v-menu
                    v-model="publicationDateMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template slot="activator" slot-scope="{ on }">
                      <v-text-field
                        v-on="on"
                        label="Publication *"
                        v-model="publicationDate"
                        prepend-icon="fa-calendar"
                        readonly
                        required
                        :rules="notEmptyRules"
                      />
                    </template>
                    <v-date-picker
                      v-model="publicationDate"
                      @input="publicationDateMenu = false"
                    />
                  </v-menu>
                </v-flex>
                <v-flex xs12 md6 class="px-5">
                  <v-menu
                    v-model="bidDeadlineDateMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template slot="activator" slot-scope="{ on }">
                      <v-text-field
                        v-on="on"
                        label="BID deadline *"
                        v-model="bidDeadlineDate"
                        prepend-icon="fa-calendar"
                        readonly
                        required
                        :rules="notEmptyRules"
                      />
                    </template>
                    <v-date-picker
                      v-model="bidDeadlineDate"
                      @input="bidDeadlineDateMenu = false"
                    />
                  </v-menu>
                </v-flex>
              </v-layout>
            </v-card>

            <v-card class="pa-3 mt-3">
              <h3 class="blue--text text--darken-1 pt-4">Buyer</h3>
              <div>
                <v-text-field
                  label="Name *"
                  v-model="buyerName"
                  :rules="notEmptyRules"
                  required
                ></v-text-field>
              </div>

              <v-autocomplete
                label="Buyer's country *"
                v-model="buyerCountry"
                :rules="notEmptyRules"
                :items="countryItems"
                persistent-hint
                prepend-icon="fa-globe-africa"
                autocomplete="none"
              />
            </v-card>

            <v-card class="pa-3 mt-3">
              <h3 class="blue--text text--darken-1 pt-4">Contact</h3>

              <v-text-field
                label="First name *"
                v-model="contactFirstName"
                required
                :rules="notEmptyRules"
              />

              <v-text-field
                label="Last name *"
                v-model="contactLastName"
                required
                :rules="notEmptyRules"
              />

              <v-text-field label="Address" v-model="contactAddress" required />

              <v-text-field label="City" v-model="contactCity" required />

              <v-text-field label="State" v-model="contactState" required />

              <v-autocomplete
                label="Country *"
                v-model="contactCountry"
                :rules="notEmptyRules"
                :items="countryItems"
                persistent-hint
                prepend-icon="fa-globe-africa"
                autocomplete="none"
              />

              <v-text-field
                label="Email *"
                v-model="contactEmail"
                :rules="emailRules"
                required
                prepend-icon="fa-at"
              />

              <v-text-field
                label="Phone"
                v-model="contactPhone"
                prepend-icon="fa-phone"
              />
            </v-card>
          </v-form>
          <div v-if="!objectID" class="pa-3 mt-3">
            <v-btn
              color="success"
              @click="tenderAddUpdate()"
              :disabled="!valid"
              :loading="loadingCreate"
            >
              Create
            </v-btn>
          </div>
          <div v-else class="pa-3 mt-3">
            <v-btn
              @click="tenderAddUpdate()"
              :disabled="!valid"
              color="success"
            >
              Update
            </v-btn>
          </div>
        </div>
        <div v-else-if="dataTender.loading === 0" class="pa-5">
          <div class="pa-2 grey--text">Loading...</div>
          <v-progress-circular :size="50" color="blue-grey lighten-4" indeterminate />
        </div>
        <div v-else-if="dataTender.loading === -1" class="pa-5">
          <v-icon class="red--text">error</v-icon>
          <div class="pa-2 red--text">Error while loading data</div>
        </div>
      </div>
      <div v-else style="max-width: 800px; padding: 20px;">
        <v-alert
          :value="true"
          color="error"
          icon="warning"
          outline
          transition="scale-transition"
        >
          You must have an account in order to create an opportunity.
        </v-alert>
        <v-btn
          round
          dark
          color="success"
          href="https://platform.deepbloo.com/memberships"
        >
          Get premium
        </v-btn>
        <v-btn round color="blue-grey lighten-5" to="Login">
          <v-icon size="14">lock</v-icon>
          Login
        </v-btn>
      </div>
    </v-layout>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import constRegions from '@/assets/constants/regions.json'

export default {
  name: 'TenderAdd',

  data: () => ({
    moment,
    valid: false,
    dataTender: {
      loading: 0,
      errorMessage: '',
      list: null,
    },
    objectID: null,
    cpvItems: null,
    countryItems: null,
    cpvs: [],
    title: '',
    description: '',
    lang: null,
    contactFirstName: '',
    contactLastName: '',
    contactAddress: '',
    contactCity: '',
    contactState: '',
    contactCountry: '',
    contactEmail: '',
    emailRules: [
      v => !!v || 'E-mail is required',
      v => /.+@.+/.test(v) || 'E-mail must be valid',
    ],
    contactPhone: '',
    buyerName: null,
    buyerCountry: null,
    sourceUrls: null,
    procurementMethod: null,
    procurementMethods: [
      'National',
      'International',
      'Other',
    ],
    procurementId: null,
    noticeType: null,
    noticeTypes: [
      'Contract Award',
      'Prequalification Notice',
      'Prior Information Notice',
      'Procurement Plan',
      'Prequalification Notice',
      'Request For Proposals',
      'Request for Public Consultations',
    ],
    country: null,
    estimatedCost: null,
    currency: null,
    currencies: [
      'AED',
      'AFN',
      'ALL',
      'AMD',
      'ANG',
      'AOA',
      'ARS',
      'AUD',
      'AWG',
      'AZN',
      'BAM',
      'BBD',
      'BDT',
      'BGN',
      'BHD',
      'BIF',
      'BMD',
      'BND',
      'BOB',
      'BOV',
      'BRL',
      'BSD',
      'BTN',
      'BWP',
      'BYR',
      'BZD',
      'CAD',
      'CDF',
      'CHE',
      'CHF',
      'CHW',
      'CLF',
      'CLP',
      'CNY',
      'COP',
      'COU',
      'CRC',
      'CUC',
      'CUP',
      'CVE',
      'CZK',
      'DJF',
      'DKK',
      'DOP',
      'DZD',
      'EGP',
      'ERN',
      'ETB',
      'EUR',
      'FJD',
      'FKP',
      'GBP',
      'GEL',
      'GHS',
      'GIP',
      'GMD',
      'GNF',
      'GTQ',
      'GYD',
      'HKD',
      'HNL',
      'HRK',
      'HTG',
      'HUF',
      'IDR',
      'ILS',
      'INR',
      'IQD',
      'IRR',
      'ISK',
      'JMD',
      'JOD',
      'JPY',
      'KES',
      'KGS',
      'KHR',
      'KMF',
      'KPW',
      'KRW',
      'KWD',
      'KYD',
      'KZT',
      'LAK',
      'LBP',
      'LKR',
      'LRD',
      'LSL',
      'LYD',
      'MAD',
      'MDL',
      'MGA',
      'MKD',
      'MMK',
      'MNT',
      'MOP',
      'MRO',
      'MUR',
      'MVR',
      'MWK',
      'MXN',
      'MXV',
      'MYR',
      'MZN',
      'NAD',
      'NGN',
      'NIO',
      'NOK',
      'NPR',
      'NZD',
      'OMR',
      'PAB',
      'PEN',
      'PGK',
      'PHP',
      'PKR',
      'PLN',
      'PYG',
      'QAR',
      'RON',
      'RSD',
      'RUB',
      'RWF',
      'SAR',
      'SBD',
      'SCR',
      'SDG',
      'SEK',
      'SGD',
      'SHP',
      'SLL',
      'SOS',
      'SRD',
      'SSP',
      'STD',
      'SVC',
      'SYP',
      'SZL',
      'THB',
      'TJS',
      'TMT',
      'TND',
      'TOP',
      'TRY',
      'TTD',
      'TWD',
      'TZS',
      'UAH',
      'UGX',
      'USD',
      'USN',
      'UYI',
      'UYU',
      'UZS',
      'VEF',
      'VND',
      'VUV',
      'WST',
      'XAF',
      'XCD',
      'XDR',
      'XOF',
      'XPF',
      'XSU',
      'XUA',
      'YER',
      'ZAR',
      'ZMW',
      'ZWL',
    ],
    publicationDate: new Date().toISOString().substr(0, 10),
    publicationDateMenu: false,
    bidDeadlineDate: null,
    bidDeadlineDateMenu: false,
    model: null,
    notEmptyRules: [v => !!v || 'Data is required'],
    loadingCreate: false,
  }),

  computed: {
    ...mapGetters('defaultStore', [
      'isUserLoggedIn',
      'getDataCpvs',
    ])
  },

  async mounted() {
    if (this.$route.query.id && this.$route.query.id > 0) {
      this.objectID = this.$route.query.id
      this.loadTender()
    }

    if (this.$route.params && this.$route.params.tender) {
      const tender = this.$route.params.tender
      this.title = tender.title
      this.description = this.htmlText(tender.description)
      this.lang = tender.lang
      this.contactFirstName = tender.contactFirstName
      this.contactLastName = tender.contactLastName
      this.contactAddress = tender.contactAddress
      this.contactCity = tender.contactCity
      this.contactState = tender.contactState
      this.contactCountry = tender.contactCountry
      this.contactEmail = tender.contactEmail
      this.contactPhone = tender.contactPhone
      this.buyerName = tender.buyerName
      this.buyerCountry = tender.buyerCountry
      this.procurementMethod = tender.procurementMethod
      this.procurementId = tender.procurementId
      this.noticeType = tender.noticeType
      this.country = tender.country
      this.estimatedCost = tender.estimatedCost
      this.currency = tender.currency
      this.publicationDate = this.dateFormat(tender.publicationDate)
      this.cpvs = tender.cpvDescriptions.split(',')
      this.bidDeadlineDate = this.dateFormat(tender.bidDeadlineDate)
      this.sourceUrl = tender.sourceUrls
    }

    // Create CPV list
    this.cpvItems = []
    let constCpvSort = this.getDataCpvs.data.sort((a, b) => {
      if (a.category < b.category) {
        return -1
      }
      if (a.category > b.category) {
        return 1
      }
      return 0
    })
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
            : "https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png"
      })
    }

    // Create country list
    this.countryItems = [];
    for (let region of constRegions) {
      if (region.countrys) {
        this.countryItems = this.countryItems.concat(region.countrys);
      }
      if (region.regions) {
        for (let regionSub of region.regions) {
          this.countryItems = this.countryItems.concat(regionSub.countrys);
        }
      }
    }
    this.countryItems = this.countryItems.sort();
  },

  methods: {
    ...mapActions('defaultStore', [
      'loadCpvs',
    ]),

    async loadTender() {
      try {
        this.dataTender.loading = 0
        const res = await this.$api.post('/Tender/TenderGet', {
          algoliaId: this.objectID,
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.title = res.data.title
        this.description = res.data.description
        this.lang = res.data.lang
        this.contactFirstName = res.data.contactFirstName
        this.contactLastName = res.data.contactLastName
        this.contactAddress = res.data.contactAddress
        this.contactCity = res.data.contactCity
        this.contactState = res.data.contactState
        this.contactCountry = res.data.contactCountry
        this.contactEmail = res.data.contactEmail
        this.contactPhone = res.data.contactPhone
        this.buyerName = res.data.buyerName
        this.buyerCountry = res.data.buyerCountry
        this.procurementMethod = res.data.procurementMethod
        this.procurementId = res.data.procurementId
        this.noticeType = res.data.noticeType
        this.country = res.data.country
        this.estimatedCost = res.data.estimatedCost
        this.currency = res.data.currency
        this.publicationDate = this.dateFormat(res.data.publicationDate)
        this.cpvs = res.data.cpvDescriptions.split(',')
        this.bidDeadlineDate = this.dateFormat(res.data.bidDeadlineDate)
        this.sourceUrl = res.data.sourceUrls
        this.dataTender.loading = 1
      } catch (err) {
        this.dataTender.loading = -1
        this.$api.error(err, this)
      }
    },

    dateFormat(date) {
      let dateFormat = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
      return dateFormat
    },

    remove(item) {
      const index = this.cpvs.indexOf(item.name);
      if (index >= 0) this.cpvs.splice(index, 1);
    },

    cpvsLogo() {
      return this.$global.cpvLogo(this.cpvs, this.getDataCpvs.data)
    },

    cpvsPicture() {
      return this.$global.cpvPicture(this.cpvs, this.getDataCpvs.data)
    },

    htmlText(html) {
      var span = document.createElement("span");
      span.innerHTML = html;
      return span.textContent || span.innerText;
    },

    async tenderAddUpdate() {
      try {
        if (!this.$refs.form.validate()) {
          return
        }
        this.loadingCreate = true
        let tender = {
          algoliaId: this.objectID,
          title: this.title,
          description: this.description,
          lang: this.lang,
          contactFirstName: this.contactFirstName,
          contactLastName: this.contactLastName,
          contactAddress: this.contactAddress,
          contactCity: this.contactCity,
          contactState: this.contactState,
          contactCountry: this.contactCountry,
          contactEmail: this.contactEmail,
          contactPhone: this.contactPhone,
          buyerName: this.buyerName,
          buyerCountry: this.buyerCountry,
          procurementMethod: this.procurementMethod,
          procurementId: this.procurementId,
          noticeType: this.noticeType,
          country: this.country,
          estimatedCost: this.estimatedCost,
          currency: this.currency,
          publicationDate: this.publicationDate.split('-').join('').trim(),
          cpvs: this.cpvs,
          bidDeadlineDate: this.bidDeadlineDate.split('-').join('').trim(),
          sourceUrl: this.sourceUrls,
        }
        const res = await this.$api.post('/Tender/TenderAdd', {
          tender: tender,
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        setTimeout(() => {
          this.loadingCreate = false
          this.$router.push({ name: 'Tenders' })
        }, 2000)
      } catch (err) {
        this.loadingCreate = false
        this.$api.error(err, this)
      }
    },
  }
}
</script>

<style>
.v-input__slot {
  background-color: #ffffff !important;
}
</style>
