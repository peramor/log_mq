const rabbit = require('amqplib');
let ex = 'logs'

/**
 * Connect to AMQP
 * @returns {Promise} resolves {conn, ch} obj
 */
let connect = async () => {
  try {
    let conn = await rabbit.connect('amqp://localhost');
    console.log('rabbit connected')
    let ch = await conn.createChannel();
    ch.assertExchange(ex, 'fanout', { durable: false });
    return { conn, ch }
  } catch (err) {
    console.error(err)
    process.exit(-1)
  }
}

/**
 * Closes a connection.
 * @param {Object} conn - connection object from 'connect'
 */
let dispose = (conn) => {
  conn.close();
}

/**
 * Set a handler for incoming messages.
 * @param {object} ch channel obj from 'connect'
 * @param {callback} processMessage takes exact one arg
 */
let setProcessMessageCB = async (ch, processMessage) => {
  let q = await ch.assertQueue('', { exclusive: true })
  ch.bindQueue(q.queue, ex, '')
  ch.consume(q.queue, processMessage, { noAck: true })
}

/**
 * Produces a message
 * @param {object} ch channle obj from 'connect
 * @param {string} msg message
 */
let produceMessage = async (ch, msg) => {
  ch.publish(ex, '', new Buffer(msg))
}

module.exports = {
  connect,
  dispose,
  setProcessMessageCB,
  produceMessage
}



