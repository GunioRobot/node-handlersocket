# node-handlersocket - Pure JavaScript client for HandlerSocket

node-handlersocket is a pure JavaScript client for HandlerSocket.

[HandlerSocket](https://github.com/ahiguti/HandlerSocket-Plugin-for-MySQL)
is a NoSQL plugin for MySQL.
See [auther's blog](http://yoshinorimatsunobu.blogspot.com/2010/10/using-mysql-as-nosql-story-for.html)
for more information.

## Installation

    npm install node-handlersocket

## Tutorial

    var hs = require('node-handlersocket');

    var con = hs.connect();
    con.on('connect', function() {
    con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO', 'EMPLOYEE_NAME' ],
        function(err, index) {
            index.find('=', 1, function(err, result) {
                console.log(result[0]);
                    con.end();
                });
            });
});

## API (TODO)

### connect(options)

Open a connection.
Returns a new Connection object.
The options parameter is an object with 'host' (default is 'localhost') and/or
'port' (default is 9998) properties.

### connection event: 'connect'

Emitted when a connection is established.

### connection envent: 'end'

Emitted when the other end of the stream sends a FIN packet.

### connection event: 'close' (hadError)

Emitted once the stream is fully closed.

### connection event: 'error' (err)

Emitted when an error occurs.

### Connection.openIndex(database, table, index, columns, callback)

Open an index.
The columns parameter is an array of column names.
The callback gets two arguments (err, index).

### Connection.end()

Half-closes the connection.

### Index.find(op, keys, [limit, [offset]], callback)

To read a records from a table using the index.
The keys parameter is an array of index values.
The callback gets two arguments (err, resultList).

### Index.update(op, keys, [limit, [offset]], values, callback)

To update a records.
The keys parameter is an array of index values.
The values parameter is an array of new column values.
The callback gets two arguments (err, rows).

### Index.insert(values, callback)

To add a records.
The values parameter is an array of new column values.
The callback gets two arguments (err, rows).

### Index.remove(op, keys, [limit, [offset]], callback)

To delete a records.
The keys parameter is an array of index values.
The callback gets two arguments (err, rows).
