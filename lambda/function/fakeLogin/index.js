const { log, onError } = require('deepbloo');
const { SharedSecretGet } = require('deepbloo').hivebrite
const jwt = require('jsonwebtoken')

exports.handler = async function (event,) {
    try {
        return await FakeLogin(event);

    } catch (error) {
        return onError(error)
    }

}


let FakeLogin = async (event) => {
    log(`EVENT FakeLogin  --------`, event);
    return new Promise(async (resolve, reject) => {
        try {
            let { id, name, primary_email } = event.arguments;
            let { hivebrite_shared_secret } = await SharedSecretGet();
            let nbf = Math.round(new Date().getTime() / 1000);
            let token = jwt.sign({ id, name, primary_email, nbf }, hivebrite_shared_secret, { algorithm: 'HS256' })

            resolve({
                token
            })
        } catch (err) { reject(err) }
    })
}
