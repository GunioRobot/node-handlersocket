var hs = require('../lib/node-handlersocket');

//hs._debug = true;
var con = hs.connect();
con.on('connect', function() {
  con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO',
    'EMPLOYEE_NAME' ], function(err, index) {
    index.find('=', 100, function(err, results) {
      console.log(results[0]);
      con.end();
    });
  });
});
