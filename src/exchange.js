const rabbit = require('amqplib');
let ex = 'logs'

class Rabbit {
  constructor() {
    rabbit.connect('amqp://localhost')
      .then(conn => {
        this.conn = conn;
        return this.conn.createChannel()
      })
      .then(ch => {
        this.ch = ch
        return this.ch.assertExchange(ex, 'fanout', { durable: false })
      })
      .catch(err => console.error(err))
  }

  dispose() {
    this.conn.close()
  }
}

class Consumer extends Rabbit {
  /**
   * Consumes messages.
   * @param {callback} processMessage takes exact one arg - msg
   */
  constructor(processMessage) {
    super()
    this.ch.assertQueue('', { exclusive: true })
      .then(q => {
        this.q = q
        this.ch.bindQueue(q.queue, ex, '')
        // for the PoC we do not require acknowledgement
        this.ch.consume(this.q.queue, processMessage, { noAck: true })
      })
  }
}

class Producer extends Rabbit {
  constructor() {
    super()
  }

  produce(msg) {
    this.ch.publish(ex, '', new Buffer(msg))
  }
}

module.exports = {
  Rabbit,
  Consumer,
  Producer
}



