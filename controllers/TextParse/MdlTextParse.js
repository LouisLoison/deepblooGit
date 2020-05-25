exports.textExclusion = (text, scope) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!text) {
        resolve(true)
        return true
      }

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
              break
            }
          }
          if (exceptionFound) {
            resolve(false)
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
              break
            }
          }
          if (exceptionFound) {
            resolve(false)
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
                break
              }
            }
            if (exceptionFound) {
              resolve(false)
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
                break
              }
            }
            if (exceptionFound) {
              resolve(false)
              return false
            }
          }
        }
      }

      resolve(true)
    } catch (err) { reject(err) }
  })
}

exports.textParseSearch = (text, scope) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!text) {
        resolve()
        return true
      }

      let isLongTermFrameAgreement = false
      let brand = null
      if (scope === 'TITLE') {
        const wordCouples = [
          {
            word1: 'service',
            word2: 'contract',
          },
          {
            word1: 'biennal',
            word2: 'contract',
          },
          {
            word1: 'rate',
            word2: 'contract',
          },
          {
            word1: 'annual',
            word2: 'contract',
          },
          {
            word1: 'bi-annual',
            word2: 'contract',
          },
          {
            word1: 'year',
            word2: 'contract',
          },
          {
            word1: 'yearly',
            word2: 'contract',
          },
          {
            word1: 'umbrella',
            word2: 'contract',
          },
          {
            word1: 'umbrella',
            word2: 'agreement',
          },
        ]

        // Protection exception
        for (const wordCouple of wordCouples) {
          const regExWordCouple = new RegExp(`\\b${wordCouple.word1}\\b(.)\\b${wordCouple.word2}\\b`, 'gi')
          if (text.match(regExWordCouple)) {
            isLongTermFrameAgreement = true
            break
          }
        }

        const brands = [
          'GE',
          'Siemens',
          'weidmuller',
          'elgi',
          'abb',
          'phoenix',
          'schneider electric',
          'rittal',
          'rexroth',
          'bhel',
          'emco',
          'alstom',
          'alsthom',
        ]
        for (const brandSearchs of brands) {
          const regExWordCouple = new RegExp(`\\b${brandSearchs}\\b(.)\\bmake\\b`, 'gi')
          if (text.match(regExWordCouple)) {
            brand = brandSearchs
            break
          }
        }
      }

      resolve({
        isLongTermFrameAgreement,
        brand,
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
        {
          textParseId: 5,
          theme: "Scope of Work",
          group: "Maintenance",
          words: "Maintenance, construction",
          type: "KEYWORD",
        },
        {
          textParseId: 6,
          theme: "Scope of Work",
          group: "Construction/Commisioning",
          words: "Construction, reconstruction, Turnkey, Réalisation, realisation, commissioning, mise en service, exension, EPC",
          type: "KEYWORD",
        },
        {
          textParseId: 7,
          theme: "Scope of Work",
          group: "Installation",
          words: "installation",
          type: "KEYWORD",
        },
        {
          textParseId: 8,
          theme: "Scope of Work",
          group: "Procurement",
          words: "Supply, Procurement, fourniture, livraison, Purchase, Achat, Provision",
          type: "KEYWORD",
        },
        {
          textParseId: 9,
          theme: "Scope of Work",
          group: "Consulting/Audit",
          words: "Consulting, audit, consultant, consultancy, assesment, Assessing, Feasability",
          type: "KEYWORD",
        },
        {
          textParseId: 10,
          theme: "Scope of Work",
          group: "Design",
          words: "engineering, design",
          type: "KEYWORD",
        },
        {
          textParseId: 11,
          theme: "Scope of Work",
          group: "Refurbishment/upgrade",
          words: "Refurbishment, rehabilitation, upgrade, upgrading, restoration",
          type: "KEYWORD",
        },
        {
          textParseId: 12,
          theme: "Scope of Work",
          group: "Operation",
          words: "Operation, control",
          type: "KEYWORD",
        },
        {
          textParseId: 13,
          theme: "Scope of Work",
          group: "Manufacturing",
          words: "manufacture, manufacturing",
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
          words: "Industry, industrial, industriel, Industrie, agro, factory, plant, usine",
          type: "KEYWORD",
        },
        {
          textParseId: 16,
          theme: "Segment",
          group: "Rural electrification",
          words: "rural, ruraux, remote area, eleclricity access, access to electricity, energy access, commune rurale, village, localité, locality, localities",
          type: "KEYWORD",
        },
        {
          textParseId: 17,
          theme: "Segment",
          group: "Public Lighting",
          words: "Public lighting, éclairage de rue, éclairage urbain, lampadaire, lampadaires, street light, street lighting, street lightings, street lights, streetlight, streetlighting, streetlightings, streetlights",
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
          group: "C&I",
          words: "commercial, building, mall, business center, hospital, hopital, health center, small business, small businesses",
          type: "KEYWORD",
        },
        {
          textParseId: 20,
          theme: "Segment",
          group: "Residential",
          words: "residential, residentiel, homes, house, household, Residences",
          type: "KEYWORD",
        },
        {
          textParseId: 21,
          theme: "Segment",
          group: "Railway",
          words: "Railway, railroad, voie ferrée, ferroviaire, chemin de fer, métro",
          type: "KEYWORD",
        },
        {
          textParseId: 22,
          theme: "Segment",
          group: "Substation",
          words: "switchyard, switchgear, substation",
          type: "KEYWORD",
        },
        {
          textParseId: 23,
          theme: "Segment",
          group: "Transmission Line",
          words: "aerial line, aerial lines, distribution line, distribution lines, high voltage line, high voltage lines, hv line, hv lines, ligne de distribution, ligne de transmission, ligne haute tension, ligne ht, lignes de distribution, lignes de transmission, lignes haute tension, lignes ht, overhead lines, overheadline, power line, powerline, transmission line",
          type: "KEYWORD",
        },
        /*
        {
          textParseId: 24,
          theme: "Financing",
          group: "Financing",
          words: "African Development Bank, AfDB, Development Bank, Fund, grant, financing, financed, investor",
          type: "KEYWORD",
        },
        */
        {
          textParseId: 25,
          theme: "Métriques",
          group: "Distance",
          words: "kms, kilomètres, mètres",
          type: "METRIC",
        },
        {
          textParseId: 26,
          theme: "Métriques",
          group: "Puissance",
          words: "KWp, KW, KWh, MW, GW, KVA, watt, watts, kilo-watt, kilowatt, mégawatt, mega-watt, megawatt",
          type: "METRIC",
        },
        {
          textParseId: 27,
          theme: "Métriques",
          group: "Tension",
          words: "KV, volt",
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

exports.textParseTreat = (text, textParses) => {
  if (!textParses) {
    return null
  }

  const contextLength = 40
  const textNew = require(process.cwd() + '/controllers/CtrlTool').removeDiacritics(text).toUpperCase()

  const tenderCriterions = []
  for (let textParse of textParses) {
    if (!textParse.words || textParse.words.trim() === '') {
      continue
    }
    const words = textParse.words.split(',')
    for (const word of words) {
      const wordTemp = require(process.cwd() + '/controllers/CtrlTool').removeDiacritics(word).toUpperCase().trim()

      let positions = this.matching_positions(textNew, wordTemp, true, true, true)
      for (const position of positions) {
        let context = text.substring(position.index - contextLength, position.index + word.length + contextLength).replace(/\n/g, " ")
        let value = ''
        
        if (textParse.type === "METRIC") {
          let index = 0
          const regex = /^-?\d*(\,|\.|\s)?\d*$/
          while (true) {
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

  return tenderCriterions
}

exports.cpvParseTreat = (text, CpvList) => {
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
      const wordTemp = require(process.cwd() + '/controllers/CtrlTool').removeDiacritics(word).toUpperCase().trim()

      let positions = this.matching_positions(textNew, wordTemp, true, true, true)
      for (const position of positions) {
        let context = text.substring(position.index - contextLength, position.index + word.length + contextLength).replace(/\n/g, " ")
        let value = ''

        tenderCriterions.push({
          cpvId: cpvWord.cpvId,
          cpvWordId: cpvWord.cpvWordId,
          word: word,
          wordMatch: text.substring(position.index, position.index + position.word.length).trim(),
          startIndex: position.index,
          value,
          context,
        })
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

exports.tenderParse = (tender, CpvList, textParses) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const BddTool = require(process.cwd() + '/global/BddTool')
      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe

      // Remove tenderCriterion of this tender
      let query = `DELETE FROM tenderCriterionCpv WHERE tenderId = ${BddTool.NumericFormater(tender.id, BddEnvironnement, BddId)} `
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      query = `DELETE FROM tenderCriterion WHERE tenderId = ${BddTool.NumericFormater(tender.id, BddEnvironnement, BddId)} `
      await BddTool.QueryExecBdd2(BddId, BddEnvironnement, query)
      const tenderCriterionCpvs = []
      const tenderCriterions = []

      // Check CPV on tender title
      const tenderCriterionCpvTitles = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').cpvParseTreat(tender.title, CpvList)
      if (tenderCriterionCpvTitles) {
        for (const tenderCriterionCpv of tenderCriterionCpvTitles) {
          let tenderCriterionCpvFind = tenderCriterionCpvs.find(a => 
            a.cpvId === tenderCriterionCpv.cpvId
            && a.scope === 'TITLE'
          )
          if (!tenderCriterionCpvFind) {
            tenderCriterionCpvFind = {
              tenderId: tender.id,
              cpvId: tenderCriterionCpv.cpvId,
              value: tenderCriterionCpv.value,
              word: tenderCriterionCpv.word,
              findCount: 0,
              status: 1,
              scope: 'TITLE',
            }
            tenderCriterionCpvs.push(tenderCriterionCpvFind)
          }
          tenderCriterionCpvFind.findCount = tenderCriterionCpvFind.findCount + 1
        }
      }

      // Check CPV on tender description
      const tenderCriterionCpvDescriptions = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').cpvParseTreat(tender.description, CpvList)
      if (tenderCriterionCpvDescriptions) {
        for (const tenderCriterionCpv of tenderCriterionCpvDescriptions) {
          let tenderCriterionCpvFind = tenderCriterionCpvs.find(a => 
            a.cpvId === tenderCriterionCpv.cpvId
            && a.scope === 'DESCRIPTION'
          )
          if (!tenderCriterionCpvFind) {
            tenderCriterionCpvFind = {
              tenderId: tender.id,
              cpvId: tenderCriterionCpv.cpvId,
              value: tenderCriterionCpv.value,
              word: tenderCriterionCpv.word,
              findCount: 0,
              status: 1,
              scope: 'DESCRIPTION',
            }
            tenderCriterionCpvs.push(tenderCriterionCpvFind)
          }
          tenderCriterionCpvFind.findCount = tenderCriterionCpvFind.findCount + 1
        }
      }

      for (const tenderCriterionCpv of tenderCriterionCpvs) {
        await this.tenderCriterionCpvAddUpdate(tenderCriterionCpv)
      }

      // Parse tender title
      const tenderCriterionTitles = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseTreat(tender.title, textParses)
      for (const tenderCriterion of tenderCriterionTitles) {
        let tenderCriterionFind = tenderCriterions.find(a => 
          a.textParseId === tenderCriterion.textParseId
          && a.scope === 'TITLE'
        )
        if (!tenderCriterionFind) {
          tenderCriterionFind = {
            tenderId: tender.id,
            textParseId: tenderCriterion.textParseId,
            value: tenderCriterion.value,
            word: tenderCriterion.word,
            findCount: 0,
            status: 1,
            scope: 'TITLE',
          }
          tenderCriterions.push(tenderCriterionFind)
        }
        tenderCriterionFind.findCount = tenderCriterionFind.findCount + 1
      }

      // Parse tender description
      const tenderCriterionDescriptions = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textParseTreat(tender.description, textParses)
      for (const tenderCriterion of tenderCriterionDescriptions) {
        let tenderCriterionFind = tenderCriterions.find(a => 
          a.textParseId === tenderCriterion.textParseId
          && a.scope === 'DESCRIPTION'
        )
        if (!tenderCriterionFind) {
          tenderCriterionFind = {
            tenderId: tender.id,
            textParseId: tenderCriterion.textParseId,
            value: tenderCriterion.value,
            word: tenderCriterion.word,
            findCount: 0,
            status: 1,
            scope: 'DESCRIPTION',
          }
          tenderCriterions.push(tenderCriterionFind)
        }
        tenderCriterionFind.findCount = tenderCriterionFind.findCount + 1
      }
      const tenderCriterionNews = []
      for (const tenderCriterion of tenderCriterions) {
        const tenderCriterionNew = await this.tenderCriterionAddUpdate(tenderCriterion)
        tenderCriterionNews.push(tenderCriterionNew)
      }

      resolve()
    } catch (err) {
      reject(err)
    }
  })
}
