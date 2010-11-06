var vows = require('vows'), assert = require('assert'), events = require('events'), util = require('util'),
    hs = require('../lib/node-handlersocket');

//hs._debug = true;
var con;
vows.describe('OpenIndex').addBatch({
  'connect =>' : {
    topic : function() {
      var emitter = new events.EventEmitter();
      con = hs.connect();
      con.on('connect', function() {
        emitter.emit('success', con);
      });
      return emitter;
    },
    'open index to primary key of EMPOYEE table' : {
      topic : function(con) {
        con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO',
          'EMPLOYEE_NAME' ], this.callback);
      },
      'should pass null to error' : function(err, index) {
        assert.isNull(err);
      },
      'should create a new Index object' : function(err, index) {
        assert.instanceOf(index, hs.Index);
      },
      'shoud have 3 columns' : function(err, index) {
        assert.equal(index._columnCount, 3);
      },
      'after' : function(err, index) {
        con.end();
      }
    }
  }
}).export(module);
