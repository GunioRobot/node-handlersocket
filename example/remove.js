var hs = require('../lib/node-handlersocket');

//hs._debug = true;
var con = hs.connect({port : 9999});
con.on('connect', function() {
  con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO',
    'EMPLOYEE_NAME' ], function(err, index) {
    index.remove('>=', 100, 100, 0, function(err, rows) {
      console.log(rows + ' row(s) deleted');
      con.end();
    });
  });
});
