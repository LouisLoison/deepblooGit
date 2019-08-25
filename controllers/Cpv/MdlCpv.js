exports.CpvList = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const cpvs = require(process.cwd() + '/public/constants/cpvs.json');
      let cpvId = -1;
      for (const cpv of cpvs) {
        cpv.cpvId = cpvId;
        cpvId++;
      }
      resolve(cpvs);
    } catch (err) {
      reject(err);
    }
  })
}
