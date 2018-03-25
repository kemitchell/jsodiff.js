var deepEqual = require('fast-deep-equal')
var jsonolt = require('jsonolt')
var zs = require('zhang-shasha')

module.exports = function (a, b, options) {
  options = options || {}
  var aOLT = jsonolt.encode(a)
  var bOLT = jsonolt.encode(b)
  var insertCost = options.insertCost || defaultInsertCost
  var removeCost = options.removeCost || defaultRemoveCost
  var updateCost = options.updateCost
    ? function (a, b) { return options.updateCost(a.label, b.label) }
    : defaultUpdateCost
  var mapping = zs.mapping(
    aOLT, bOLT,
    getChildren,
    insertCost, removeCost, updateCost
  )
  return process(mapping)
}

function process (mapping) {
  var returned = []
  for (var index = 0; index < mapping.length; index++) {
    var operation = mapping[index]
    if (operation.type === 'update') {
      var newNode = operation.t2
      var value = newNode.label.value
        ? operation.t2.label.value
        : jsonolt.decode(operation.t2)
      returned.push({
        op: 'replace',
        path: operation.t1.path,
        value: value
      })
    }
  }
  return returned
}

function getChildren (node) { return node.children }

function defaultInsertCost (node) { return 1 }

function defaultRemoveCost (node) { return 1 }

function defaultUpdateCost (a, b) {
  return deepEqual(a.label, b.label) ? 0 : 1
}
