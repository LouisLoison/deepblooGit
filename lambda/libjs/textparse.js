exports.textExclusion = (text, scope) => {
  if (!text) {
    return ({
      status: true
    })
  }
  let origine = null

  // Tyres exception
  let exceptionLabels = ['batterie', 'batteries', 'battery']
  for (let exceptionLabel of exceptionLabels) {
    let regExExceptionLabel = new RegExp("\\b" + exceptionLabel + "\\b", 'gi')
    if (text.match(regExExceptionLabel)) {
      let exceptionFound = false
      let exceptionWords = ['tyres', 'tyre', 'tire', 'tires', 'cars', 'car', 'vehicles', 'vehicle', 'trucks', 'walkie talkie', 'walkie-talkie', 'talkie-walkie', 'talkie walkie', 'tractor', 'motor vehicles']
      for (let exceptionWord of exceptionWords) {
        let regExException = new RegExp("\\b" + exceptionWord + "\\b", 'gi')
        if (text.match(regExException)) {
          exceptionFound = true
          origine = `${exceptionLabel}|${exceptionWord}`
          break
        }
      }
      if (exceptionFound) {
        return ({
          origine,
          status: false
        })
      }
    }
  }

  // Oil exception
  exceptionLabels = ['fuel']
  for (let exceptionLabel of exceptionLabels) {
    let regExExceptionLabel = new RegExp("\\b" + exceptionLabel + "\\b", 'gi')
    if (text.match(regExExceptionLabel)) {
      let exceptionFound = false
      let exceptionWords = ['oil', 'lubricant', 'lubricants']
      for (let exceptionWord of exceptionWords) {
        let regExException = new RegExp("\\b" + exceptionWord + "\\b", 'gi')
        if (text.match(regExException)) {
          exceptionFound = true
          origine = `${exceptionLabel}|${exceptionWord}`
          break
        }
      }
      if (exceptionFound) {
        return ({
          origine,
          status: false
        })
      }
    }
  }

  if (scope === 'TITLE') {
    // Protection exception
    exceptionLabels = ['Protection', 'Protections']
    for (let exceptionLabel of exceptionLabels) {
      let regExExceptionLabel = new RegExp("\\b" + exceptionLabel + "\\b", 'gi')
      if (text.match(regExExceptionLabel)) {
        let exceptionFound = false
        let exceptionWords = ['social', 'gender', 'genders', 'civil', 'video', 'videos', 'consumer', 'consumers', 'labor', 'labour', 'child', 'children', 'car', 'cars', 'corrosion', 'flood', 'flooddings', 'sun']
        for (let exceptionWord of exceptionWords) {
          let regExException = new RegExp("\\b" + exceptionWord + "\\b", 'gi')
          if (text.match(regExException)) {
            exceptionFound = true
            origine = `${exceptionLabel}|${exceptionWord}`
            break
          }
        }
        if (exceptionFound) {
          return ({
            origine,
            status: false
          })
        }
      }
    }

    // Hybrid exception
    exceptionLabels = ['hybrid']
    for (let exceptionLabel of exceptionLabels) {
      let regExExceptionLabel = new RegExp("\\b" + exceptionLabel + "\\b", 'gi')
      if (text.match(regExExceptionLabel)) {
        let exceptionFound = false
        let exceptionWords = ['Operating room', 'Vehicle', 'Bus', 'cars', 'truck', 'taxi', 'mail']
        for (let exceptionWord of exceptionWords) {
          let regExException = new RegExp("\\b" + exceptionWord + "\\b", 'gi')
          if (text.match(regExException)) {
            exceptionFound = true
            origine = `${exceptionLabel}|${exceptionWord}`
            break
          }
        }
        if (exceptionFound) {
          return ({
            origine,
            status: false
          })
        }
      }
    }
  }
  return { status: true }
}

exports.textExclusionIfNoCpv = (text, scope) => {
  if (!text) {
    return ({
      status: true
    })
  }
  let wordCouples = [
    {
      word1: 'unaccompanied',
      word2: 'children',
    },
    {
      word1: 'violence',
      word2: 'children',
    },
    {
      word1: 'food',
      word2: 'chidlren',
    },
    {
      word1: 'meals',
      word2: 'snack',
    },
    {
      word1: 'meals',
      word2: 'accomodation',
    },
    {
      word1: 'accomodatiion',
      word2: 'hotel',
    },
    {
      word1: 'accomodation',
      word2: 'catering',
    },
  ]

  for (let wordCouple of wordCouples) {
    let regExExceptionLabel = new RegExp("\\b" + wordCouple.word1 + "\\b", 'gi')
    if (text.match(regExExceptionLabel)) {
      let regExException = new RegExp("\\b" + wordCouple.word2 + "\\b", 'gi')
      if (text.match(regExException)) {
        return ({
          origine: `${wordCouple.word1}|${wordCouple.word2}`,
          status: false
        })
      }
    }
  }


  let words = [
    'Catering service',
    'cleaning service',
    'cleanliness service',
    'Laundry service',
    'Printing',
    'Print services',
    'Photocopying',
    'scanning',
    'plantation of trees',
    'cutting trees',
    'cutting off trees',
    'cutting of trees',
    'trees cutting',
    'Garden maintenance',
    'gardening work',
    'beautification',
    'Kitchen cabinet',
    'kitchen room',
    'kitchen equipment',
    'Kitchen ustensil',
    'kitchen smoke',
    'bakery products',
    'pastery products',
    'kitchen and bakery',
    'Housekeeping services',
    'medical services',
    'insurance service',
    'decontamination',
    'transport service',
    'diving service',
    'diving equipment',
    'diving system',
    'diving gears',
    'transport service for pupils',
    'school children',
    'school transport',
    'transport service',
    'school transportation',
    'bus transport',
    'delivery of meal',
    'school meal',
    'purchase of meals',
    'cold-link meal',
    'cold link meal',
    'supply of meal',
    'hot meal',
    'cleaning marchine',
    'washing machine',
  ]

  for (let word of words) {
    let regExExceptionLabel = new RegExp("\\b" + word + "\\b", 'gi')
    if (text.match(regExExceptionLabel)) {
      return ({
        origine: word,
        status: false
      })
    }
  }

  return {
    status: true
  }
}


const textParses = [
  {
    textParseId: 1,
    theme: "Budget",
    group: "Dollar",
    words: "Dollar",
    exclusions: '',
    type: "METRIC",
  },
  {
    textParseId: 2,
    theme: "Budget",
    group: "Yen",
    words: "¥",
    exclusions: '',
    type: "METRIC",
  },
  {
    textParseId: 3,
    theme: "Budget",
    group: "Euro",
    words: "€",
    exclusions: '',
    type: "METRIC",
  },
  {
    textParseId: 4,
    theme: "Budget",
    group: "Livre",
    words: "£",
    exclusions: '',
    type: "METRIC",
  },
  // Scope of Work
  {
    textParseId: 5,
    theme: "Scope of Work",
    group: "Maintenance/repair",
    words: "Maintenance § repair § repairs § repairing § rectify § rectifying § assistance § spares",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 6,
    theme: "Scope of Work",
    group: "Construction/Commissioning",
    words: "Construction § reconstruction § Turnkey § commissioning § extension § EPC § fabrication § realization § civil work § civil works § mise en service § génie civil",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 7,
    theme: "Scope of Work",
    group: "Installation",
    words: "install § installation § installing § assembly § realization § erection § erecting",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 8,
    theme: "Scope of Work",
    group: "Procurement",
    words: "Supply § supplying § Procurement § procurment § Purchase § acquisition § procuring § provision of § delivery § deliver § delivering § furnish § furnishing § furnishings § fourniture § achats",
    exclusions: 'Procurement plan',
    type: "KEYWORD",
  },
  {
    textParseId: 9,
    theme: "Scope of Work",
    group: "Consulting/Audit",
    words: "Consulting § audit § consultant § consultancy § assess § assesment § Assessing § Feasability § pre-feasability § survey § surveying § consultative § consultatory § provision of services § measurement § investigation § study § studies § report § étude § advice § due diligence",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 80,
    theme: "Scope of Work",
    group: "Training",
    words: "Training § formation",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 81,
    theme: "Scope of Work",
    group: "Certification/approval",
    words: "Certify § certification § certifying § approval",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 82,
    theme: "Scope of Work",
    group: "Testing/Measurement/Qualif",
    words: "Testing § test § measure § measuring § qualification § qualify § experimenting § experimentation § experiment § bench",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 10,
    theme: "Scope of Work",
    group: "Design",
    words: "engineering § design §  designing § drawing § schemes § concept § conception",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 11,
    theme: "Scope of Work",
    group: "Refurbishment/upgrade",
    words: "Refurbishment § rehabilitation § upgrade § upgrading § upgradation § restoration § replacement § replace § replacing § reconstruction § retrofit § refurbish § expansion § extension § modernization § renovation § uprate § uprating § reconductoring § refurbishing § restoring § renovating § renovate § restore § renew § revamp § revamping",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 12,
    theme: "Scope of Work",
    group: "Operation/Control/Supervision",
    words: "Operation § control § monitoring § supervision § exploitation § inspection",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 83,
    theme: "Scope of Work",
    group: "Project Management",
    words: "project management § manage project § lead project § gestion de projet",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 84,
    theme: "Scope of Work",
    group: "Transport/Logistic",
    words: "loading § carriage § unloading § transportation § transport § Logistics § logistical services § shipping § freight",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 13,
    theme: "Scope of Work",
    group: "Manufacturing",
    words: "manufacture § manufacturing § producing § production § fabrication",
    exclusions: '',
    type: "KEYWORD",
  },
  /*
  {
    textParseId: 87,
    theme: "Scope of Work",
    group: "Project Development",
    words: "development § develop § developping",
    exclusions: '',
    type: "KEYWORD",
  },
  */
  // Segment 85
  {
    textParseId: 85,
    theme: "Segment",
    group: "Agriculture",
    words: "irrigation § agricultural § fishing § agriculture § fertilzer § pesticide § seed § aquaculture § farming § agronomic § agronomy § crop § pest § fisheries § fishery § cultivation § harvesting § agronomy § husbandry § horticulture § horticultural § livestock § animal science § Forestry § Forest § Organic",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 14,
    theme: "Segment",
    group: "Mining",
    words: "mine § mining § excavating § excavate § geology § digging § tunneling § pitting § quarry § shaft § miner § coal § gold § platinum § tubewell § boring § titanium",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 15,
    theme: "Segment",
    group: "Industry",
    words: "Industry § industrial § factory § plant § manufactory § warehouse § cementry",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 16,
    theme: "Segment",
    group: "Rural",
    words: "rural § agrarian § remote area § electricity access § access to electricity § energy access § locality § localities § village § undeserved § pastoral § hamlet § dam",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 17,
    theme: "Segment",
    group: "Public Lighting",
    words: "Public lighting §  street light § street lighting § street lightings § street lights § streetlight § streetlighting § streetlightings § streetlights § path lights",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 18,
    theme: "Segment",
    group: "Rooftop",
    words: "Rooftop § roof § SHS § solar home system § solar home",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 19,
    theme: "Segment",
    group: "Buisness",
    words: "commercial § building § mall § business center § small business § small businesses § business § commerce § office § trading center § trade center",
    exclusions: 'commercial offer § commercial invoice § commercial bid § commercial requirement § commercial evaluation',
    type: "KEYWORD",
  },
  {
    textParseId: 86,
    theme: "Segment",
    group: "O&G",
    words: "Refinery § gas pipeline § gaz pipeline § petroleum § kerosene § fuel § oil § crude oil § pipeline § pipelines § Gasoline § Hydrocarbon § Natural Gas § o&g § oil and gaz § oil and gas § oil & gas § oil & gaz",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 20,
    theme: "Segment",
    group: "Residential",
    words: "residential § residentiel § homes § house § household § urban § housing § urbanisation § suburban § domestic § habitation § metropolitan",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 21,
    theme: "Segment",
    group: "Railway",
    words: "Railway § railroad § rail line § train line § subway § metro § monorail § tram § tramway",
    exclusions: '',
    type: "KEYWORD",
  },
  /*
  {
    textParseId: 22,
    theme: "Segment",
    group: "services (school § hospital....)",
    words: "sport § training § school § classroom § hospital § hopital § health center § university § medical center § gaming § airport §  ski § tourism § aquatic § stadium § leisure § amusement § restaurant § crematorium § cutlure house § culure center § cultural center § recreation § food center § care center § senior center § cinema § memory house § memorial § arts § libray § swimming pool § shopping § children parks § national parks",
    exclusions: '',
    type: "KEYWORD",
  },
  */
  {
    textParseId: 90,
    theme: "Segment",
    group: "Health",
    words: "hospital § hopital § health center § medical center § health program § medical § nursing home § clinic § emergency room § nursing home § surgery § sanatorium § Covid § ght § groupement hospitalier de territoire",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 91,
    theme: "Segment",
    group: "Education",
    words: "school § classroom §  university § college § academy § establishment § faculty § educational institution § training institute § professional training",
    exclusions: 'establishment of',
    type: "KEYWORD",
  },
  {
    textParseId: 92,
    theme: "Segment",
    group: "Culture",
    words: "cutlure house § culure center § cultural center § library § memory house § arts § museum § gallery § exhibition § craft § handicraft §  municipal § civic",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 93,
    theme: "Segment",
    group: "Leisure",
    words: "sport § gaming § ski § tourism § aquatic § stadium § leisure § amusement § restaurant § recreation § cinema § memorial § swimming pool § shopping § children parks § national parks § sanctuary § tourist § aquarium § gymnasium § halls § play § game § arena § zoo",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 94,
    theme: "Segment",
    group: "Transport",
    words: "airport § seaport § shipment § shipping § transit § transportation § carriage § carrier § haul § hauler § hauling § conveyance § freight § cargo",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 95,
    theme: "Segment",
    group: "Food",
    words: "food center § food product § food products § drink § alcohol",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 96,
    theme: "Segment",
    group: "Others",
    words: "care center § senior center § crematorium § shopping",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 97,
    theme: "Segment",
    group: "Nuclear",
    words: "Containment building § steam generators § steam pipes § uranium § reactor vessel § neutron § Magnox § UNGG § PWR § BWR",
    exclusions: '',
    type: "KEYWORD",
  },
  // Financing
  /*
  {
    textParseId: 24,
    theme: "Financing",
    group: "Financing",
    words: "African Development Bank § AfDB § Development Bank § Fund § grant § financing § financed § investor",
    exclusions: '',
    type: "KEYWORD",
  },
  */
  // Métriques
  {
    textParseId: 25,
    theme: "Métriques",
    group: "Distance (KM)",
    words: "kms § kilomètres",
    exclusions: '',
    type: "METRIC",
  },
  {
    textParseId: 26,
    theme: "Métriques",
    group: "Puissance (KVA)",
    words: "MVA § megavolt-amp § KVA § Kilovolt-amp",
    exclusions: '',
    type: "METRIC",
  },
  {
    textParseId: 1000,
    theme: "Métriques",
    group: "Puissance (MW)",
    words: "GW,giga-watt,giga watt,MW,mega-watt,megawatt,KW,Kilowatt-hour,kWh,KWp,kilo-watt,kilowatt",
    exclusions: '',
    type: "METRIC",
  },
  {
    textParseId: 1001,
    theme: "Métriques",
    group: "Puissance",
    words: "",
    exclusions: '',
    type: "METRIC",
  },
  {
    textParseId: 1002,
    theme: "Métriques",
    group: "Tension",
    words: "",
    exclusions: '',
    type: "METRIC",
  },
  {
    textParseId: 1003,
    theme: "Métriques",
    group: "Longueur",
    words: "",
    exclusions: '',
    type: "METRIC",
  },
  {
    textParseId: 1004,
    theme: "Métriques",
    group: "Montant",
    words: "",
    exclusions: '',
    type: "METRIC",
  },
  {
    textParseId: 1005,
    theme: "Métriques",
    group: "Courant",
    words: "",
    exclusions: '',
    type: "METRIC",
  },
  {
    textParseId: 27,
    theme: "Métriques",
    group: "Voltage (kV)",
    words: "KV § kilovolt § kilo volt § kilo-volt",
    exclusions: '',
    type: "METRIC",
  },
  /*
  {
    textParseId: 28,
    theme: "Requested Experience",
    group: "Requested Experience",
    words: "Have completed § has completed § following § experience § years § eligibility",
    exclusions: '',
    type: "KEYWORD",
  },
  */
  {
    textParseId: 29,
    theme: "Design",
    group: "Type",
    words: "single § double § triple",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 30,
    theme: "Design",
    group: "AC/DC",
    words: "AC/DC § AC § DC",
    exclusions: '',
    type: "KEYWORD",
  },
  {
    textParseId: 31,
    theme: "Contract type",
    group: "Long term / Frame agreement",
    words: "service|contract,biennal|contract,rate|contract,annual|contract,bi-annual|contract,year|contract,yearly|contract,umbrella|contract,umbrella|agreement",
    exclusions: '',
    type: "WORD_COUPLE",
    scopes: 'TITLE',
  },
  {
    textParseId: 100,
    theme: "Contract type",
    group: "Long term / Frame agreement",
    words: "months Term contract § months contract § months agreement § Blanket agreement § purchase agreement § annual maintenance § frame agreement § framework agreement § biennial",
    exclusions: '',
    type: "KEYWORD",
    scopes: 'TITLE',
  },
  {
    textParseId: 101,
    theme: "Contract type",
    group: "PPA / IPP agreement",
    words: "Power Purchase Agreement § Energy Purchase Agreement § PPA § IPP § Independant Power Producer § Producteur d'électricité indépendant § Producteur d'électricité non-public § non-utility generator § NUG § Producteur d'électricité non public § non utility generator § independent Energy producer § independant Energy producer § local power producer § local energy producer § producteurs indépendents d’électricité § Build, own, operate § Build own operate § Independent Power Producer § boom § dbfommt § dbfot § build, finance § build finance § build and finance § finance build § finance, build § finance and build §  Build, operate § Build operate § Build and Operate § Build-own-operate § own operate § own, operate",
    exclusions: '',
    type: "KEYWORD",
    scopes: 'TITLE, DESCRIPTION',
  },

  { textParseId: 32, theme: "Brand", group: "GE", words: "GE § General Electric", exclusions: 'under GE', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 33, theme: "Brand", group: "Siemens", words: "Siemens", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 34, theme: "Brand", group: "Weidmuller", words: "weidmuller", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 35, theme: "Brand", group: "elgi", words: "elgi", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 36, theme: "Brand", group: "abb", words: "abb", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 37, theme: "Brand", group: "phoenix", words: "phoenix", exclusions: 'Phoenix, Arizona', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 38, theme: "Brand", group: "schneider electric", words: "schneider", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 39, theme: "Brand", group: "rittal", words: "rittal", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 40, theme: "Brand", group: "rexroth", words: "rexroth", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 41, theme: "Brand", group: "bhel", words: "bhel", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 42, theme: "Brand", group: "emco", words: "emco", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 43, theme: "Brand", group: "alstom", words: "alstom § alsthom", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 46, theme: "Brand", group: "AEG", words: "AEG", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 47, theme: "Brand", group: "Alcatel", words: "Alcatel", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 48, theme: "Brand", group: "Arteche", words: "Arteche", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 49, theme: "Brand", group: "Dalian", words: "Dalian", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 50, theme: "Brand", group: "Eaton", words: "Eaton", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 51, theme: "Brand", group: "Elsewedy", words: "Elsewedy", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 52, theme: "Brand", group: "Extron", words: "Extron", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 53, theme: "Brand", group: "EDF", words: "EDF", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 54, theme: "Brand", group: "Efacec", words: "Efacec", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 55, theme: "Brand", group: "Erikson", words: "Erikson § Ericson", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 57, theme: "Brand", group: "Huawai", words: "Huawai", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 58, theme: "Brand", group: "Hitachi", words: "Hitachi", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 59, theme: "Brand", group: "Hyosung", words: "Hyosung", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 60, theme: "Brand", group: "Ingeteam", words: "Ingeteam", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 61, theme: "Brand", group: "Lucy", words: "Lucy", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 62, theme: "Brand", group: "Megger", words: "Megger", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 63, theme: "Brand", group: "Mitsui", words: "Mitsui", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 64, theme: "Brand", group: "Mitsubishi", words: "Mitsubishi", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 65, theme: "Brand", group: "Nexans", words: "Nexans", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 66, theme: "Brand", group: "Pfeiffer", words: "Pfeiffer", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 67, theme: "Brand", group: "Pfiffner", words: "Pfiffner", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 68, theme: "Brand", group: "Prysmian", words: "Prysmian", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 69, theme: "Brand", group: "Qualitrol", words: "Qualitrol", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 70, theme: "Brand", group: "Rotex", words: "Rotex", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 71, theme: "Brand", group: "Sergi", words: "Sergi", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 72, theme: "Brand", group: "Schweitzer", words: "Schweitzer", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 73, theme: "Brand", group: "Saft", words: "Saft", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },
  { textParseId: 74, theme: "Brand", group: "Toshiba", words: "Toshiba", exclusions: '', type: "KEYWORD", scopes: 'TITLE', },

  // financial
  { textParseId: 102, theme: "Financial Organization", group: "United Kingdom export finance", words: "UK export finance § Export Credits Guarantee Department", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 103, theme: "Financial Organization", group: "Banque de développement des etats de l’afrique centrale", words: "Communauté économique et monétaire de l'Afrique centrale", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 104, theme: "Financial Organization", group: "World bank", words: "Banque internationale pour la reconstruction et le développement §  International Bank for Reconstruction and Development § Association internationale de développement § International Development Association § International Finance Corporation § Multilateral Investment Guarantee Agency § International Centre for Settlement of Investment Disputes", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 105, theme: "Financial Organization", group: "African developent bank", words: "Banque africaine de développement", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 106, theme: "Financial Organization", group: "Banque ouest africaine de développement", words: "", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 107, theme: "Financial Organization", group: "Ecowas bank for investment and development", words: "ecowas bank for investment and development", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 108, theme: "Financial Organization", group: "Asian development bank", words: "Banque asiatique de développement § Asian Development Bank Institute", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 109, theme: "Financial Organization", group: "Inter-american development bank", words: "banque interaméricaine de développement § Banco Interamericano de Desenvolvimento § Banco Interamericano de Desarrollo", type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 110, theme: "Financial Organization", group: "Development bank of latin america", words: "Corporacion Andina de Fomento § Banco de Desarrollo de América Latina § Corporação Andina de Fomento § Corporation andine de développement", type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 111, theme: "Financial Organization", group: "Asian infrastructure investment bank", words: "Banque asiatique d'investissement pour les infrastructures", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 112, theme: "Financial Organization", group: "Agence française de développement", words: "Proparco", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 113, theme: "Financial Organization", group: "European investment bank", words: "Banque européenne d'investissement", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 114, theme: "Financial Organization", group: "European bank for reconstruction and development", words: "Banque européenne pour la reconstruction et le développement", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 115, theme: "Financial Organization", group: "Kreditanstalt für wiederaufbau", words: "Établissement de crédit pour la reconstruction", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 116, theme: "Financial Organization", group: "Deutsche gesellschaft für internationale zusammenarbeit", words: "GIZ § agence de coopération internationale allemande pour le développement", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 117, theme: "Financial Organization", group: "Department for international development of the united kingdom", words: "", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 118, theme: "Financial Organization", group: "Japan international cooperation agency", words: "Agence japonaise de coopération internationale", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 119, theme: "Financial Organization", group: "United states agency for international development", words: "Agence des États‑Unis pour le développement international", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 120, theme: "Financial Organization", group: "Millenium challenge corporation", words: "Millennium Challenge Account", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 121, theme: "Financial Organization", group: "Export-import bank of china", words: "Exim Bank of China § Chexim § China Exim Bank § Avi Funding Co. Ltd. § Buttonwood Investment Holding Company Ltd § Industrial and Commercial Bank of China § Asset Management Arm § Export-Import Bank Of China, Shaanxi Branch § Export-Import Bank Of China Yunnan Branch § Export-Import Bank Of China Shenzhen Branch § Export-Import Bank Of China, Zhejiang Branch", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 122, theme: "Financial Organization", group: "Export-import bank of india", words: "Exim Bank of India § Export-Import Bank of India § Asset Management Arm § Export Import Bank of India § London Branch", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 123, theme: "Financial Organization", group: "Export-import bank of korea", words: "Korea Eximbank § KEXIM ASIA LIMITED § PT Koexim Mandiri Finance § DAE SUN Shipbuilding & Engineering Co. § KEXIM Bank UK Limited", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 124, theme: "Financial Organization", group: "Spanish agency for international development cooperation", words: "Agence espagnole pour la coopération internationale au développement §  secrétariat d’État à la Coopération internationale et à l’Amérique latine", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 125, theme: "Financial Organization", group: "Cassa depositi e prestiti", words: "Servizi Assicurativi del Commercio Estero § Fondo Strategico Italiano § Open Fiber", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 126, theme: "Financial Organization", group: "Norwegian agency for development cooperation", words: "", type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 127, theme: "Financial Organization", group: "Norwegian trust fund", words: "Government Pension Fund-Global § Government Pension Fund of Norway § Government Petroleum Fund", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 128, theme: "Financial Organization", group: "Danish international development agency", words: "Danida", type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 129, theme: "Financial Organization", group: "Swedish international development cooperation agency", words: "Agence suédoise de développement et coopération internationale § Swedish International Developpment Authority § Styrelsen för Internationellt Utvecklingssamarbete", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 130, theme: "Financial Organization", group: "Swiss agency for development and cooperation", words: "Direction du développement et de la coopération § Département fédéral des affaires étrangères", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 131, theme: "Financial Organization", group: "Canadian international development agency", words: "Agence canadienne de développement international", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 132, theme: "Financial Organization", group: "Luxembourg agency for development cooperation", words: "Luxdev § Luxembourg Development Cooperation § Lux-Development S.A.", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 133, theme: "Financial Organization", group: "Belgian development agency", words: "Enabel § l’Agence belge de développement § Enabel Belgian development agency", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 134, theme: "Financial Organization", group: "Development bank of south africa", words: "Banque de développement d'Afrique du Sud § Dbsa Development Fund", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 135, theme: "Financial Organization", group: "Islamic development bank", words: "La Banque islamique de développement § Meezan Bank § United Bank of Albania § Tadamun Services Berhad § World Waqf Foundation § OICNetworks Sdn Bhd § Islamic Development Bank Group", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 136, theme: "Financial Organization", group: "Arab bank for economic development in africa", words: "Banque arabe pour le développement économique en Afrique", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 137, theme: "Financial Organization", group: "Abu dhabi fund for development", words: "", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 138, theme: "Financial Organization", group: "Abu dhabi investment authority", words: "", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 139, theme: "Financial Organization", group: "Saudi fund for development", words: "", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 140, theme: "Financial Organization", group: "Kuwait fund for arab economic development", words: "", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 141, theme: "Financial Organization", group: "Opec fund for international development", words: "Fonds de l'OPEP pour le développement international", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 142, theme: "Financial Organization", group: "Arab fund for economic and social development", words: "Fonds arabe pour le développement économique et social", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 143, theme: "Financial Organization", group: "New zealand agency for international development", words: "", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 144, theme: "Financial Organization", group: "Brazilian development bank", words: "Banco Nacional de Desenvolvimento Econômico e Social § Fundacao de Assistencia e Previdencia Social do BNDES § Agencia Especial de Financiamento Industrial FINAME", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 145, theme: "Financial Organization", group: "Industrial development bank of turkey", words: "TSKB Gayrimenkul § Turkiye Sinai Kalkinma Bankasi A.S. § Vakifbank § Şişecam", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 146, theme: "Financial Organization", group: "Nacional financiera", words: "nafin, nafinsa", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 147, theme: "Financial Organization", group: "Caisse de dépot et de gestion", words: "CDG Capital § CDG Développement § Société de Développement de Saïdia § Société d'Aménagement et de Promotion de la Station de Taghazout § Société d'aménagement Zenata § Fipar-Holding", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 148, theme: "Financial Organization", group: "International development finance club", words: "", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 149, theme: "Financial Organization", group: "International development agency", words: "", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 150, theme: "Financial Organization", group: "Multilateral investment guarantee agency", words: "Agence multilatérale de garantie des investissements", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },
  { textParseId: 151, theme: "Financial Organization", group: "Export-import bank of the united states", words: "Exim Bank of The United States", exclusions: '', type: "KEYWORD", scopes: 'TITLE, DESCRIPTION', },

]

exports.textParseList = textParses

exports.matching_positions = (_text, _word, _case_sensitive, _whole_words, _multiline) => {
  var _match_pattern = "g" + (_case_sensitive ? "i" : "") + (_multiline ? "m" : "")
  var _bound = _whole_words ? "\\b" : ""
  var _re = new RegExp(_bound + _word + "(s|x|)" + _bound, _match_pattern)
  var _pos = [], _chunk, _index = 0

  while (true) {
    _chunk = _re.exec(_text)
    if (_chunk == null) {
      break
    }
    _pos.push({
      word: _chunk[0],
      index: _chunk['index'],
    })
    _re.lastIndex = _chunk['index'] + 1
  }

  return _pos
}

const removeDiacritics = (str) => {
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return str
}
exports.removeDiacritics = removeDiacritics

exports.cpvParseTreat = (text, CpvList, CpvListFormated, scope) => {
  if (!CpvList) {
    return null
  }

  const contextLength = 40
  const textNew = removeDiacritics(text).toUpperCase()

  const tenderCriterions = []
  for (let cpv of CpvList) {
    if (!cpv.cpvWords || !cpv.cpvWords.length) {
      continue
    }
    for (const cpvWord of cpv.cpvWords) {
      const word = cpvWord.word.trim()
      if (!word || word.trim() === '') {
        continue
      }

      let wordTemp = word
      if (!CpvListFormated) {
        wordTemp = removeDiacritics(word).toUpperCase().trim()
      }

      let positions = this.matching_positions(textNew, wordTemp, true, true, true)
      for (const position of positions) {
        let context = text.substring(position.index - contextLength, position.index + word.length + contextLength).replace(/\n/g, " ")

        tenderCriterions.push({
          cpvId: cpvWord.cpvId,
          cpvWordId: cpvWord.cpvWordId,
          word: word,
          wordMatch: text.substring(position.index, position.index + position.word.length).trim(),
          startIndex: position.index,
          value: cpv.label,
          context,
          cpv,
        })
      }
    }
  }

  return tenderCriterions
}

exports.textParseTreat = (text, textParses, scope) => {
  if (!textParses) {
    return null
  }
  const contextLength = 40
  const textNew = removeDiacritics(text).toUpperCase()

  const tenderCriterions = []
  for (let textParse of textParses) {
    if (textParse.scopes && !textParse.scopes.includes(scope)) {
      continue
    }

    if (!textParse.words || textParse.words.trim() === '') {
      continue
    }


    // If exception found don't search this textParse
    let exclusionFound = false
    if (textParse.exclusions && textParse.exclusions.trim() !== '') {
      for (let exclusionWord of textParse.exclusions.trim().split('§')) {
        let regExException = new RegExp("\\b" + exclusionWord + "\\b", 'gi')
        if (text.match(regExException)) {
          exclusionFound = true
          break
        }
      }
    }
    if (exclusionFound) {
      continue
    }

    if (textParse.type === 'WORD_COUPLE') {
      const wordCouples = textParse.words.trim().split('§')
      for (const wordCouple of wordCouples) {
        let word1 = wordCouple.split('|')[0].trim()
        let word2 = wordCouple.split('|')[1].trim()
        if (
          !word1
          || word1.trim() === ''
          || !word2
          || word2.trim() === ''
        ) {
          continue
        }
        const regExWordCouple = new RegExp(`(\\b${word1}\\b(.)*\\b${word2}\\b)|\\b${word2}\\b(.)*\\b${word1}\\b`, 'gi')
        const matchResult = text.match(regExWordCouple)
        if (matchResult) {
          tenderCriterions.push({
            textParseId: textParse.textParseId,
            word: word1.trim(),
            wordMatch: matchResult[0],
            startIndex: -1,
            value: '',
            context: text,
          })
        }
      }
    } else {
      const words = textParse.words.split('§')
      words.push(textParse.group)
      for (const word of words) {
        if (!word || word.trim() === '') {
          continue
        }
        const wordTemp = removeDiacritics(word).toUpperCase().trim()

        let positions = this.matching_positions(textNew, wordTemp, true, true, true)
        for (const position of positions) {
          let context = text.substring(position.index - contextLength, position.index + word.length + contextLength).replace(/\n/g, " ")
          let value = ''

          if (textParse.type === 'METRIC') {
            let index = 0
            const regex = /^-?\d*(\,|\.|\s)?\d*$/
            while (true) {
              if (position.index - index - 1 < 0) {
                break
              }
              let char = text.substring(position.index - index - 1, position.index - index)
              if (char.match(regex)) {
                value = char + value
              } else {
                break
              }
              index = index + 1
            }
            value = value.trim()
          }

          tenderCriterions.push({
            textParseId: textParse.textParseId,
            word: word.trim(),
            wordMatch: text.substring(position.index, position.index + position.word.length).trim(),
            startIndex: position.index,
            value,
            context,
          })
        }
      }
    }
  }

  return tenderCriterions
}

exports.tenderCriterionAddUpdate = (tenderCriterion) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let tenderCriterionNew = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'tenderCriterion', tenderCriterion)
      resolve(tenderCriterionNew)
    } catch (err) { reject(err) }
  })
}

exports.tenderCriterionDelete = (tenderCriterionId, documentId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      // Remove document from Deepbloo BDD
      let query = `DELETE FROM tenderCriterion WHERE tenderCriterionId = ${BddTool.NumericFormater(tenderCriterionId, BddEnvironnement, BddId)}`
      if (documentId) {
        query = `DELETE FROM tenderCriterion WHERE documentId = ${BddTool.NumericFormater(documentId, BddEnvironnement, BddId)}`
      }
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

exports.tenderCriterionCpvAddUpdate = (tenderCriterionCpv) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      let tenderCriterionCpvNew = await BddTool.RecordAddUpdate(BddId, BddEnvironnement, 'tenderCriterionCpv', tenderCriterionCpv)
      resolve(tenderCriterionCpvNew)
    } catch (err) { reject(err) }
  })
}
