
// global mocha to suppress lint warnings in test
global.before = require('mocha').before
global.describe = require('mocha').describe
global.it = require('mocha').it

// global assertion lib
global.chai = require('chai')
global.should = require('chai').should()
global.expect = require('chai').expect
global.AssertionError = require('chai').AssertionError
