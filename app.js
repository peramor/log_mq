require('./src/db') // load producer

setTimeout(() => {
  require('./src/mapper') // load consumer
}, 500);

setTimeout(() => {
  require('./src/reader') // run reader worker
    .on('loaded', () => require('./src/http-server')) // run server
}, 2000);