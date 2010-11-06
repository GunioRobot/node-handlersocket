var hs = require('../lib/node-handlersocket'), asyncMap = require('slide/async-map');

var indexDefs = [
  ['test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO', 'EMPLOYEE_NAME' ]],
  ['test', 'DEPARTMENT', 'PRIMARY', ['DEPARTMENT_ID', 'DEPARTMENT_NO', 'DEPARTMENT_NAME']],
  ['test', 'ADDRESS', 'PRIMARY', ['ADDRESS_ID', 'STREET']]
];

//hs._debug = true;
var con = hs.connect();
con.on('connect', function() {
  asyncMap(indexDefs, function(indexDef, callback) {
    con.openIndex.apply(con, indexDef.concat(callback))
  }, function(err, indices) {
    indices.forEach(function(index) {
      console.log(index);
    });
    con.end();
  });
});


