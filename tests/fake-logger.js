const
  fs = require('fs'),
  { generate: ran } = require('randomstring'),
  { join } = require('path'),
  LOG_PATH = process.env.LOG_PATH || join(__dirname, '..', 'input.csv');

let
  rowCount = process.argv[2] || 12,
  timeout = process.argv[3] || 100;

(function write() {
  console.log('start');
  setTimeout(() => {
    fs.appendFile(LOG_PATH, '\n' + randomLog(), err => {
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

function randomLog() {
  return [
    /*ssoid:*/ ran(),
    /*ts:*/ ran({
      charset: 'numeric',
      length: 10
    }),
    /*grp:*/ ran(),
    /*type:*/ ran(),
    /*subtype:*/ ran(),
    /*url:*/ ran(),
    /*orgid:*/ ran(),
    /*formid:*/ ran(),
    /*code:*/ ran(),
    /*ltpa:*/ ran(),
    /*sudirresponse:*/ ran(),
    /*ymdh:*/ `2018-08-07-0` + ran({charset: 'numeric', length: 1}),
  ].join(';')
}

