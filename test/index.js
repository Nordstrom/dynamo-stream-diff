describe('dynamoStreamDiff', () => {
  const dynamoStreamDiff = require('../index.js')

  describe('when given stream records not from dynamodb', () => {
    const kinesisFixture = require('./fixtures/mock-kinesis-record.json')
    it('should throw an error', function () {
      expect(() => dynamoStreamDiff(kinesisFixture)).to.throw(Error)
    })
  })
  describe('when given create stream records', () => {
    const insertFixture = require('./fixtures/stream-insert.json')
    it('should throw an error', function () {
      expect(() => dynamoStreamDiff(insertFixture)).to.throw(Error)
    })
  })
  describe('when given records with small diff', () => {
    const smallDiffFixture = require('./fixtures/diff.json')

    it('should return expected diff list', () => {
      let diff = dynamoStreamDiff(smallDiffFixture)
      let diffList = diff.diffList
      expect(diffList).to.have.lengthOf(3)
    })
  })
  describe('nested diff', function () {
    const smallDiffFixture = require('./fixtures/deep-diff.json')
    let diff
    before(function () {
      diff = dynamoStreamDiff(smallDiffFixture)
    })

    it('should detect two differences at different levels', () => {
      expect(diff.diffList).to.have.lengthOf(2)
    })
    it('should include the nested path of diff', function () {
      expect(diff.diffList).to.include.deep.members([
          { 'path': 'address.street1', 'diff': 'updated', 'newVal': '500 Pine St', 'oldVal': '4th & Pine' }
      ])
    })
    it('nested path should exist on diffMap and have type \'updated\'', function () {
      const deepFind = require('./helpers/deepFind')
      expect(deepFind(diff.diffMap, 'address.street1')).to.have.property('type', 'updated')
    })
  })
})

describe('diffMapper', () => {
  const diffMapper = require('../src/diffMapper.js')
  describe('invalid input', () => {
    describe('when a function is passed as a value to compare', () => {
      it('should throw a type error if both are functions', () => {
        const obj1 = { 'normalKey': 'normalVal', 'funcKey': function () { return 'uh oh' } }
        const obj2 = { 'normalKey': 'normalDiffVal', 'funcKey': function () { return 'uh oh' } }
        expect(() => diffMapper.diff(obj1, obj2)).to.throw(TypeError, 'Invalid argument. Function given, object expected.')
      })
      it('should throw a type error if only one is a function', () => {
        const obj1 = { 'normalKey': 'normalVal', 'funcKey': 'normalVal' }
        const obj2 = { 'normalKey': 'normalDiffVal', 'funcKey': function () { return 'uh oh' } }
        expect(() => diffMapper.diff(obj1, obj2)).to.throw(TypeError, 'Invalid argument. Function given, object expected.')
      })
    })
  })
  describe('when a key is added', function () {
    const obj1 = { 'a': 'val' }
    const obj2 = { 'a': 'val', 'newKey': 1 }
    let diff
    before(function () {
      diff = diffMapper.diff(obj1, obj2)
    })
    it('diffMap[newKey] should have obj with type \'created\'', () => {
      expect(diff.diffMap).to.have.property('newKey')
                          .that.deep.equals({'type': 'created', 'newVal': 1, oldVal: undefined})
    })
    it('diffList should contain obj with diff \'created\'', () => {
      expect(diff.diffList).to.have.lengthOf(1)
                      .and.to.include.deep.members([{ 'path': 'newKey', 'diff': 'created', 'newVal': 1 }])
    })
  })
  describe('when a key is deleted', function () {
    const obj1 = { 'a': 'val', 'deletedKey': 1 }
    const obj2 = { 'a': 'val' }
    let diff
    before(function () {
      diff = diffMapper.diff(obj1, obj2)
    })
    it('diffMap[deletedKey] should have obj with type \'deleted\'', () => {
      expect(diff.diffMap).to.have.property('deletedKey')
        .that.deep.equals({'type': 'deleted', 'oldVal': 1, newVal: undefined})
    })
    it('diffList should contain obj with diff \'deleted\'', () => {
      expect(diff.diffList).to.have.lengthOf(1)
        .and.to.include.deep.members([{ 'path': 'deletedKey', 'diff': 'deleted', 'oldVal': 1 }])
    })
  })
})
