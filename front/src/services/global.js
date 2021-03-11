export class GlobalService {
  constructor () {
  }

  formatMillier (Nombre, priceFormat) {
    if (!Nombre) {
      return ''
    }
    let decimal = 10000000000000
    Nombre = (Math.floor((Math.round(Nombre * decimal) / decimal) * 100) / 100)
    if (priceFormat) {
      Nombre = Nombre.toFixed(2)
    }
    Nombre += ''
    var sep = ' '
    var reg = /(\d+)(\d{3})/
    while (reg.test(Nombre)) {
      Nombre = Nombre.replace(reg, '$1' + sep + '$2')
    }
    return Nombre
  }

  htmlText (html) {
    let span = document.createElement('span')
    span.innerHTML = html
    span.innerHTML = span.textContent || span.innerText
    return span.textContent || span.innerText
  }
  
  facetLabel(field) {
    if (field === 'cpvs') {
      return 'CPV'
    } else if (field === 'user_id') {
      return 'Source'
    } else if (field === 'bid_deadline_timestamp') {
      return 'Bid deadline'
    } else if (field === 'publication_timestamp') {
      return 'Was Published'
    } else if (field === 'lang') {
      return 'Language'
    } else if (field === 'region_lvl0') {
      return 'Region'
    } else if (field === 'region_lvl1') {
      return 'Sub region'
    } else if (field === 'financials') {
      return 'Financial Organization'
    }

    if (field && field.length) {
      return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')
    }
    return field
  }

  cpvLogo(cpvs, dataCpvs) {
    if (
      !dataCpvs ||
      !cpvs ||
      !cpvs.length
    ) {
      return 'https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png'
    }
    let cpv = null
    for (const cpvLabel of cpvs) {
      if (!cpv) {
        cpv = dataCpvs.find(a => a.label === cpvLabel)
      }
      if (
        !cpv ||
        !cpv.logo ||
        cpv.logo === '' ||
        cpv.logo.endsWith('/default.png')
      ) {
        cpv = null
      }
    }
    if (!cpv) {
      return 'https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png'
    }
    return cpv.logo
  }

  cpvPicture(cpvs, dataCpvs) {
    if (
      !dataCpvs ||
      !cpvs ||
      !cpvs.length
    ) {
      return 'https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/FondBleu.jpg'
    }
    let cpv = null
    for (const cpvLabel of cpvs) {
      if (!cpv) {
        cpv = dataCpvs.find(a => a.label === cpvLabel)
      }
      if (
        !cpv ||
        !cpv.picture ||
        cpv.picture === '' ||
        cpv.picture.endsWith('/FondBleu.jpg')
      ) {
        cpv = null
      }
    }
    if (!cpv) {
      return 'https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/FondBleu.jpg'
    }
    return cpv.picture
  }
}

const ret = function () {}

ret.install = function (Vue) {
  const global = new GlobalService()
  Vue.global = global
  Object.defineProperty(Vue.prototype, '$global', {
    get: function get () {
      return global
    }
  })
}

export default ret
