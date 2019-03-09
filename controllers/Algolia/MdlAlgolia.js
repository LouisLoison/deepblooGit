exports.TendersAdd = () => {
    return new Promise((resolve, reject) => {
        const algoliasearch = require('algoliasearch')
        let applicationId = '583JWW9ARP'
        let apiKey = '5cc468809130d45b76cf76598a09ff21'
        let client = algoliasearch(applicationId, apiKey, {
            timeout: 4000,
        })

        let index = client.initIndex('dev_tenders')
        let tenders = [
            {
                "firstname": "Essie",
                "lastname": "Vaill",
                "company": "Litronic Industries",
                "address": "14225 Hancock Dr",
                "city": "Anchorage",
                "county": "Anchorage",
                "state": "AK",
                "zip": "99515",
                "phone": "907-345-0962",
                "fax": "907-345-1215",
                "email": "essie@vaill.com",
                "web": "http://www.essievaill.com",
                "followers": 3574
            },
            {
                "firstname": "Cruz",
                "lastname": "Roudabush",
                "company": "Meridian Products",
                "address": "2202 S Central Ave",
                "city": "Phoenix",
                "county": "Maricopa",
                "state": "AZ",
                "zip": "85004",
                "phone": "602-252-4827",
                "fax": "602-252-4009",
                "email": "cruz@roudabush.com",
                "web": "http://www.cruzroudabush.com",
                "followers": 6548
            },
        ]
        index.addObjects(tenders, (err, content) => {
            if (err) {
                console.error(err)
                reject(err)
                return
            }
            console.error(content)
            for (let i = 0; i < tenders.length; i++) {
                tenders[i].objectID = content[i]
            }
            resolve()
        })
    })
}

exports.Test = () => {
    return new Promise((resolve, reject) => {
        const algoliasearch = require('algoliasearch')
        let applicationId = '583JWW9ARP'
        let apiKey = '5cc468809130d45b76cf76598a09ff21'
        let client = algoliasearch(applicationId, apiKey, {
            timeout: 4000,
        })

        let index = client.initIndex('contacts')
        index.search({
            query: ''
        }, function searchDone(err, content) {
                if (err) throw err;
                console.log(content.hits);
            }
        );
        resolve()
    })
}

exports.Test2 = () => {
    return new Promise((resolve, reject) => {
        const algoliasearch = require('algoliasearch')
        let applicationId = '583JWW9ARP'
        let apiKey = '5cc468809130d45b76cf76598a09ff21'
        let client = algoliasearch(applicationId, apiKey, {
            timeout: 4000,
        })

        let index = client.initIndex('contacts')
        let contactsJSON = [
            {
                "firstname": "Essie",
                "lastname": "Vaill",
                "company": "Litronic Industries",
                "address": "14225 Hancock Dr",
                "city": "Anchorage",
                "county": "Anchorage",
                "state": "AK",
                "zip": "99515",
                "phone": "907-345-0962",
                "fax": "907-345-1215",
                "email": "essie@vaill.com",
                "web": "http://www.essievaill.com",
                "followers": 3574
            },
            {
                "firstname": "Cruz",
                "lastname": "Roudabush",
                "company": "Meridian Products",
                "address": "2202 S Central Ave",
                "city": "Phoenix",
                "county": "Maricopa",
                "state": "AZ",
                "zip": "85004",
                "phone": "602-252-4827",
                "fax": "602-252-4009",
                "email": "cruz@roudabush.com",
                "web": "http://www.cruzroudabush.com",
                "followers": 6548
            },
        ]

        index.addObjects(contactsJSON, function(err, content) {
            if (err) {
                console.error(err)
                reject(err)
                return
            }
            console.error(content)
            resolve()
        })
    })
}
