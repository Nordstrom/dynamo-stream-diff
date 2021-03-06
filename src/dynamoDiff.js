'use strict'

const unmarshalItem = require('dynamodb-marshaler').toJS
const diffMapper = require('./diffMapper')

/**
 * Determines the difference between DynamoDB Stream Records obj1 (old value) and obj2 (new value)
 * (Unmarshals both dynamo db records and does deep comparison on them)
 * @param obj1
 * @param obj2
 * @returns {DeepDiff}
 */
const dynamoDiff = function (obj1, obj2) {
  // first unmarshal both items
  const unmarshObj1 = unmarshalItem(obj1)
  const unmarshObj2 = unmarshalItem(obj2)

  // then determine diff between them
  return diffMapper.diff(unmarshObj1, unmarshObj2)
}

module.exports = dynamoDiff
