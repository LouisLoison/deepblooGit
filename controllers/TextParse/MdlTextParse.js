exports.textExclusion = (text, scope) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!text) {
        resolve({
          status: true
        })
        return true
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
            resolve({
              origine,
              status: false
            })
            return false
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
            resolve({
              origine,
              status: false
            })
            return false
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
              resolve({
                origine,
                status: false
              })
              return false
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
              resolve({
                origine,
                status: false
              })
              return false
            }
          }
        }
      }

      resolve({
        status: true
      })
    } catch (err) { reject(err) }
  })
}

exports.textExclusionIfNoCpv = (text, scope) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!text) {
        resolve({
          status: true
        })
        return true
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
            resolve({
              origine: `${wordCouple.word1}|${wordCouple.word2}`,
              status: false
            })
            return false
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
          resolve({
            origine: word,
            status: false
          })
          return false
        }
      }

      resolve({
        status: true
      })
    } catch (err) { reject(err) }
  })
}

exports.textParseList = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const textParses = [
        {
          textParseId: 1,
          theme: "Budget",
          group: "Dollar",
          words: "Dollar",
          type: "METRIC",
        },
        {
          textParseId: 2,
          theme: "Budget",
          group: "Yen",
          words: "¥",
          type: "METRIC",
        },
        {
          textParseId: 3,
          theme: "Budget",
          group: "Euro",
          words: "€",
          type: "METRIC",
        },
        {
          textParseId: 4,
          theme: "Budget",
          group: "Livre",
          words: "£",
          type: "METRIC",
        },
        // Scope of Work
        {
          textParseId: 5,
          theme: "Scope of Work",
          group: "Maintenance/repair",
          words: "Maintenance, repair, repairs, repairing, rectify, rectifying, assistance, spares",
          type: "KEYWORD",
        },
        {
          textParseId: 6,
          theme: "Scope of Work",
          group: "Construction/Commisioning",
          words: "Construction, reconstruction, Turnkey, commissioning, extension, EPC, fabrication, realization, civil work, civil works, mise en service, génie civil",
          type: "KEYWORD",
        },
        {
          textParseId: 7,
          theme: "Scope of Work",
          group: "Installation",
          words: "install, installation, installing, assembly, realization, erection, erecting",
          type: "KEYWORD",
        },
        {
          textParseId: 8,
          theme: "Scope of Work",
          group: "Procurement",
          words: "Supply, supplying, Procurement, procurment, Purchase, acquisition, procuring, provision of, delivery, deliver, delivering, furnish, furnishing, furnishings, fourniture, achats",
          type: "KEYWORD",
        },
        {
          textParseId: 9,
          theme: "Scope of Work",
          group: "Consulting/Audit",
          words: "Consulting, audit, consultant, consultancy, assess, assesment, Assessing, Feasability, pre-feasability, survey, surveying, consultative, consultatory, provision of services, measurement, investigation, study, studies, report, étude, advice, due diligence, evaluation, evaluate, evaluating, évaluation, analysis, analyse",
          type: "KEYWORD",
        },
        {
          textParseId: 80,
          theme: "Scope of Work",
          group: "Training",
          words: "Training, formation",
          type: "KEYWORD",
        },
        {
          textParseId: 81,
          theme: "Scope of Work",
          group: "Certification/approval",
          words: "Certify, certification, certifying, approval",
          type: "KEYWORD",
        },
        {
          textParseId: 82,
          theme: "Scope of Work",
          group: "Testing/Measurement/Qualif",
          words: "Testing, test, measure, measuring, qualification, qualify",
          type: "KEYWORD",
        },
        {
          textParseId: 10,
          theme: "Scope of Work",
          group: "Design",
          words: "engineering, design,  designing, drawing , schemes",
          type: "KEYWORD",
        },
        {
          textParseId: 11,
          theme: "Scope of Work",
          group: "Refurbishment/upgrade",
          words: "Refurbishment, rehabilitation, upgrade, upgrading, upgradation, restoration, replacement, replace, replacing, reconstruction, retrofit, refurbish, expansion, extension, modernization, renovation",
          type: "KEYWORD",
        },
        {
          textParseId: 12,
          theme: "Scope of Work",
          group: "Operation/Control/Supervision",
          words: "Operation, control, monitoring, supervision, exploitation, inspection",
          type: "KEYWORD",
        },
        {
          textParseId: 83,
          theme: "Scope of Work",
          group: "Project Management",
          words: "project management, manage project, lead project, gestion de projet",
          type: "KEYWORD",
        },
        {
          textParseId: 84,
          theme: "Scope of Work",
          group: "Transport/Logistic",
          words: "loading, carriage, unloading, transportation, transport",
          type: "KEYWORD",
        },
        {
          textParseId: 13,
          theme: "Scope of Work",
          group: "Manufacturing",
          words: "manufacture, manufacturing, producing, production, fabrication",
          type: "KEYWORD",
        },
        // Segment 85
        {
          textParseId: 85,
          theme: "Segment",
          group: "Agriculture",
          words: "irrigation, agricultural, fishing, agriculture, fertilzer",
          type: "KEYWORD",
        },
        {
          textParseId: 14,
          theme: "Segment",
          group: "Mining",
          words: "mine, mining",
          type: "KEYWORD",
        },
        {
          textParseId: 15,
          theme: "Segment",
          group: "Industry",
          words: "Industry, industrial, factory, plant, manufactory, warehouse",
          type: "KEYWORD",
        },
        {
          textParseId: 16,
          theme: "Segment",
          group: "Rural",
          words: "rural, agrarian, remote area, electricity access, access to electricity, energy access, locality, localities, village, undeserved",
          type: "KEYWORD",
        },
        {
          textParseId: 17,
          theme: "Segment",
          group: "Public Lighting",
          words: "Public lighting,  street light, street lighting, street lightings, street lights, streetlight, streetlighting, streetlightings, streetlights",
          type: "KEYWORD",
        },
        {
          textParseId: 18,
          theme: "Segment",
          group: "Rooftop",
          words: "Rooftop, roof, SHS, solar home system, solar home",
          type: "KEYWORD",
        },
        {
          textParseId: 19,
          theme: "Segment",
          group: "Buisness",
          words: "commercial, building, mall, business center, small business, small businesses, business, commerce, office",
          type: "KEYWORD",
        },
        {
          textParseId: 86,
          theme: "Segment",
          group: "O&G",
          words: "Refinery, gas pipeline, gaz pipeline",
          type: "KEYWORD",
        },
        {
          textParseId: 20,
          theme: "Segment",
          group: "Residential",
          words: "residential, residentiel, homes, house, household, urban, housing",
          type: "KEYWORD",
        },
        {
          textParseId: 21,
          theme: "Segment",
          group: "Railway",
          words: "Railway, railroad, rail line, train line, subway, metro, monorail",
          type: "KEYWORD",
        },
        {
          textParseId: 22,
          theme: "Segment",
          group: "services (school, hospital....)",
          words: "sport, training, school, classroom, hospital, hopital, health center, university, medical center, gaming, airport,  ski, tourism, aquatic, stadium, leisure, amusement, restaurant, crematorium, cutlure house , culure center, cultural center, recreation , food center, care center, senior center, cinema, memory house, memorial, arts, libray, swimming pool, shopping, children parks, national parks",
          type: "KEYWORD",
        },
        // Financing
        /*
        {
          textParseId: 24,
          theme: "Financing",
          group: "Financing",
          words: "African Development Bank, AfDB, Development Bank, Fund, grant, financing, financed, investor",
          type: "KEYWORD",
        },
        */
        // Métriques
        {
          textParseId: 25,
          theme: "Métriques",
          group: "Distance (KM)",
          words: "kms, kilomètres",
          type: "METRIC",
        },
        {
          textParseId: 26,
          theme: "Métriques",
          group: "Puissance (KVA)",
          words: "MVA,megavolt-amp,KVA,Kilovolt-amp",
          type: "METRIC",
        },
        {
          textParseId: 1000,
          theme: "Métriques",
          group: "Puissance (MW)",
          words: "GW,giga-watt,giga watt,MW,mega-watt,megawatt,KW,Kilowatt-hour,kWh,KWp,kilo-watt,kilowatt",
          type: "METRIC",
        },
        {
          textParseId: 27,
          theme: "Métriques",
          group: "Voltage (kV)",
          words: "KV, kilovolt, kilo volt, kilo-volt",
          type: "METRIC",
        },
        /*
        {
          textParseId: 28,
          theme: "Requested Experience",
          group: "Requested Experience",
          words: "Have completed, has completed, following, experience, years, eligibility",
          type: "KEYWORD",
        },
        */
        {
          textParseId: 29,
          theme: "Design",
          group: "Type",
          words: "single, double, triple",
          type: "KEYWORD",
        },
        {
          textParseId: 30,
          theme: "Design",
          group: "AC/DC",
          words: "AC/DC, AC, DC",
          type: "KEYWORD",
        },
        {
          textParseId: 31,
          theme: "Contract type",
          group: "Long term / Frame Agreement",
          words: "service|contract,biennal|contract,rate|contract,annual|contract,bi-annual|contract,year|contract,yearly|contract,umbrella|contract,umbrella|agreement",
          type: "WORD_COUPLE",
          scopes: 'TITLE',
        },

        { textParseId: 32, theme: "Brand", group: "GE", words: "GE, General Electric", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 33, theme: "Brand", group: "Siemens", words: "Siemens", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 34, theme: "Brand", group: "Weidmuller", words: "weidmuller", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 35, theme: "Brand", group: "elgi", words: "elgi", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 36, theme: "Brand", group: "abb", words: "abb", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 37, theme: "Brand", group: "phoenix", words: "phoenix", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 38, theme: "Brand", group: "schneider electric", words: "schneider electric", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 39, theme: "Brand", group: "rittal", words: "rittal", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 40, theme: "Brand", group: "rexroth", words: "rexroth", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 41, theme: "Brand", group: "bhel", words: "bhel", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 42, theme: "Brand", group: "emco", words: "emco", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 43, theme: "Brand", group: "alstom", words: "alstom, alsthom", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 46, theme: "Brand", group: "AEG", words: "AEG", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 47, theme: "Brand", group: "Alcatel", words: "Alcatel", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 48, theme: "Brand", group: "Arteche", words: "Arteche", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 49, theme: "Brand", group: "Dalian", words: "Dalian", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 50, theme: "Brand", group: "Eaton", words: "Eaton", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 51, theme: "Brand", group: "Elsewedy", words: "Elsewedy", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 52, theme: "Brand", group: "Extron", words: "Extron", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 53, theme: "Brand", group: "EDF", words: "EDF", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 54, theme: "Brand", group: "Efacec", words: "Efacec", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 55, theme: "Brand", group: "Erikson", words: "Erikson, Ericson", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 57, theme: "Brand", group: "Huawai", words: "Huawai", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 58, theme: "Brand", group: "Hitachi", words: "Hitachi", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 59, theme: "Brand", group: "Hyosung", words: "Hyosung", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 60, theme: "Brand", group: "Ingeteam", words: "Ingeteam", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 61, theme: "Brand", group: "Lucy", words: "Lucy", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 62, theme: "Brand", group: "Megger", words: "Megger", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 63, theme: "Brand", group: "Mitsui", words: "Mitsui", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 64, theme: "Brand", group: "Mitsubishi", words: "Mitsubishi", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 65, theme: "Brand", group: "Nexans", words: "Nexans", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 66, theme: "Brand", group: "Pfeiffer", words: "Pfeiffer", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 67, theme: "Brand", group: "Pfiffner", words: "Pfiffner", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 68, theme: "Brand", group: "Prysmian", words: "Prysmian", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 69, theme: "Brand", group: "Qualitrol", words: "Qualitrol", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 70, theme: "Brand", group: "Rotex", words: "Rotex", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 71, theme: "Brand", group: "Sergi", words: "Sergi", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 72, theme: "Brand", group: "Schweitzer", words: "Schweitzer", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 73, theme: "Brand", group: "Saft", words: "Saft", type: "KEYWORD", scopes: 'TITLE', },
        { textParseId: 74, theme: "Brand", group: "Toshiba", words: "Toshiba", type: "KEYWORD", scopes: 'TITLE', },
      ]
      resolve(textParses)
    } catch (err) {
      reject(err)
    }
  })
}

exports.matching_positions = (_text, _word, _case_sensitive, _whole_words, _multiline) => {
  var _match_pattern = "g" + (_case_sensitive ? "i" : "") + (_multiline ? "m" : "")
  var _bound = _whole_words ? "\\b" : ""
  var _re = new RegExp(_bound + _word + "(s|x|)" + _bound, _match_pattern)
  var _pos = [], _chunk, _index = 0

  while(true) {
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

exports.cpvParseTreat = (text, CpvList, CpvListFormated, scope) => {
  if (!CpvList) {
    return null
  }

  const contextLength = 40
  const textNew = require(process.cwd() + '/controllers/CtrlTool').removeDiacritics(text).toUpperCase()

  const tenderCriterions = []
  for (let cpv of CpvList) {
    if (!cpv.cpvWords || !cpv.cpvWords.length) {
      continue
    }
    for (const cpvWord of cpv.cpvWords) {
      const word = cpvWord.word.trim()
      let wordTemp = word
      if (!CpvListFormated) {
        wordTemp = require(process.cwd() + '/controllers/CtrlTool').removeDiacritics(word).toUpperCase().trim()
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
  const textNew = require(process.cwd() + '/controllers/CtrlTool').removeDiacritics(text).toUpperCase()

  const tenderCriterions = []
  for (let textParse of textParses) {
    if (textParse.scopes && !textParse.scopes.includes(scope)) {
      continue
    }
  
    if (!textParse.words || textParse.words.trim() === '') {
      continue
    }

    if (textParse.type === 'WORD_COUPLE') {
      const wordCouples = textParse.words.trim().split(',')
      for (const wordCouple of wordCouples) {
        let word1 = wordCouple.split('|')[0].trim()
        let word2 = wordCouple.split('|')[1].trim()
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
      const words = textParse.words.split(',')
      for (const word of words) {
        const wordTemp = require(process.cwd() + '/controllers/CtrlTool').removeDiacritics(word).toUpperCase().trim()

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
      let tenderCriterionNew = await BddTool.RecordAddUpdate('tenderCriterion', tenderCriterion)
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
      await BddTool.QueryExecBdd2(query)
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
      let tenderCriterionCpvNew = await BddTool.RecordAddUpdate('tenderCriterionCpv', tenderCriterionCpv)
      resolve(tenderCriterionCpvNew)
    } catch (err) { reject(err) }
  })
}
