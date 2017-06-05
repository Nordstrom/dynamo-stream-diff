'use strict'

/**
 * Types of diff
 * @enum {string} DiffTypeEnum
 */
const DiffTypeEnum = {
  VALUE_CREATED: 'created',
  VALUE_UPDATED: 'updated',
  VALUE_DELETED: 'deleted',
  VALUE_UNCHANGED: 'unchanged'
}

/**
 * @typedef {Object} DiffInfo
 * @property {string} path - path to the difference relative to original object
 * @property {DiffTypeEnum} diff - type of difference
 * @property {*} [oldVal] - value at path passed in from obj1
 * @property {*} [newVal] - value at path passed in from obj2
 *
 */

/**
 * @typedef {Object} DeepDiff
 * @property {DiffInfo[]} diffList
 * @property {Object} diffMap
 */

module.exports = (function () {
  return {
    DiffTypeEnum,
    path: '',
    modified: [],
    joinPaths: function (curPath, key) {
      return `${(curPath) ? `${curPath}.` : ``}${key}`
    },

    /**
     * Determines the difference between two objects (obj1, obj2)
     * @param {Object} obj1
     * @param {Object} obj2
     * @returns {DeepDiff}
     */
    diff: function (obj1, obj2) {
      const diffInfo = {}
      let diffList = []
      diffInfo.diffMap = this.diffTail(obj1, obj2, '', diffList)
      diffInfo.diffList = diffList
      return diffInfo
    },

    // tail recursion yo
    diffTail: function (obj1, obj2, currentPath, diffList) {
      if (obj1 instanceof Function || obj2 instanceof Function) {
        throw new TypeError('Invalid argument. Function given, object expected.')
      }
      if (this.isValue(obj1) || this.isValue(obj2)) {
        let diffType = this.compareValues(obj1, obj2)
        // if difference is found, add path to modified list
        if (diffType !== this.DiffTypeEnum.VALUE_UNCHANGED) {
          let diffInfo = { path: currentPath, diff: diffType }

          // only define them on diff info if the values are defined
          if (typeof obj1 !== 'undefined') { diffInfo.oldVal = obj1 }
          if (typeof obj2 !== 'undefined') { diffInfo.newVal = obj2 }

          diffList.push(diffInfo)
        }
        return {
          type: diffType,
          oldVal: obj1,
          newVal: obj2
        }
      }

      const diff = {}
      for (let key in obj1) {
        diff[key] = this.diffTail(obj1[key], obj2[key], this.joinPaths(currentPath, key), diffList)
      }
      // loop through 2nd object keys in order to find any newly created keys
      for (let key in obj2) {
        // if diff was already found in first loop, don't need to traverse again
        if (typeof (diff[key]) !== 'undefined') { continue }

        diff[key] = this.diffTail(undefined, obj2[key], this.joinPaths(currentPath, key), diffList)
      }

      return diff
    },

    /**
     *
     * @param [value1]
     * @param [value2]
     * @returns {DiffTypeEnum|string}
     */
    compareValues: function (value1, value2) {
      if (value1 === value2) {
        return this.DiffTypeEnum.VALUE_UNCHANGED
      }
      if (typeof (value1) === 'undefined') {
        return this.DiffTypeEnum.VALUE_CREATED
      }
      if (typeof (value2) === 'undefined') {
        return this.DiffTypeEnum.VALUE_DELETED
      }

      return this.DiffTypeEnum.VALUE_UPDATED
    },
    isValue: function (obj) { return !(obj instanceof Object) && !(obj instanceof Array) }
  }
}())
