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
        {
          textParseId: 24,
          theme: "Financing",
          group: "Financing",
          words: "African Development Bank, AfDB, Development Bank, Fund, grant, financing, financed, investor",
          type: "KEYWORD",
        },
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
        {
          textParseId: 28,
          theme: "Requested Experience",
          group: "Requested Experience",
          words: "Have completed, has completed, following, experience, years, eligibility",
          type: "KEYWORD",
        },
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

exports.textParseTreat = (text, textParses) => {
  if (!textParses) {
    return null
  }

  matching_positions = (_text, _word, _case_sensitive, _whole_words, _multiline) => {
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

      let positions = matching_positions(textNew, wordTemp, true, true, true)
      for (const position of positions) {
        let context = text.substring(position.index - contextLength, position.index + word.length + contextLength).replace(/\n/g, " ")
        let number = ''
        
        if (textParse.type === "METRIC") {
          let index = 0
          const regex = /^-?\d*(\,|\.|\s)?\d*$/
          while (true) {
            let char = text.substring(position.index - index - 1, position.index - index)
            if (char.match(regex)) {
              number = char + number
            } else {
              break
            }
            index = index + 1
          }
          number = number.trim()
        }

        tenderCriterions.push({
          textParseId: textParse.textParseId,
          word: word.trim(),
          match: text.substring(position.index, position.index + position.word.length).trim(),
          number,
          index: position.index,
          context,
        })
      }
    }
  }

  return tenderCriterions
}
