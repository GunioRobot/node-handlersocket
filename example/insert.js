var hs = require('../lib/node-handlersocket');

//hs._debug = true;
var con = hs.connect({port : 9999});
con.on('connect', function() {
  con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO',
    'EMPLOYEE_NAME' ], function(err, index) {
    index.insert([100, 9999, 'KOICHIK'], function(err) {
      if (!err) console.log('1 row inserted');
      con.end();
    });
  });
});
