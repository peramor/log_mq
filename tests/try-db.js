let db = require('../src/db');

let obj = {
  code: "MPGU",
  formid: "-47",
  grp: "guis_-47",
  ltpa: "",
  orgid: "guis",
  ssoid: "650ae77a-ffce-475d-a930-c7e345e0658c",
  subtype: "send",
  sudirresponse: "",
  ts: "1499763594",
  type: "formcontroller",
  url: "https://www.mos.ru/pgu/ru/application/guis/-47/#step_1",
  ymdh: "2017-07-11-09"
}

db.create(obj)
  .then(res => {
    console.log(`Pickle Rick!`)
  })
  .catch(err => {
    console.error(err);
  })