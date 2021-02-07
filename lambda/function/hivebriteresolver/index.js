const { log } = require('deepbloo');
const { get, TokenGet } = require('deepbloo').hivebrite

exports.handler = async function (event,) {
    try {

        let { pageStart, pageMax, perPage } = event.arguments;

        if (!perPage) {
            perPage = 10
        }
        if (!pageStart) {
            pageStart = 1
        }

        let page = pageStart
        let dataUsers = []
        let total = 1

        while (dataUsers.length < total && page < 5) {
            let response = await get(`api/admin/v1/users?page=${page}&per_page=${perPage}&order=updated_at&full_profile=true`)
            dataUsers = dataUsers.concat(response.data.users)
            total = response.headers["x-total"]
            page++
            if (pageMax && page > pageMax) {
                break
            }
        }
        return {
            success: true,
            data: { users: dataUsers, total }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            Error: error.message
        }
    }
}