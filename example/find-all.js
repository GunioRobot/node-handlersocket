var hs = require('../lib/node-handlersocket');

//hs._debug = true;
var con = hs.connect();
con.on('connect', function() {
  con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO',
    'EMPLOYEE_NAME' ], function(err, index) {
    index.find('>=', 0, 1000, 0, function(err, results) {
      results.forEach(function(row) {
        console.log(row);
      });
      con.end();
    });
  });
});
/**
 * Created by IntelliJ IDEA.
 * User: koichik
 * Date: 2010/11/07
 * Time: 0:07:03
 * To change this template use File | Settings | File Templates.
 */
