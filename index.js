var deepEqual = require('fast-deep-equal')
var jsonolt = require('jsonolt')
var zs = require('zhang-shasha')

var encode = jsonolt.encode
var decode = jsonolt.decode

var UPDATE_PREFERENCE = 1
var REMOVE_PREFERENCE = 2
var INSERT_PREFERENCE = 3

module.exports = function (a, b, options) {
  options = options || {}
  var aOLT = encode(a)
  var bOLT = encode(b)
  var insertCost = options.insertCost
    ? function (node) {
      return options.insertCost(node) + INSERT_PREFERENCE
    }
    : defaultInsertCost
  var removeCost = options.removeCost
    ? function (node) {
      return options.removeCost(node) + REMOVE_PREFERENCE
    }
    : defaultRemoveCost
  var updateCost = options.updateCost
    ? function (a, b) {
      var cost = options.updateCost(a, b)
      return cost === 0 ? 0 : (cost + UPDATE_PREFERENCE)
    }
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
      var newValue = newNode.label.value || decode(operation.t2)
    }
    if (type === 'update') {
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
      if (oldNode.path.length === 0) {
        returned.push({
          op: 'remove',
          path: oldNode.path.concat(0)
        })
      } else {
        returned.push({
          op: 'remove',
          path: oldNode.path
        })
      }
    }
  }
  return returned
}

function getChildren (node) { return node.children }

function defaultInsertCost (node) {
  return 1 + INSERT_PREFERENCE
}

function defaultRemoveCost (node) {
  return 1 + REMOVE_PREFERENCE
}

function defaultUpdateCost (a, b) {
  return deepEqual(a.label, b.label) ? 0 : (1 + UPDATE_PREFERENCE)
}
