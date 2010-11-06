var hs = require('../lib/node-handlersocket'), asyncMap = require('slide/async-map');

var insertRecords = [
  [200, 9999, null],
  [300, 9998, null],
  [400, 9997, null],
  [500, 9996, null]
];

//hs._debug = true;
var con = hs.connect({port : 9999});
con.on('connect', function() {
  con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO',
    'EMPLOYEE_NAME' ], function(err, index) {
    asyncMap(insertRecords, function(rec, callback) {
      index.insert.apply(index, [rec, callback])
    }, function(err, rows) {
      console.log(rows.length + ' row(s) inserted');
      con.end();
    });
  });
});
