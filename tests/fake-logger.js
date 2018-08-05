const
  fs = require('fs'),
  { join } = require('path'),
  LOG_PATH = process.env.LOG_PATH || join(__dirname, '..', 'input.csv');

let
  rowCount = process.argv[2] || 12,
  timeout = process.argv[3] || 100;

(function write() {
  console.log('start');
  setTimeout(() => {
    fs.appendFile(LOG_PATH, '\n' + rowCount + '--STRING', err => {
      if (err) {
        console.error('error while appending file');
        process.exit(-1)
      }
      rowCount--
      console.log('sent')
      if (rowCount > 0)
        write();
    });
  }, timeout);
})();