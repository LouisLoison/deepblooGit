const { log, onError } = require('deepbloo');
const { SharedSecretGet } = require('deepbloo').hivebrite
const jwt = require('jsonwebtoken')
const { BddTool } = require('deepbloo');
let client;

exports.handler = async function (event,) {
  // If 'client' variable doesn't exist
  if (typeof client === 'undefined') {
    // Connect to the database
    client = await BddTool.getClient()
  }
  log("EVENT ---", event.field);
  switch (event.field) {
    case 'TokenAuthorizer': {
      return TokenAuthorizer(event).then((data) => ({ success: true, data })).catch((err) => onError(err));
    }
    case 'User': {
      return User(event).then((data) => ({ success: true, data })).catch((err) => onError(err));
    }
    case 'List': {
      return List(event).then((data) => ({ success: true, data })).catch((err) => onError(err));
    }
    default: {
      return `Unknown field, unable to resolve ${event.field}`;
    }
  }
}

let TokenAuthorizer = async (event) => {
  log(`EVENT TokenAuthorizer  --------`, event);
  return new Promise(async (resolve, reject) => {
    try {
      let { userToken } = event.arguments;
      let { hivebrite_shared_secret } = await SharedSecretGet();
      let { id, name, primary_email, nbf } = jwt.verify(userToken, hivebrite_shared_secret, { algorithm: 'HS256' })

      /* let diff = (new Date(nbf * 1000).getTime() - new Date.getTime()) / 1000;
       diff /= 60;
 
       if (Math.abs(Math.round(diff)) > 120) {
         throw new Error("Token Expired.")
       }
       */

      resolve({ id, name, primary_email, nbf })
    } catch (err) { reject(err) }
  })
}

let User = async (event) => {
  log(`EVENT User  --------`, event);
  return new Promise(async (resolve, reject) => {
    try {
      let { id } = event.arguments;
      let user = null;
      if (id) {
        let filterExp = {
          arguments: {
            filter: {
              hivebriteId: id
            }
          }
        }
        let users = await List(filterExp);
        if (users && users.length > 0) {
          user = users[0];
        }
      }
      resolve(user);
    } catch (err) { reject(err) }
  })
}

let List = async (event) => {
  log(`EVENT List  --------`, event);
  return new Promise(async (resolve, reject) => {
    try {
      // Get user list
      let { filter } = event.arguments
      var users = []
      let query = `
        SELECT    userId AS "userId",
                  uuid AS "uuid", 
                  hivebriteId AS "hivebriteId", 
                  type AS "type", 
                  email AS "email", 
                  username AS "username", 
                  password AS "password", 
                  membershipFree AS "membershipFree", 
                  organizationId AS "organizationId", 
                  country AS "country", 
                  countryCode AS "countryCode", 
                  regions AS "regions", 
                  photo AS "photo", 
                  doNotContact AS "doNotContact",
                  notifSend AS "notifSend",
                  notifCpvs AS "notifCpvs",
                  notifRegions AS "notifRegions",
                  notifPostEmail AS "notifPostEmail",
                  notifTripEmail AS "notifTripEmail",
                  notifEventEmail AS "notifEventEmail",
                  notifDigestEmail AS "notifDigestEmail",
                  notifCommentEmail AS "notifCommentEmail",
                  notifVentureEmail AS "notifVentureEmail",
                  notifBusinessRequest AS "notifBusinessRequest",
                  notifCurrentLocationEmail AS "notifCurrentLocationEmail",
                  notifEmailingComEmail AS "notifEmailingComEmail",
                  notifForumPostEmail AS "notifForumPostEmail",
                  notifContactByPhone AS "notifContactByPhone",
                  notifContactBySms AS "notifContactBySms",
                  notifContactByPost AS "notifContactByPost",
                  dashboardUrl AS "dashboardUrl",
                  businessPipeline AS "businessPipeline",
                  connexionTender AS "connexionTender",
                  connexionBusiness AS "connexionBusiness",
                  status AS "status",
                  creationDate AS "creationDate",
                  updateDate AS "updateDate"
        FROM      "user" 
      `
      if (filter) {
        let where = ``
        if (filter.userId) {
          if (where !== '') { where += 'AND ' }
          where += `userId = ${BddTool.NumericFormater(filter.userId)} \n`
        }
        if (filter.email) {
          if (where !== '') { where += 'AND ' }
          where += `email = '${BddTool.ChaineFormater(filter.email)}' \n`
        }
        if (filter.hivebriteId) {
          if (where !== '') { where += 'AND ' }
          where += `hivebriteId = ${BddTool.NumericFormater(filter.hivebriteId)} \n`
        }
        if (filter.organizationId) {
          if (where !== '') { where += 'AND ' }
          where += `organizationId = ${BddTool.NumericFormater(filter.organizationId)} \n`
        }
        if (filter.type) {
          if (where !== '') { where += 'AND ' }
          where += `type = ${BddTool.NumericFormater(filter.type)} \n`
        }
        if (filter.types) {
          if (where !== '') { where += 'AND ' }
          where += `type IN (${BddTool.ArrayNumericFormater(filter.types)}) \n`
        }
        if (filter.doNotContact) {
          if (where !== '') { where += 'AND ' }
          where += `doNotContact = ${BddTool.NumericFormater(filter.doNotContact)} \n`
        }
        if (filter.hasConnexionTender) {
          if (where !== '') { where += 'AND ' }
          where += `connexionTender IS NOT NULL \n`
        }
        if (filter.hasConnexionBusiness) {
          if (where !== '') { where += 'AND ' }
          where += `connexionBusiness IS NOT NULL \n`
        }
        if (filter.notifSend) {
          if (where !== '') { where += 'AND ' }
          where += `notifSend = ${BddTool.NumericFormater(filter.notifSend)} \n`
        }
        if (filter.status) {
          if (where !== '') { where += 'AND ' }
          where += `status = ${BddTool.NumericFormater(filter.status)} \n`
        }
        if (where !== '') { query += 'WHERE ' + where }
      }
      let recordset = await BddTool.QueryExecBdd2(query)
      for (var record of recordset) {
        users.push({
          userId: record.userId,
          hivebriteId: record.hivebriteId,
          type: record.type,
          email: record.email,
          username: record.username,
          password: record.password,
          membershipFree: record.membershipFree,
          organizationId: record.organizationId,
          country: record.country,
          countryCode: record.countryCode,
          regions: record.regions,
          photo: record.photo,
          doNotContact: record.doNotContact,
          notifSend: record.notifSend,
          notifCpvs: record.notifCpvs,
          notifRegions: record.notifRegions,
          notifPostEmail: record.notifPostEmail,
          notifTripEmail: record.notifTripEmail,
          notifEventEmail: record.notifEventEmail,
          notifDigestEmail: record.notifDigestEmail,
          notifCommentEmail: record.notifCommentEmail,
          notifVentureEmail: record.notifVentureEmail,
          notifBusinessRequest: record.notifBusinessRequest,
          notifCurrentLocationEmail: record.notifCurrentLocationEmail,
          notifEmailingComEmail: record.notifEmailingComEmail,
          notifForumPostEmail: record.notifForumPostEmail,
          notifContactByPhone: record.notifContactByPhone,
          notifContactBySms: record.notifContactBySms,
          notifContactByPost: record.notifContactByPost,
          dashboardUrl: record.dashboardUrl,
          businessPipeline: record.businessPipeline,
          connexionTender: record.connexionTender,
          connexionBusiness: record.connexionBusiness,
          status: record.status,
          creationDate: record.creationDate,
          updateDate: record.updateDate,
          uuid: record.uuid
        })
      }
      resolve(users);
    } catch (err) { reject(err) }
  })
}