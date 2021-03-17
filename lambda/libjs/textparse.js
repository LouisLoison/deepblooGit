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


const { textParses } = require('./textParseList.js')

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
    } else if (textParse.type !== 'NLP') {
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
