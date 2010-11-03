var vows = require('vows'), assert = require('assert'), events = require('events'), util = require('util'),
    hs = require('../lib/node-handlersocket');

//hs._debug = true;
vows.describe('Find').addBatch({
  'connect =>' : {
    topic : function() {
      var emitter = new events.EventEmitter();
      var con = hs.connect();
      con.on('connect', function() {
        emitter.emit('success', con);
      });
      return emitter;
    },
    'openIndex =>' : {
      topic : function(con) {
        con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO',
          'EMPLOYEE_NAME' ], this.callback);
      },
      'find a record with = operator' : {
        topic : function(index, con) {
          index.find('=', [ 1 ], this.callback);
          process.nextTick(function() {
            con.end();
          });
        },
        'should not error' : function(err, results) {
          assert.isNull(err);
        },
        'should be include 1 record' : function(err, results) {
          assert.length(results, 1);
        },
        'should ' : function(err, results) {
          assert.deepEqual(results[0], [ '1', '7369', 'SMITH' ]);
        }
      },
      'find some records with < operator' : {
        topic : function(index, con) {
          index.find('<', [ 3 ], 10, 0, this.callback);
          process.nextTick(function() {
            con.end();
          });
        },
        'should not error' : function(err, results) {
          assert.isNull(err);
        },
        'should be include 2 record' : function(err, results) {
          assert.length(results, 2);
        },
        'should ' : function(err, results) {
          assert.deepEqual(results[0], [ '2', '7499', 'ALLEN' ]);
          assert.deepEqual(results[1], [ '1', '7369', 'SMITH' ]);
        }
      }
    }
  }
}).export(module);
