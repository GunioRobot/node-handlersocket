var vows = require('vows'), assert = require('assert'), events = require('events'), util = require('util'),
    hs = require('../lib/node-handlersocket');

//hs._debug = true;
vows.describe('OpenIndex').addBatch({
  'connect =>' : {
    topic : function() {
      var emitter = new events.EventEmitter();
      var con = hs.connect();
      con.on('connect', function() {
        emitter.emit('success', con);
      });
      return emitter;
    },
    'openIndex' : {
      topic : function(con) {
        con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO',
          'EMPLOYEE_NAME' ], this.callback);
      },
      'should not error' : function(err, index) {
        assert.isNull(err);
      },
      'should instance of hs.Index' : function(err, index) {
        assert.instanceOf(index, hs.Index);
      },
      'shoud have 3 columns' : function(err, index) {
        assert.equal(index._columnCount, 3);
      },
      'close' : function(err, index) {
        index._con.end();
      }
    }
  }
}).export(module);
