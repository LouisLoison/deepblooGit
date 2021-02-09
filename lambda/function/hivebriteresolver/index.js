const { log, onError } = require('deepbloo');
const { get } = require('deepbloo').hivebrite


exports.handler = async function (event,) {
    log("EVENT ---", event.field);
    switch (event.field) {
        case 'User': {
            return User(event).then((data) => ({ success: true, data })).catch((err) => onError(err));
        }
        default: {
            return `Unknown field, unable to resolve ${event.field}`;
        }
    }
}

let User = async (event) => {
    log(`EVENT User  --------`, event);
    return new Promise(async (resolve, reject) => {
        try {
            let user = null
            let { hivebriteId } = event.arguments;
            let userResponse = await get(`/api/admin/v1/users/${hivebriteId}`)
            if (userResponse && userResponse.data && userResponse.data.user) {
                user = userResponse.data.user
            }
            resolve(user);
        } catch (err) { reject(err) }
    })
}