const { log } = require('deepbloo');
const { SharedSecretGet } = require('deepbloo').hivebrite
const jwt = require('jsonwebtoken')

exports.handler = async function (event,) {
    try {
        let { token } = event.arguments;
        let { hivebrite_shared_secret } = await SharedSecretGet();
        let tokenDecoded = jwt.verify(token, hivebrite_shared_secret, { algorithm: 'HS256' })
        log(`Token Decoded -- `, tokenDecoded);

        return {
            success: true,
            data: { }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            Error: error.message
        }
    }
}