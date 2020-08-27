exports.ArchiveTest = () => {
    return new Promise((resolve, reject) => {
        const fs = require('fs')
        const path = require('path')
        const moment = require('moment')

        // Liste des fichiers du rep
        let dir = 'C:/Temp/Partage/Archive/'
        fs.readdirSync(dir).forEach(file => {
            let fileLocation = path.join(dir, file)
            let fileStat = fs.statSync(fileLocation)
            if (fileStat.isDirectory()) { return }
            let fileDays = moment().diff(moment(fileStat.mtime), 'days')
            if (fileDays > 60) {
                let archivePath = path.join(dir, 'Archive')
                if (!fs.existsSync(archivePath)) { fs.mkdirSync(archivePath) }
                let year = fileStat.mtime.getUTCFullYear()
                let yearPath = path.join(archivePath, `${year}`)
                if (!fs.existsSync(yearPath)) { fs.mkdirSync(yearPath) }
                let month = fileStat.mtime.getUTCMonth() + 1
                let monthPath = path.join(yearPath, `${month}`)
                if (!fs.existsSync(monthPath)) { fs.mkdirSync(monthPath) }
                let day = fileStat.mtime.getUTCDate()
                let dayPath = path.join(monthPath, `${day}`)
                if (!fs.existsSync(dayPath)) { fs.mkdirSync(dayPath) }
                dayPath = dayPath
                let fileLocationNew = path.join(dayPath, file)
                require(process.cwd() + '/controllers/CtrlTool').renameSync(fileLocation, fileLocationNew)
            }
        })
        resolve(true)
    })
}

exports.OracleTest = () => {
    return new Promise((resolve, reject) => {
        var oracledb = require('oracledb')
        oracledb.getConnection(
        {
            user          : "Ethelp",
            password      : "Ethelp",
            connectString : "(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521)))(CONNECT_DATA=(SID=xe)))"
        },
        function(err, connection)
        {
            if (err) { reject(err); return; }
            connection.execute("SELECT * FROM Job ", (err, result) => {
                if (err) { reject(err); return; }
                console.log(result.rows)
                resolve()
            })
        })
    })
}

exports.PromiseTest = (JobInterfaceID) => {
    return new Promise((resolve, reject) => {
        var Config = require(process.cwd() + '/config')
        var sql = require('mssql');
        sql.connect(Config.AppBdd.config).then(() => { return sql.query`
            SELECT TOP 1 * 
            FROM dsi_hlp_JobInterface WITH(NOLOCK) 
            WHERE JobInterfaceID = ${JobInterfaceID} 
        `}).then(result => {
            sql.close();
            resolve(result.recordset)
        }).catch(err => { sql.close(); reject(err); })
        sql.on('error', err => { sql.close(); reject(err); })
    })
}

exports.CpvCreateJson = () => {
  return new Promise(async (resolve, reject) => {
    fs = require('fs')

    let cpvs = []
    fs.readFileSync('c:/Temp/Onglet1.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      let labels = lineArray[1].split('-').join(' ').trim().split(',')
      for (let label of labels) {
        let labelFormat = label.trim()
        if (labelFormat === '') {
          continue
        }
        cpvs.push({
          code: parseInt(lineArray[0], 10),
          label: labelFormat,
          active: lineArray[5] === 'Y',
          logo: lineArray[7].trim(),
          picture: lineArray[6].trim(),
          category: lineArray[3].trim(),
        })
      }
    })

    let familys = []
    fs.readFileSync('c:/Temp/Onglet4.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      familys.push({
        category: lineArray[0].trim(),
        family: lineArray[1].trim()
      })
    })

    let categories = []
    fs.readFileSync('c:/Temp/Onglet3.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      let category = {
        category: lineArray[0].trim(),
        cpv: parseInt(lineArray[1].trim(), 10),
        cpvText: lineArray[2].trim(),
        words: [],
      }
      for (let i = 5; i < lineArray.length; i++) {
        if (!lineArray[i] || lineArray[i].trim() === '') {
          continue
        }
        if (lineArray[i].trim() !== '') {
          category.words.push(lineArray[i].trim().toLowerCase())
        }
      }
      let family = familys.find(a => a.category === category.category)
      if (family) {
        category.family = family.family
      }
      categories.push(category)
    })

    fs.readFileSync('c:/Temp/Onglet5.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
      let lineArray = line.split('|')
      let cpvLabels = lineArray[0].trim()
      let cpvLabelDeepbloos = lineArray[2].trim()
      if (cpvLabelDeepbloos !== '') {
        cpvLabels += ',' + cpvLabelDeepbloos
      }
      let words = []
      for (let i = 3; i < lineArray.length; i++) {
        if (!lineArray[i] || lineArray[i].trim() === '') {
          continue
        }
        let wordTextes = lineArray[i].trim().toLowerCase()
        for (let word of wordTextes.split(',')) {
          if (word.trim() !== '') {
            words.push(word.trim().toLowerCase())
          }
        }
      }
      for (let cpvLabel of cpvLabels.split(',')) {
        let cpvLabelFormat = cpvLabel.split('-').join(' ').trim()
        if (cpvLabelFormat === '') {
          continue
        }
        let categorie = categories.find(a => a.cpvText.toLowerCase() === cpvLabel.toLowerCase())
        if (categorie) {
          if (!categorie.words) {
            categorie.words = []
          }
          categorie.words = categorie.words.concat(words)
        }
        let cpv = cpvs.find(a => a.label.toLowerCase() === cpvLabelFormat.toLowerCase())
        if (cpv) {
          if (!cpv.words) {
            cpv.words = []
          }
          cpv.words = cpv.words.concat(words)
        } else {
          console.log(`Unknow CPV : ${cpvLabelFormat}`)
        }
      }
    })

    let categoriesText = JSON.stringify(categories, null, 3)
    fs.writeFile('c:/Temp/OngletJson2.txt', categoriesText, function (err) {
      if (err) {
        return console.log(err);
      }
    })
  
    // let industries = []
    // fs.readFileSync('c:/Temp/Onglet2.txt', 'utf-8').split(/\r?\n/).forEach((line) => {
    //   let lineArray = line.split('|')
    //   industries.push(lineArray)
    // })

    let cpvsText = JSON.stringify(cpvs, null, 3)
    fs.writeFile('c:/Temp/OngletJson.txt', cpvsText, function (err) {
      if (err) {
        return console.log(err);
      }
    })
    resolve()
  })
}

exports.CountryCreateCsv = () => {
  return new Promise(async (resolve, reject) => {
    fs = require('fs')
    const regionList = require(process.cwd() + '/public/constants/regions.json')

    let countrys = []
    for(const region of regionList) {
      if (region.countrys && region.countrys.length) {
        for(const country of region.countrys) {
          countrys.push({
            country,
            region: region.label,
            subRegion: '',
          })
        }        
      }
      if (region.regions && region.regions.length) {
        for(const subRegion of region.regions) {
          if (subRegion.countrys && subRegion.countrys.length) {
            for(const country of subRegion.countrys) {
              countrys.push({
                country,
                region: region.label,
                subRegion: subRegion.label,
              })
            }        
          }        
        }        
      }
    }

    countryText = 'country;region;subRegion\n'
    for(const country of countrys) {
      countryText += `${country.country};${country.region};${country.subRegion}\n`
    }
    fs.writeFileSync('c:/Temp/Country.csv', countryText)

    resolve()
  })
}

exports.Test = (data1, data2) => {
  return new Promise(async (resolve, reject) => {
    try {
      /*
      const userPwds = `
      stanislas@deepbloo.com,Deep1806
      alexandre@deepbloo.com,Deep1806
      jeancazaux@hotmail.com,Deep1806
      olivier.clems@gmail.com,0cor06yk3k
      michel.duquette@fynlam.com,psbcy9e93o
      enrique.alvarezuria@gmail.com,clve33f3i6
      diane.lozano.pro@gmail.com,s9nus4f884
      donald@ist.co.za,2ptzdyq7z8
      mka@arteche.es,eowju7aowq
      rahulsikka@lntecc.com,hov159b7cp
      upinder@gulf.lntecc.com,u18r5yd4pe
      mohammed.hafeez@gmail.com,v0dlcaghus
      d.saada@ucep-td.com,y3hd6c39vs
      soheb@consultant.com,lsodeix4n9
      dinesh.britto@sspower.com,enb86ojuic
      tech.secy@ucep-td.com,rksswnci0j
      l.ng@ruralelec.org,g21ixqvp4b
      jose.moutas.alas@gmail.com,3k84vyh9do
      alvarolpf@gmail.com,y2t0rruzbi
      nelly.depret@ge.com,4y6585h8ea
      araceli.giner@ata.email,05m5ab7ax4
      rob@rvesol.com,ygayijqwhg
      arnaud@gommyr.com,vnlc3fw2en
      steve@sustainablepowersystems.com,fyq56rca65
      emilie@deepbloo.com,p1ck4p8nuf
      stephen_gous@jabil.com,nqsz8e16gd
      claudio@wind-kinetic.com,t77t22kaqr
      abigailjibril@gmail.com,77tswej9es
      hary_andriantavy@club-er.org,cuvi8que67
      leo.tian@sacolar.com,7j9bnacvsv
      amr_abdalla@live.com,5a1v9xo0uj
      audoin.energy@gmail.com,e344xmg32q
      abdirahman@ieee.org,n76xyr094b
      shelmith@sunfunder.com,f5vvln8zwj
      maurice_wamalwa@yahoo.com,gchm6mt67s
      selamawit.beneberu@giz.de,j4f0zrkf0g
      roger.chua@webphilippines.com,5wv8wvlt33
      sophie.donabedian@seves.com,tey3i0r5bl
      sean@buildsolar.com.au,a9z1ua84jd
      tinyan.ogiehor@gmail.com,4lyk7xalnj
      yann.chauvelin@sagemcom.com,qyucr7tc1n
      robertz@posteo.org,ljw8f0p9rx
      quentin.crambes@gmail.com,v329obqhrn
      konate.samuel@yahoo.fr,jtgceaacoi
      entreprise_dassise@yahoo.fr,l0japqwauv
      laura.monteagudo@tta.com.es,qboydfcmwk
      ahmed.moutaouakil96@gmail.com,foowttzx4r
      pascal.auga@gmail.com,l43f6guyxg
      r.marchandise@abccontracting.be,m6t4nb301q
      judith.jaeger@solar23.com,ik86bkahaw
      melusi@zizaenergy.com,kbox6b8cd9
      daniel@meridianenergy.co.za,aamlughgim
      wvn@viridisipsum.co.za,lfdjg57xxg
      honoreks@gmail.com,ih4bjmumqc
      asrom992@gmail.com,zwtjcqjzfa
      kabore.manegre@gmail.com,txfyo4ux9f
      info@dynamicafrika.com,1i4enaov7s
      nd.maduekwe@gmail.com,2pvd4tjqj2
      lokendrasharmaa6@gmail.com,maaa5aeqdn
      zc.solarenergy@fasonet.bf,pjqvln196f
      medupin.christian@gmail.com,kw2wlq09w7
      samora2009@yahoo.com,r7e6tfqn5i
      ian@solarium-phils.com,wyuobujx74
      hocine.zenine@gmail.com,ye5hire0eo
      jeet.banerjee@solarasia.com,mddhut2p9r
      gregvandeputte@hotmail.fr,xvk4mzd0ye
      edwin.ehiorobo@gmail.com,oq9onah8dm
      edrouxentr@gmail.com,oi3x8on7ye
      vmengual@solarnub.com,1c0cgmu0l6
      jeffrey.secrest@innovativesolarsystemsllc.com,n2w05gujqh
      jeffrey.robile@sunelex.com,3co9rrum0d
      george@sunsweetsolarltd.com,m2x1co4o2h
      cmchiumya@gmail.com,o4m6bw9qia
      nethan.sithole@gmail.com,6p18iop8xf
      heinv16@gmail.com,tc3reri4io
      kmamadou@ept.sn,j1oovcpogu
      marie-laure.minier@maghrebventurepartners.com,xqrd6mck2g
      ddpalexandre@teclinkmoz.net,qa8k52vcrv
      samuel.dotou@gmail.com,93pn2ksnum
      zillighans@aim.com,0qjcsxrjdh
      antonin.gabet@laposte.net,wthjg1up3y
      jessica.arisoa@gmail.com,r61ivln868
      i.kukov@solarway.bg,ynwm1bkn5w
      tboksenbaum@syrius-solar.fr,3qjrmu1hsh
      rik.wuts@gmail.com,7caehssaeo
      bismarck@qinous.com,xn6h8q4rt7
      tony@renewablesinafrica.com,z0wfayj7ul
      viktor.sinenko@rtsoft.de,b9h4fu34pi
      giridaran.srinivasan@yorkrenewables.com,7hkl3daqx9
      tmichaeliwu@gmail.com,joafb3hkml
      ben@rubixsolar.com.au,ou04o99132
      sctcindore@gmail.com,94wot7kcff
      bhairab57@gmail.com,vds3495o8b
      l.kockmann@voltalia.com,05ezevijg6
      pksharma@paetd.com,q10x67699l
      ayubgathu@gmail.com,k4176er6r3
      mike@gpsolar.co.za,ouvancd1a8
      eunamia@adeptadvisory.co.za,lihnjc5lvn
      george.edwards@wireless-energy.biz,scrnhnbxqe
      john.gleeson@8starenergy.com,5kkzgs0z8j
      jason@ootbinnovations.com,5y2hyfyi0b
      famuleomodebola@gmail.com,hidfzoukiq
      alkm@pureenergyuk.com,jrb376091q
      mohammed.akharfi@ge.com,hepp78o6zg
      konschels@gmail.com,24mfd4s1sp
      jeanbordeaux30@gmail.com,glul3is6vh
      mayur.rgs@gmail.com,o1bkv13ar8
      mwitialexx@gmail.com,y1o6mm3d8h
      kwigize@gmail.com,yx85x4za05
      andrewboitshwarelo@gmail.com,mpqa8hj5ze
      info@mia-alpha.com,l01neif5eb
      daniel@solafuture.co.za,717fkrckq6
      mangano@pandorateam.org,9har1hhqng
      harry.dekens@gmail.com,h05rovt58n
      carlo.tacconelli@engreensolutions.com,fcze3a2zcp
      mohamed.suleman@camerongroupinternational.co.uk,mzzatf8vlq
      simon@multisourcepower.com,d5mf7t78tm
      maxwell@enaleni.co.za,jkvu8q62ek
      t.amiesimaka@gmail.com,u7dcpb5dre
      alexander.hoffmann@solarworx.io,mkmncf4zup
      merihsakarya@gmail.com,punkhbdra7
      ohrablo@appliedp.com,cmiy8yb84f
      richard@eneosolutions.com,peac2nsk0a
      kkchitaliya@gmail.com,tf7m0wvirj
      intmktengg@gmail.com,6sz795kuiu
      eemhguzel@outlook.com,diah59jxcl
      magdalena.kopaczyk@solarnetworks.pl,c8men5s14e
      nimish@axis-india.com,bynllglykm
      j.cazaux@arread.fr,u8et95c9wb
      onur.gunay@petekenerji.com.tr,ygikldmuc9
      jaredoluoch014@gmail.com,p3pob5dql8
      miranda@smartenergysa.co.za,4yuoda2142
      user5@deepbloo.com,g81hxizpan
      davidisoe@gmail.com,v54lyze96m
      neilhogg@sky.com,x95xzuh5i9
      jerry.su@ge.com,ilj0ujd5er
      o.gul@4aelektrik.com.tr,ockuufrhh7
      sankalp.sharma22@hotmail.com,p5oazfak2l
      tfarooqi@alterconsul.com,qujmtfzurf
      goutham.d@focusrtech.com,er4rf7s9ts
      ismail.umar@centrino.co,diszz5vvaq
      garrysixty6@gmail.com,p4mqtvru9l
      marghoussaini@yahoo.com,r2od7ma2ph
      ghassan_barghout@yahoo.com,pope5gu2bz
      olivierkhoury@gmail.com,bku03emi4h
      david@sg2b.com,jwho2ajy2q
      max.gutierrez@nordenenergy.com,mxqqj5ti7j
      victor.budda@bilfinger.com,yw8w1jqtl2
      georges.seil@gmail.com,31sx1sbg4w
      antonio.povoa@gmail.com,a4iy1xnv8i
      ka_rim_trd@yahoo.fr,1q0es54v0q
      nileshbaguandas@me.com,w76raeu2j8
      philippe.dessy@ge.com,9nh0brw72g
      sidney.goncalves@ge.com,kr5tep4txu
      uk_bert@yahoo.co.uk,1kmkun2l4q
      michelle@greenlightplanet.com,sr1ayq4zsk
      kvapowersolutions@gmail.com,12hh3uhxpi
      fiona.olali@greenlightplanet.com,fe5l891s0g
      rawad.youssef@elum-energy.com,zcn7s6v8n8
      akachi@powerpro.ng,xlw5fkp2yj
      sekpot2000@gmail.com,r7uta1jlc9
      vikas.varshney@sterlite.com,wr4kvfetlf
      a.soler@ruralelec.org,8ngpn0fyyd
      vnsankar@lntecc.com,bqacwt2dtv
      karthik.g@volgasolar.co.in,an043dw32t
      sales@navsar.in,kd77ad2ahh
      mvchikkoppa@gmail.com,nlfjheqf3h
      alpham@ataliacd.com,ofiljvld86
      lemos.lemhs@gmail.com,0uytdz12r8
      joaquin.martin@es.abb.com,mbg2wdsibd
      a.babaaissa@rnepartner.com,0auebiauh5
      obiajulu@deltasahara.com,dr6tzl842c
      alessandro.capo.ac@gmail.com,jt49q3bw36
      tmasina@mweb.co.za,xdr69a5ewk
      mugenielvis@gmail.com,pe23goxhoa
      katlego@pronoiaent.co.za,1jfq4rxvjz
      kingzee2144@gmail.com,39xf7rnmle
      hreshi@gmail.com,gbkntfswrj
      rcantrell@sunbeltusa.com,xrdbg910bm
      amandamix0@hotmail.com,g0rvxft80g
      offgridconf@gmail.com,97cbfrznwq
      cesouza@g4energia.com,iqvnodckke
      benmahfoudh@gmail.com,v5vspe0jda
      gideon@lapomikenergy.com,44l722k45p
      joe.segal@gmail.com,68homgm017
      wolfi896@interia.pl,lkoa4zk4ke
      guyodemtare@yahoo.fr,8zbh8y75bu
      y.alzein@ucep-td.com,ei7rrpnkde
      chelangat_ke@ieee.org,fmz1mo5pcr
      dane.j@genpac.com.au,zd0tiz99eb
      jonny.esteban.villa@gmail.com,79mrg3fztj
      marina.pascualfl@hotmail.com,7azzpwduns
      kukulo.stas@gmail.com,ck3ctciu9g
      ksv@enfall.com,h2f24yzh4g
      lulzim.syla@elen-ks.com,ylqfocl24q
      paul@abmglobalenergy.co.uk,3iwipmgseo
      federico.gutierrez@arteche.com,49x7oz9q0a
      lander.zugazaga@arteche.com,6k45m9kuno
      willemot@oxtoenergy.com,xxv2do9u9b
      jigar1985@gmail.com,kyioyzkkkd
      brigil@entelity.com,mmutf7vv0m
      pravin_tripathi@yahoo.com,xhcvxia5gy
      soururjasolution@gmail.com,5jx6rx8sdu
      nelson.pedrosa@pedrosairmaos.com,rcaane4sgm
      nicklusson@gmail.com,5ppg1gf4i3
      xavier@xdconsulting.eu,anrik9uewl
      ks@electrovast.com,06hu4v181i
      kazu.kaneto@gmail.com,n9j0330037
      robertv@teci.co.za,a47q75ld2h
      jessica.leigh@ricardo.com,tn7irvd52o
      olivier.paternostre@ge.com,ehxhyfhotn
      sales@africansmartcities.info,jpunji5oaj
      kiesse.sita@elum-energy.com,ktiq24laqp
      veeresh.anehosur@bos-ag.com,4mszid5d5u
      kimutai@gmail.com,wtmlu5k7or
      srijai.vr@gmail.com,t36i1qh74q
      nicole@solafuture.co.za,pou1nlyth9
      pieter@ist.co.za,6meu4q6xsu
      anproperty@mail.bg,iqgza3hlod
      idris.tayebi@nexus-energy.it,zhtghyl3fs
      v.guillot@voltalia.com,xahsa7pz3h
      e.romieu@aeconseil.fr,cap1avmzyf
      matteo.tironi@tironi.com,bryo897795
      vmath@inaccess.com,j6xcxs5f1n
      hperez@equitel.com.co,6lciy8emrg
      john.vanzuylen@afsiasolar.com,r880ykb50t
      peter@ist.co.za,iwtstjinlp
      manish.khamesra@sterlite.com,k9l236e8wh
      g.decarnelle@aeconseil.fr,b6ojsktnmn
      d.homer@fraym.io,t40lrxqggf
      simondet@hotmail.com,jci7151piq
      rlajoie@sipromad.com,494921t5ge
      bryce.foss@sustainpower.co.za,ltbsamib9z
      christophe.durieux@ge.com,alzkiuo5fb
      kwagyeneiks@gmail.com,brcrd6a0vo
      sebastien.ozenda@cmr-group.com,67sdg38qa3
      maureen.rivere@gmail.com,tt1f7g7k23
      davy.theophile@cmr-group.com,px4mtfhy1s
      zacharia.choual@cmr-group.com,8cgn8i5n7q
      ayoademilua@gmail.com,vki6320cr6
      lina.zhao@sediver.com,24m0et8e5e
      barbara.bocchi@tironi.com,83ejf5oli9
      jacques.van-ammers@ge.com,8lc61okujc
      clement.gardien@entech-se.com,m9okjh842c
      maxime.delafoy@sustainsolar.co.za,ilmu029qnb
      marco.carlucci@engreensolutions.com,myevrrlbbr
      shonco.power@gmail.com,ihwgtld04g
      stephane.dufrenne@gmail.com,t8s45yktbk
      serge.remy@studer-innotec.com,nt7vf40qjd
      mathieu.bertrane@edf.fr,cdbufu9xnz
      `
      for (const userPwd of userPwds.split('\n')) {
        const email = userPwd.split(',')[0].trim()
        if (email.trim() === '') {
          continue
        }
        const password = userPwd.split(',')[1].trim()
        const users = await require(process.cwd() + '/controllers/User/MdlUser').List({
          email
        })
        if (users && users.length) {
          const user = users[0]
          if (user && (!user.password || user.password.trim() === '')) {
            await require(process.cwd() + '/controllers/User/MdlUser').AddUpdate({
              userId: user.userId,
              password,
            })
          }
        }
      }
      */

      resolve({
        item1: data1,
        item2: data2
      })
    } catch (err) { reject(err) }
  })
}

exports.Test2 = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const sleep = require('util').promisify(setTimeout)

      let horodatage1 = new Date().toISOString().split(':').join('').split('-').join('').substring(0, 15)
      let fileLocation = path.join(config.WorkSpaceFolder, `ApiTest2${horodatage1}Start.txt`)
      fs.writeFile(fileLocation, `Date : ${new Date().toISOString()}`, function (err) {
        if (err) {
          console.log(err)
        }
      })

      await sleep(900000)

      let horodatage2 = new Date().toISOString().split(':').join('').split('-').join('').substring(0, 15)
      fileLocation = path.join(config.WorkSpaceFolder, `ApiTest2${horodatage1}Start_${horodatage2}End.txt`)
      fs.writeFile(fileLocation, `Date : ${new Date().toISOString()}`, function (err) {
        if (err) {
          console.log(err)
        }
      })

      resolve({
        horodatage1,
        horodatage2,
        fileLocation
      })
    } catch (err) { reject(err) }
  })
}

exports.Test3 = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const sleep = require('util').promisify(setTimeout)

      let horodatage1 = new Date().toISOString().split(':').join('').split('-').join('').substring(0, 15)
      let fileLocation = path.join(config.WorkSpaceFolder, `ApiTest2${horodatage1}Start.txt`)
      fs.writeFile(fileLocation, `Date : ${new Date().toISOString()}`, function (err) {
        if (err) {
          console.log(err)
        }
      })

      await sleep(30000)

      let horodatage2 = new Date().toISOString().split(':').join('').split('-').join('').substring(0, 15)
      fileLocation = path.join(config.WorkSpaceFolder, `ApiTest2${horodatage1}Start_${horodatage2}End.txt`)
      fs.writeFile(fileLocation, `Date : ${new Date().toISOString()}`, function (err) {
        if (err) {
          console.log(err)
        }
      })

      resolve({
        horodatage1,
        horodatage2,
        fileLocation
      })
    } catch (err) { reject(err) }
  })
}

exports.Test4 = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')
      const horodatage = new Date().toISOString().split(':').join('').split('-').join('').substring(0, 15)
      const fileLocation = path.join(config.WorkSpaceFolder, `ApiTest${horodatage}.txt`)


      const testSector = `
      `
      const sectors = testSector.split('\n')
      const SECTORS_LIST = []
      for (const sector of sectors) {
        if (sector.trim() === '') {
          continue
        }
        NACECode = parseInt(sector.split(';')[2], 10)
        TradeSector = sector.split(';')[3]
        Description = sector.split(';')[4]
        Industry = ''
        if (NACECode >= 110 && NACECode <= 1450) {
          Industry = 'Agriculture & mining'
        } else if ((NACECode >= 1500 && NACECode <= 2330) || (NACECode >= 2600 && NACECode <= 2875)) {
          Industry = 'Manufacturing of raw material (excl. mining)'
        } else if ((NACECode >= 2900 && NACECode <= 3350) || (NACECode >= 3600 && NACECode <= 3720)) {
          Industry = 'Other manufacturing of machinery & equipment'
        } else if (NACECode >= 3400 && NACECode <= 3550) {
          Industry = 'Automotive & aeronautics (incl. suppliers) manufacturing'
        } else if (NACECode >= 4000 && NACECode <= 4100) {
          Industry = 'Regulated energy/utilities'
        } else if (NACECode >= 4500 && NACECode <= 4550) {
          Industry = 'Construction'
        } else if (NACECode >= 5010 && NACECode <= 5274) {
          Industry = 'Wholesale & retail trade'
        } else if ((NACECode >= 5510 && NACECode <= 5552) || (NACECode === 6420) || (NACECode >= 7200 && NACECode <= 7487)) {
          Industry = 'Business & consumer services'
        } else if (NACECode >= 6000 && NACECode <= 6412) {
          Industry = 'Transportation'
        } else if (NACECode >= 7000 && NACECode <= 7140) {
          Industry = 'Real estate & rental'
        } else if (NACECode >= 7511 && NACECode <= 9305) {
          Industry = 'Public & community services'
        } else if (NACECode >= 9500 && NACECode <= 9990) {
          Industry = 'Misc'
        } else if ((NACECode >= 1500 && NACECode <= 2330) || (NACECode >= 2600 && NACECode <= 2875)) {
          Industry = 'Other chemicals'
        } else if (NACECode >= 2440 && NACECode <= 2442) {
          Industry = 'Specialized chemicals (pharmaceuticals, etc.)'
        } else if (NACECode >= 4000 && NACECode <= 4100) {
          Industry = 'Unregulated energy/utilities'
        }
        SECTORS_LIST.push({
          NACECode: NACECode.toString(),
          TradeSector,
          Description,
          Industry: Industry === '' ? null : Industry
        })
      }

      fs.writeFile(fileLocation, JSON.stringify(SECTORS_LIST, null, 3), function (err) {
        if (err) {
          return console.log(err);
        }
      })
      resolve({
        horodatage,
        fileLocation
      })
    } catch (err) { reject(err) }
  })
}

exports.Test5 = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const CpvList = await require(process.cwd() + '/controllers/cpv/MdlCpv').CpvList()

      let creationDateMax = new Date()
      creationDateMax.setDate(creationDateMax.getDate() - 10);
      let creationDateMin = new Date()
      creationDateMin.setDate(creationDateMin.getDate() - 15);
      const tenders = await require(process.cwd() + '/controllers/Tender/MdlTender').TenderList(null, null, creationDateMin, creationDateMax)
      const tendersToDelete = []
      const tendersToUpdate = []
      for (const tender of tenders) {
        let isOk = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textExclusion(tender.title, 'TITLE')
        if (!isOk.status) {
          tendersToDelete.push(tender)
          continue
        }
        isOk = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textExclusion(tender.description, 'DESCRIPTION')
        if (!isOk.status) {
          tendersToDelete.push(tender)
          continue
        }

        /*
        if (tender.id === 496662) {
          const toto = 1
        }
        */

        const tenderCriterionsTitle = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').cpvParseTreat(tender.title, CpvList)
        if (tenderCriterionsTitle.length) {
          isOk = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').textExclusionIfNoCpv(tender.title, 'TITLE')
          if (!isOk.status) {
            tendersToDelete.push(tender)
            continue
          }
        }
        const tenderCriterionsDescription = await require(process.cwd() + '/controllers/TextParse/MdlTextParse').cpvParseTreat(tender.description, CpvList)
      }

      for (const tender of tendersToDelete) {
        if (!tender.id || !tender.algoliaId) {
          continue
        }
        await require(process.cwd() + '/controllers/Tender/MdlTender').TenderRemove(tender.id, tender.algoliaId, true)
      }

      for (const tender of tendersToUpdate) {
        if (!tender.id || !tender.algoliaId) {
          continue
        }
        // await require(process.cwd() + '/controllers/Tender/MdlTender').tenderAddUpdate(tender)
      }

      resolve()
    } catch (err) { reject(err) }
  })
}

exports.importDgmarket = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = require(process.cwd() + '/config')
      const fs = require('fs')
      const path = require('path')

      // Get file
      const fileFolder = path.join(config.WorkSpaceFolder, 'Archive/treat/')
      const files = fs.readdirSync(fileFolder)

      files.sort()
      if (!files || files.length === 0) {
        resolve()
        return
      }
      const fileLocation = path.join(fileFolder, files[0])

      const fileParseData = await require(process.cwd() + '/controllers/DgMarket/MdlDgMarket').FileParse(fileLocation)
      const importDgmarkets = fileParseData.importDgmarkets

      const BddId = 'deepbloo'
      const BddEnvironnement = config.prefixe
      const BddTool = require(process.cwd() + '/global/BddTool')      
      await BddTool.bulkInsert(
        BddId,
        BddEnvironnement,
        'importDgmarket',
        importDgmarkets
      )

      resolve()
    } catch (err) { reject(err) }
  })
}
