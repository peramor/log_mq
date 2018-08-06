let exchange = require('../src/exchange');
let fs = require('fs');
(async function test() {
  let producer = await exchange.connect()
  let consumer1 = await exchange.connect()
  let consumer2 = await exchange.connect()

  await exchange.setProcessMessageCB(consumer1.ch, msg => {
    console.log('thread 1: ' + msg.content.toString());
  })

  await exchange.setProcessMessageCB(consumer2.ch, msg => {
    console.log('thread 2: ' + msg.content.toString());
  })

  let count = 10; // we wanna send 10 messages

  (async function sendMessage() {
    if (count <= 0)
      return

    exchange.produceMessage(producer.ch, `${count} messages left`)
    count--
    sendMessage()
  })()

})()