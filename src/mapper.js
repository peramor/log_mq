const
  exchange = require('./exchange');
let
  isHeaderLine = true,
  args = [],
  mqConnected = false,
  producer = {};

exchange.connect()
  .then(res => {
    mqConnected = true
    producer = res
    console.log('log producer connected')
  })

/**
 * Convertes a row to json object.
 * @param {string} row one line in csv format
 * @returns json object
 */
module.exports.map = async row => {
  try {
    if (isHeaderLine) {
      args = row.split(';')
      isHeaderLine = false;
      return;
    }
    let output = {};
    let values = row.split(';')
    if (args.length !== values.length) {
      console.warn(`
      line "${row.slice(0, 30)}..." 
      was skipped during mapping,
      because it doesn't match number of arguments in 
      the header line.
    `)
      return;
    }
    for (let index in values)
      output[args[index]] = values[index]
    exchange.produceMessage(producer.ch, JSON.stringify(output))
  } catch (err) {
    console.error(err)
  }
}