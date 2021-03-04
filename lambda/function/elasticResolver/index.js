const { analyzeTender } = require('deepbloo').tenderformat
const { log, onError } = require('deepbloo');
const { indexToElasticsearch } = require('deepbloo').elastic
const { indexObjectToAppsearch } = require('deepbloo').appsearch
// const { log } = require('deepbloo');

exports.handler = async function (event,) {
    try {
        log("EVENT ---", event.field);
        let analyzedTender = await indexToElastic(event);
        switch (event.field) {
            case 'CreateTender': {
                return CreateTender(analyzedTender).then((data) => ({ success: true, data })).catch((err) => onError(err));
            }
            case 'UpdateTender': {
                return UpdateTender(analyzedTender).then((data) => ({ success: true, data })).catch((err) => onError(err));
            }
            default: {
                return `Unknown field, unable to resolve ${event.field}`;
            }
        }
    } catch (error) {
        return onError(error)
    }
}

let indexToElastic = async (event) => {
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
        await indexObjectToAppsearch([appsearchDoc], 'tenders-dev')

        return analyzedData
    } catch (error) {
        return onError(error)
    }
}

let CreateTender = async (analyzedData) => {
    let tenderAurora = { ...analyzedData }
    delete tenderAurora.tenderCriterionCpvs
    delete tenderAurora.tenderCriterions

    let aclAurora = {
        resourceId: analyzedData.tenderUuid,
        granteeId: analyzedData.owner_id,
        role: "OWNER",
        creationDate: analyzedData.creationDate,
        updateDate: analyzedData.updateDate
    }

    return {
        CreateTenderAuroraFunction: tenderAurora,
        CreateTenderCriterionCpvsAuroraFunction: updateObj(analyzedData.tenderCriterionCpvs, analyzedData.tenderUuid),
        CreateTenderCriterionsAuroraFunction: updateObj(analyzedData.tenderCriterions, analyzedData.tenderUuid),
        CreateAclAuroraFunction: aclAurora
    }
}

let UpdateTender = async (analyzedData) => {
    let tenderAurora = { ...analyzedData }
    delete tenderAurora.tenderCriterionCpvs
    delete tenderAurora.tenderCriterions

    return { UpdateTenderAuroraFunction: tenderAurora }
}

let updateObj = (list, tenderUuid) => {
    let cpList = [...list];
    return cpList.map((item) => {
        delete item.documentId
        item['tenderUuid'] = tenderUuid
        return item
    })
}
