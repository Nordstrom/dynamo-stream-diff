# Dynamo Stream Diff

Allows comparing of new and old images from dynamo stream records. Note, this only works on Dynamo Streams with 
a `StreamViewType` of `NEW_AND_OLD_IMAGES`

## Installation
```
npm install dynamo-stream-diff --save
```

## Usage

```javascript
const dynamoStreamDiff = require('dynamo-stream-diff')

module.exports.handler = function(event, context, callback) {
  event.Records.forEach( (streamRecord) => {
    let diff = dynamoStreamDiff(streamRecord)
    // .... do something with the difference
  
  })
  callback(null, "Successfully handled all the differences")
}

```

## Example Input & Output

### Input
```json
{
  "awsRegion": "us-west-2",
  "dynamodb": {
    "ApproximateCreationDateTime": 123456789,
    "Keys": {
      "id" : {
        "S": "abc"
      }
    },
    "NewImage": {
      "id" : {
        "S": "abc"
      },
      "name" : {
        "S": "new-name"
      },
      "size" : {
        "N": 456
      },
      "enabled" : {
        "BOOL": true
      }
    },
    "OldImage": {
      "id" : {
        "S": "abc"
      },
      "name" : {
        "S": "old-name"
      },
      "size" : {
        "N": 123
      },
      "enabled" : {
        "BOOL": false
      }
    },
    "SequenceNumber": "seq-num",
    "SizeBytes": 1245,
    "StreamViewType": "NEW_AND_OLD_IMAGES"
  },
  "eventID": "event-id",
  "eventName": "MODIFY",
  "eventSource": "event-source",
  "eventVersion": "event-version"
}
```

### Output

```json
{
  "diffMap": {
    "id": {
      "type": "unchanged",
      "oldVal": "abc",
      "newVal": "abc"
    },
    "name": {
      "type": "updated",
      "oldVal": "old-name",
      "newVal": "new-name"
    },
    "size": {
      "type": "updated",
      "oldVal": 123,
      "newVal": 456
    },
    "enabled": {
      "type": "updated",
      "oldVal": false,
      "newVal": true
    }
  },
  "diffList": [
    {
      "path": "name",
      "diff": "updated",
      "oldVal": "old-name",
      "newVal": "new-name"
    },
    {
      "path": "size",
      "diff": "updated",
      "oldVal": 123,
      "newVal": 456
    },
    {
      "path": "enabled",
      "diff": "updated",
      "oldVal": false,
      "newVal": true
    }
  ]
}
```
