<template>
  <div>
    <div
      v-if="!results || !results.length"
      class="text-center grey--text pa-5"
    >
      No tender found !
    </div>
    <div
      v-else-if="displayType === 'CARD'"
      class="sui-results-container search-section__search-results"
    >
      <div
        v-for="result in results"
        :key="result.id.raw"
        class="search-section__search-result"
      >
        <SearchResult
          ref="SearchResult"
          :result="result"
          @tenderDialogShow="tenderOpen(result)"
          @openTenderGroupChoice="openTenderGroupChoice(result)"
          @openSentEmailDialog="openSentEmailDialog(result)"
          @removeTender="removeTenderDialog(result)"
        />
      </div>
    </div>
    <SearchResultsTable
      v-else
      ref="SearchResultsTable"
      :results="results"
      :filter="filter"
      :searchState="searchState"
      @tenderDialogShow="tenderOpen($event)"
      @updateUserScreen="updateUserScreen()"
      @handleFacetChange="handleFacetChange($event)"
      @handleFacetCheckAll="handleFacetCheckAll($event)"
      @handleFacetUnCheckAll="handleFacetUnCheckAll($event)"
      @openTenderGroupChoice="openTenderGroupChoice($event)"
      @sendToSalesforce="sendToSalesforce($event)"
    />

    <!-- Dialog -->
    <TenderDialog
      ref="TenderDialog"
      @updateTender="refreshFunction()"
      @openTenderGroupChoice="openTenderGroupChoice($event)"
    />
    <TenderGroupChoice
      ref="TenderGroupChoice"
      @choice="moveTenderToGroup($event.tender, $event.group)"
    />
    <SentEmailDialog
      ref="SentEmailDialog"
      @notifySent="loadUserNotifys()"
    />
    <TenderRemoveDialog
      ref="TenderRemoveDialog"
      @removeTender="removeTender($event)"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import SearchResult from './SearchResult'
import SearchResultsTable from './SearchResultsTable'
import TenderDialog from '@/views/tender/components/TenderDialog'
import TenderGroupChoice from '@/views/tender/components/TenderGroupChoice'
import SentEmailDialog from '@/components/modal/SentEmailDialog'
import TenderRemoveDialog from '@/views/tender/components/TenderRemoveDialog'

export default {
  name: 'SearchResults',

  components: {
    SearchResult,
    SearchResultsTable,
    TenderGroupChoice,
    SentEmailDialog,
    TenderDialog,
    TenderRemoveDialog,
  },

  props: {
    results: {
      type: Array,
      required: true
    },
    
    displayType: {
      type: String,
      required: true
    },

    filter: {
      type: Object,
      required: true
    },

    searchState: {
      type: Object,
      required: true
    },
  },

  computed: {
    ...mapGetters([
      'getUserId',
      'getIsFreeMembership',
      'getIsPremiumMembership',
      'getIsBusinessMembership',
      'getAppSearchUrl',
    ]),
  },

  methods: {
    ...mapActions([
      'showConfirmModal',
      'showInsufficientRightDialog',
      'loadUserNotifys',
    ]),

    openTenderGroupChoice(result) {
      this.$refs.TenderGroupChoice.show(result)
    },

    async moveTenderToGroup(result, tenderGroup) {
      try {
        let SearchResultHtml = null
        if (result) {
          if (this.displayType === 'CARD') {
            SearchResultHtml = this.$refs.SearchResult.find(a => a.result.id.raw === result.id.raw)
            if (SearchResultHtml) {
              SearchResultHtml.groupLoadingStatus(true)
            }
            result = SearchResultHtml.result
          } else {
            result = this.$refs.SearchResultsTable.results.find(a => a.id.raw === result.id.raw)
          }
        }
        const res = await this.$api.post("/Tender/TenderGroupMove", {
          userId: this.getUserId,
          tenderGroupId: tenderGroup ? tenderGroup.tenderGroupId : null,
          tenderId: result.tender_id.raw,
          algoliaId: result.object_id && result.object_id.raw ? result.object_id.raw : 0
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        if (res.data) {
          let groups = res.data.groups.map(String)
          if (!result.groups) {
            result.groups = {}
          }
          result.groups.raw = groups

          // MAJ tender dialog
          if (
            this.$refs.TenderDialog
            && this.$refs.TenderDialog.tender
            && this.$refs.TenderDialog.tender.id.raw === result.id.raw
          ) {
            this.$refs.TenderDialog.updateTenderGroup(res.data.groups)
          }
        }
        if (SearchResultHtml) {
          SearchResultHtml.groupLoadingStatus(false)
        }
        this.$emit('moveTenderToGroup')
      } catch (err) {
        console.log(err)
      }
    },

    openSentEmailDialog(result) {
      if (
        !this.getIsFreeMembership &&
        !this.getIsPremiumMembership &&
        !this.getIsBusinessMembership
      ) {
        this.dialogInsufficientRight = true
        return
      }
      const tenderId = result.tender_id && result.tender_id.raw ? result.tender_id.raw : 0
      let subject = "Deepbloo - this tender should interest you"
      let body = "\n"
      body += "Title :\n"
      body += `${result.title && result.title.raw ? this.$global.htmlText(result.title.raw).trim().substring(0, 50) : ''}...\n`
      body += "\n";
      body += "Description :\n"
      body += `${result.description && result.description.raw ? this.$global.htmlText(result.description.raw).trim().substring(0, 400) : ''}...\n`
      body += "\n"
      let footerHtml = `
        <a href="https://prod.deepbloo.com/#/tender?tenderId=${tenderId}" target="_blank">
          Open this tender #${tenderId}
        </a>
        The Deepbloo team
      `
      this.$refs.SentEmailDialog.show(
        subject.trim(),
        body.trim(),
        footerHtml.trim(),
        result.tenderId
      )
    },

    updateUserScreen() {
      this.$emit('updateUserScreen')
    },

    handleFacetChange(event) {
      this.$emit('handleFacetChange', event)
    },

    handleFacetCheckAll(facet) {
      this.$emit('handleFacetCheckAll', facet)
    },

    handleFacetUnCheckAll(facet) {
      this.$emit('handleFacetUnCheckAll', facet)
    },

    tenderOpen(result) {
      this.$refs.TenderDialog.show(result)
      this.$emit('tenderOpen', result)
    },

    removeTenderDialog(result) {
      this.$refs.TenderRemoveDialog.show(result)
    },

    removeTender(result) {
      this.$emit('removeTender', result)
    },

    async sendToSalesforce(result) {
      try {
        const res = await this.$api.post('/Tender/sendToSalesforce', {
          userId: this.getUserId,
          tenderId: parseInt(result.id.raw, 10),
        })
        if (!res.success) {
          let message = ''
          if (
            res.data
            && res.data.length
          ) {
            for (const data of res.data) {
              message += `<div class="pa-2">`
              message += `errorCode: <span class="black--text">${data.errorCode}</span><br>`
              message += `message: <span class="black--text">${data.message}</span><br>`
              message += `fields: <span class="black--text">${data.fields.join(', ')}</span>`
              message += `</div>`
            }
          }
          this.showConfirmModal({
            headerClass: "white--text darken-4--text red lighten-1",
            headerIcon: "fa-exclamation-triangle",
            title: "Error: synchro with Salesforce failed",
            message: message,
            buttons: [
              { libelle: "Close", text: true, class: "" }
            ]
          })
          throw new Error(res.Error)
        }
      } catch (err) {
        this.$api.error(err, this)
      }
    },
  },
};
</script>

<style>
@media screen and (min-width: 900px) {
  .search-section__search-result {
    width: 25%;
  }
}
@media (min-width: 700px) and (max-width: 900px) {
  .search-section__search-result {
    width: 50%;
  }
}
@media screen and (max-width: 700px) {
  .search-section__search-result {
    width: 1000%;
  }
}
.search-section__search-results {
  display: flex;
  flex-wrap: wrap;
}

.search-section__search-result {
  margin: 0px;
  padding: 6px;
  background: white;
}

/* common */
.ribbon {
  width: 150px;
  height: 150px;
  overflow: hidden;
  position: absolute;
}
.ribbon::before,
.ribbon::after {
  position: absolute;
  z-index: -1;
  content: "";
  display: block;
  border: 5px solid #2980b9;
}
.ribbon span {
  position: absolute;
  display: block;
  width: 225px;
  padding: 10px 0;
  /* background-color: #3498db; */
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  color: #fff;
  font: 700 12px/1 "Lato", sans-serif;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  text-align: center;
}

/* top right*/
.ribbon-top-right {
  top: -10px;
  right: -10px;
}
.ribbon-top-right::before,
.ribbon-top-right::after {
  border-top-color: transparent;
  border-right-color: transparent;
}
.ribbon-top-right::before {
  top: 0;
  left: 0;
}
.ribbon-top-right::after {
  bottom: 0;
  right: 0;
}
.ribbon-top-right span {
  left: -10px;
  top: 34px;
  transform: rotate(45deg);
}
</style>
