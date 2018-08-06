const
  util = require('util'),
  fs = require('fs'),
  { join } = require('path'),
  rl = require('readline'),
  LOG_PATH = process.env.LOG_PATH || join(__dirname, '..', 'input.csv'),
  stat = util.promisify(fs.fstat),
  dec = new (require('string_decoder').StringDecoder)('utf-8'),
  mapper = require('./mapper')
let
  cursor = 0, // TODO: take the value from a store
  fileSize = 0,
  buf = Buffer.allocUnsafe(64), // length of a line is from 50 to 2xx, so 64 is optimal 
  fd // File descriptor.

// We use Sync, because we want to identify log file
// before start.
try {
  // Allocate file descriptor.
  // r - for reading
  fd = fs.openSync(LOG_PATH, 'r')
  fileSize = fs.fstatSync(fd).size;
  cursor = fileSize;
} catch (err) {
  console.error('Cannot open log file by path ' + LOG_PATH)
  process.exit(-1);
}

function processLine(line) {
  mapper.map(line);
  // -> mq
}

function close() {
  fs.close(fd, err => {
    if (err) throw err;
    console.info('file successfully closed')
  })
}

// ------------------------ HISTORICAL DATA --------------------------
let histProcessed = false; // set true when all historical data will be processed.

let stream = fs.createReadStream(LOG_PATH);
const histReadline = rl.createInterface({
  input: stream
});

console.time('reading');

histReadline.on('line', line => {
  processLine(line);
})

histReadline.on('close', () => {
  console.timeEnd('reading');
  console.info('Historical data was successfully executed');
  stream.close();
  histProcessed = true;
})

// ------------------------ DINAMIC UPDATES --------------------------

// Looking for updates (appending a file with new lines).
fs.watch(LOG_PATH, { encoding: 'utf8' }, async (event) => {
  if (event === 'change') {
    // Known issue in fs.Watch, it is invoked several times for one update,
    // by checking size of file repetitions will be skipped.
    let { size } = await stat(fd);
    if (size <= fileSize || !histProcessed)
      return
    else
      fileSize = size;
    console.debug(event)
    extract();
  }
})

function extract() {
  do {
    var { line, end } = readline();
    processLine(line);
  } while (!end)
}

function readline() {
  let line = "";
  const startCursor = cursor;
  while (true) {
    let bytes = fs.readSync(fd, buf, 0, buf.length, cursor);
    cursor += bytes;
    line += dec.write(buf.slice(0, bytes)).trim();
    if (line.length === 0)
      return { line: '', end: true };
    if (bytes < buf.length)
      return { line, end: true };
    const lineBreak = line.indexOf('\n');
    if (lineBreak !== -1) {
      const res = line.slice(0, lineBreak);
      cursor = startCursor + lineBreak + 1;
      return { line: res, end: false };
    }
  }
}