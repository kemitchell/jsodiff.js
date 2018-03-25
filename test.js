var jsodiff = require('./')
var tape = require('tape')
var tests = require('./tests')

tests.forEach(function (test) {
  tape(test.comment, function (t) {
    t.deepEqual(jsodiff(test.a, test.b), test.diff)
    t.end()
  })
})
