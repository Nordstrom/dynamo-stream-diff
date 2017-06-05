'use strict'

const dynamoDiff = require('./src/dynamoDiff')

/**
 * Takes a dynamo stream record and returns the diff from old and new images
 * @param {Object} streamRecord
 * @returns {DeepDiff}
 */
const dynamoStreamDiff = function (streamRecord) {
  // event name must be MODIFY
  if (!streamRecord || !streamRecord.dynamodb) {
    throw new Error('Stream record is not correct type!')
  } else if (streamRecord.eventName !== 'MODIFY' || streamRecord.dynamodb.StreamViewType !== 'NEW_AND_OLD_IMAGES') {
    throw new Error('Cannot find diff from stream record event ' + streamRecord.eventName)
  }

  return dynamoDiff(streamRecord.dynamodb.OldImage, streamRecord.dynamodb.NewImage)
}

module.exports = dynamoStreamDiff
