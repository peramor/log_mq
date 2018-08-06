const
  { Pool } = require('pg'),
  { validate } = require('./schema-validator'),
  exchange = require('./exchange'),
  pool = new Pool(),
  fs = require('fs'),
  { join } = require('path'),
  initSql = fs.readFileSync(
    join(__dirname, 'schema', 'init.sql'), 'utf8');
let
  consumer = {},
  mqConnected = false;

exchange.connect()
  .then(res => {
    mqConnected = true;
    console.log('db consumer connected')
    consumer = res;
    exchange.setProcessMessageCB(consumer.ch, msg => {
      create(JSON.parse(msg.content.toString()))
    })
  })

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
});

pool.connect()
  .then(client => {
    client.query(initSql)
      .then(() => client.release())
  });

let create = async obj => {
  try {
    validate(obj)
    obj.ymdh = new Date(...obj.ymdh.split('-'))
    let text = `insert into user_behaviors (
      code, formid, grp, ltpa, orgid, ssoid, subtype, 
      sudirresponse, ts, type, url, ymdh
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`;
    let query = {
      name: 'insert', // will create a prepared statement by name
      text,
      values: [obj.code, obj.formid, obj.grp, obj.ltpa, obj.orgid, obj.ssoid,
      obj.subtype, obj.sudirresponse, obj.ts, obj.type, obj.url, obj.ymdh]
    }
    return pool.query(query);
  } catch (err) {
    console.error('Error while creating new row', err)
  }
}

/**
 * Creates a row in User_Behaviors table.
 * @param {object} obj log object
 * 
 * TODO: the function could be optimized by using transactions
 */
exports.create = create;

exports.read = () => {

}