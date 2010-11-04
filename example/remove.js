var hs = require('../lib/node-handlersocket');

var con = hs.connect({port : 9999});
con.on('connect', function() {
  con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO',
    'EMPLOYEE_NAME' ], function(err, index) {
    index.update('=', 100, function(err, rows) {
      console.log(rows);
      con.end();
    });
  });
});
