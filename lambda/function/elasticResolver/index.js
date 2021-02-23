const { analyzeTender } = require('deepbloo').tenderformat
const { log, onError } = require('deepbloo');
const { indexToElasticsearch } = require('deepbloo').elastic
const { indexObjectToAppsearch } = require('deepbloo').appsearch
// const { log } = require('deepbloo');

exports.handler = async function (event,) {
    try {
        let tender = event.arguments.input;
        log(`Tender --`, tender)
        const { analyzedData, formatedData } = await analyzeTender(tender)
        log(`Analyzed Data`, analyzedData)
        log(`formatedData Data`, formatedData)

        const elasticDoc = {
            ...analyzedData,
            ...formatedData,
            id: tender.tenderUuid,
        }
        delete elasticDoc.tenderUuid
        const appsearchDoc = {
            ...formatedData,
            id: tender.tenderUuid,
            account_id: tender.owner_id || 'none',
        }
        delete appsearchDoc.tenderUuid

        await indexToElasticsearch([elasticDoc], 'tenders')
        await indexObjectToAppsearch([appsearchDoc], 'deepbloo-dev')

        return {
            success: true, data: {
                CreateTenderAuroraFunction: analyzedData,
                CreateTenderCriterionCpvsAuroraFunction: analyzedData,
                CreateTenderCriterionsAuroraFunction: analyzedData
            }
        }
    } catch (error) {
        return onError(error)
    }
}
