import 'regenerator-runtime/runtime'
import AppSearchAPIConnector from '@elastic/search-ui-app-search-connector'

const connector = new AppSearchAPIConnector({
  searchKey: 'search-pg8ft3mtkfkup3occekertmt', // "search-cmx2y22ucp9ry64mneez4ddj",
  engineName: 'deepbloo',
  // hostIdentifier: 'host-98wz59',
  endpointBase: 'https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/',
  cacheResponses: false
})

const config = {
  debug: false,
  apiConnector: connector,
  searchQuery: {
    disjunctiveFacets: [
      "country",
      "notice_type",
      "currency",
      "cpvs"
    ],
    facets: {
      region_lvl0: {
        type: "value",
        size: 200
      },
      region_lvl1: {
        type: "value",
        size: 200
      },
      country: {
        type: "value",
        size: 200
      },
      notice_type: {
        type: "value",
        size: 200
      },
      bid_deadline_timestamp: {
        type: "range",
        ranges: []
      },
      currency: {
        type: "value"
      },
      cpvs: {
        type: "value",
        size: 400
      },
      user_id: {
        type: "range",
        ranges: []
      },
      publication_timestamp: {
        type: "range",
        ranges: []
      },
      procurement_method: {
        type: "value"
      },
      lang: {
        type: "value"
      },
      scope_of_works: {
        type: "value"
      },
      segments: {
        type: "value"
      },
      designs: {
        type: "value"
      },
      contract_types: {
        type: "value"
      },
      brands: {
        type: "value",
        size: 200
      },
      origine: {
        type: "value"
      },
      groups: {
        type: "value"
      },
      buyer_name: {
        type: "value",
        size: 300
      },
      financials: {
        type: "value",
        size: 200
      },
    }
  }
}

export default config
