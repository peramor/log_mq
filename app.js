require('./src/db') // load producer

setTimeout(() => {
  require('./src/mapper') // load consumer
}, 500);

setTimeout(() => {
  require('./src/reader') // start reading
}, 2000);