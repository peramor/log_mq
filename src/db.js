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

/**
 * Creates a row in User_Behaviors table.
 * @param {object} obj log object
 * 
 * TODO: the function could be optimized by using transactions
 */
let create = async obj => {
  try {
    validate(obj)
    if (obj.subtype.length > 20)
      console.log(JSON.stringify(obj))
    return;
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

exports.notCompleted = (limit = 10, offset = 0) => {
  if (+limit !== limit) limit = 10;
  if (+offset !== offset) offset = 0;
  
  return pool.query(`select formid, json_agg((ssoid, type, subtype)) from user_behaviors
  where subtype != 'success'
  group by formid
  limit $1
  offset $2`, [limit, offset])
}

exports.topForms = () => {
  return pool.query(`select formid, count(formid) as freq from user_behaviors 
  where formid ~ '.+'
  group by formid 
  order by freq 
  desc limit 5;`)
}

exports.userForms = () => {
  return pool.query(`select ssoid, array_agg(formid) 
  from user_behaviors 
  where extract(epoch from now())-ts < 3600 
  group by ssoid;`)
}