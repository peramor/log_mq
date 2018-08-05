let isHeaderLine = true;
let args = []

/**
 * Convertes a row to json object.
 * @param {string} row one line in csv format
 * @returns json object
 */
module.exports.map = row => {
  if (isHeaderLine) {
    args = row.split(';')
    isHeaderLine = false;
    return;
  }
  let output = {};
  let values = row.split(';')
  if (args.length !== values.length) {
    console.warn(`
      line "${row.slice(0,30)}..." 
      was skipped during mapping,
      because it doesn't match number of arguments in 
      the header line.
    `)
    return;
  }
  for (let index in values) 
    output[args[index]] = values[index]
  return output;
}