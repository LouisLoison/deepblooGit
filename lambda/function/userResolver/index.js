const { log, onError } = require('deepbloo');
const { SharedSecretGet } = require('deepbloo').hivebrite
const jwt = require('jsonwebtoken')

exports.handler = async function (event,) {
  log("EVENT ---", event.method);
  switch (event.method) {
    case 'TokenAuthorizer': {
      return TokenAuthorizer(event).then((data) => ({ success: true, data })).catch((err) => onError(err));
    }
    default: {
      return `Unknown field, unable to resolve ${event.method}`;
    }
  }
}

let TokenAuthorizer = async (event) => {
  log(`EVENT TokenAuthorizer  --------`, event);
  return new Promise(async (resolve, reject) => {
    try {
      let { userToken } = event.arguments;
      let { hivebrite_shared_secret } = await SharedSecretGet();
      let { userId, hivebriteId } = jwt.verify(userToken, hivebrite_shared_secret, { algorithm: 'HS256' })

      /* let diff = (new Date(nbf * 1000).getTime() - new Date.getTime()) / 1000;
       diff /= 60;
 
       if (Math.abs(Math.round(diff)) > 120) {
         throw new Error("Token Expired.")
       }
       */

      resolve({ id: hivebriteId })
    } catch (err) { reject(err) }
  })
}