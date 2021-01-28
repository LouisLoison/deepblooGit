const axios = require("axios");
const { getHivebriteSecret } = require('./config')
let hivebriteToken;

exports.TokenGet = async () => {
    const { admin_email, password, client_id, client_secret, redirect_uri, grant_type, scope, hivebriteEndpoint } = await getHivebriteSecret()

    return new Promise((resolve, reject) => {
        axios.post(`${hivebriteEndpoint}oauth/token`, {
            grant_type,
            scope,
            admin_email,
            password,
            client_id,
            client_secret,
            redirect_uri,
            refresh_token: null,
        }).then(response => {
            hivebriteToken = response.data.access_token
            resolve(response.data)
        }).catch(err => { reject(err) })
    })
}

exports.get = async (url, param) => {
    const { hivebriteEndpoint } = await getHivebriteSecret()

    return new Promise(async (resolve, reject) => {
        await this.TokenGet()
        const axios = require('axios');
        axios.defaults.baseURL = hivebriteEndpoint
        axios.defaults.headers.common = { 'Authorization': `bearer ${hivebriteToken}` }
        axios.get(url, param).then(response => {
            resolve(response)
        }).catch(err => { reject(err) })
    })
}
