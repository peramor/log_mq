const
  Promise = require('promise'),
  schema = require('./schema/schema.json'),
  { validate } = require('jsonschema')

/**
 * Removes unproper fields (extra) in object which are not
 * in schema. 
 * @param {object} instance 
 * @param {object} schema 
 */
function removeExtraFields(instance, schema) {
  if (Array.isArray(instance))
    return;
  let keys = Object.keys(schema.properties);
  for (let key in instance) {
    if (keys.indexOf(key) === -1)
      delete instance[key]
  }
}

/**
 * Validates an object agains log schema
 * @param {object} instance log object
 */
module.exports.validate = (instance) => {
  removeExtraFields(instance, schema);
  let validationRes = validate(instance, schema);
  if (!validationRes.valid) 
    return Promise.reject({
      message: 'Bad schema'
    })
  else
    return Promise.resolve();
}