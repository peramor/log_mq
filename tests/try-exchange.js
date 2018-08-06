let { Consumer, Producer } = require('../src/exchange');

let consumer1 = new Consumer(msg => {
  console.log('thread 1: ' + msg)
})

let consumer2 = new Consumer(msg => {
  console.log('thread 2: ' + msg)
})

let producer = new Producer();

let count = 10; // we wanna send 10 messages

(function hi() {
  if (count <= 0) {
    producer.dispose()
    consumer1.dispose()
    consumer2.dispose()
    return
  }
  producer.produce(`${count} messages left`)
  count--
  hi()
})()