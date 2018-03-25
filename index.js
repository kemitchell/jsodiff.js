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
    var type = operation.type
    var oldNode = operation.t1
    var newNode = operation.t2
    if (newNode) {
      var newValue = newNode.label.value || jsonolt.decode(operation.t2)
    }
    if (type === 'update') {
      var newNode = operation.t2
      returned.push({
        op: 'replace',
        path: operation.t1.path,
        value: newValue
      })
    } else if (type === 'insert') {
      returned.push({
        op: 'add',
        path: newNode.path,
        value: newValue
      })
    } else if (type === 'remove') {
      returned.push({
        op: 'remove',
        path: oldNode.path
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
