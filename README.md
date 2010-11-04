# node-handlersocket - Pure JavaScript client for HandlerSocket

node-handlersocket is a pure JavaScript client for HandlerSocket.

[HandlerSocket](https://github.com/ahiguti/HandlerSocket-Plugin-for-MySQL)
is a NoSQL plugin for MySQL.
See [auther's blog](http://yoshinorimatsunobu.blogspot.com/2010/10/using-mysql-as-nosql-story-for.html)
for more information.

## Requirements

- [Node.js](http://nodejs.org/) (> 0.3.0)
- [HandlerSocket](https://github.com/ahiguti/HandlerSocket-Plugin-for-MySQL) (tested with v1.0.6)

## Installation

    npm install node-handlersocket

## Examples

### find (select)

    var hs = require('node-handlersocket');

    var con = hs.connect();
    con.on('connect', function() {
    con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO', 'EMPLOYEE_NAME' ],
      function(err, index) {
        index.find('=', 1, function(err, results) {
          console.log(results[0]);
          con.end();
        });
      });
    });

### insert

    var hs = require('node-handlersocket');

    var con = hs.connect({port : 9999});
    con.on('connect', function() {
      con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO',
        'EMPLOYEE_NAME' ], function(err, index) {
        index.insert([100, 9999, 'KOICHIK'], function(err, rows) {
          console.log(rows);
          con.end();
        });
      });
    });

### update

    var hs = require('node-handlersocket');

    var con = hs.connect({port : 9999});
    con.on('connect', function() {
      con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO',
        'EMPLOYEE_NAME' ], function(err, index) {
        index.update('=', 100, [100, 9999, 'EBIYURI'], function(err, rows) {
          console.log(rows);
          con.end();
        });
      });
    });

### remove (delete)

    var hs = require('node-handlersocket');

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

## API (TODO)

### function : `connect(options)`

Open a connection.
Returns a new `Connection` object.
The options parameter is an object with `host` (default is a `'localhost'`) and/or
`port` (default is a `9998`) properties.

### event : `'connect' function()`

Emitted when a connection is established.

### envent : `'end' function()`

Emitted when the other end of the stream sends a FIN packet.

### event : `'error' function(err)`

Emitted when an error occurs.

### event : `'close' function(hadError)`

Emitted once the connection is fully closed.

### method : `Connection.openIndex(database, table, index, columns, callback)`

Open an index.
The `columns` parameter is an array of column names.
The `callback` gets two arguments `function(err, index)`.

### method : `Connection.end()`

Half-closes the connection.

### method : `Index.find(op, keys, [limit, [offset]], callback)`

To read a records from a table using the index.
The `keys` parameter is an array of index values.
The `callback` gets two arguments `function(err, results)`.

### method : `Index.update(op, keys, [limit, [offset]], values, callback)`

To update a records.
The `keys` parameter is an array of index values.
The `values` parameter is an array of new column values.
The `callback` gets two arguments `function(err, rows)`.

### method : `Index.insert(values, callback)`

To add a records.
The `values` parameter is an array of new column values.
The `callback` gets two arguments `function(err, rows)`.

### method : `Index.remove(op, keys, [limit, [offset]], callback)`

To delete a records.
The `keys` parameter is an array of index values.
The `callback` gets two arguments `function(err, rows)`.

## Test

node-handlersocket depends on [Vows](http://vowsjs.org/) for testing.

    mysql -u root -p test < sql/create.sql
    vows test/*.js
    mysql -u root -p test < sql/drop.sql

## Limitations



## License

node-handlersocket is licensed under the [MIT license](http://www.opensource.org/licenses/mit-license.php).
