var vows = require('vows'), assert = require('assert'), events = require('events'), util = require('util'),
    hs = require('../lib/node-handlersocket');

//hs._debug = true;
var con;
vows.describe('Find').addBatch({
  'connect =>' : {
    topic : function() {
      var emitter = new events.EventEmitter();
      con = hs.connect();
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
      'find one record with = operator' : {
        topic : function(index, con) {
          index.find('=', [ 1 ], this.callback);
        },
        'should pass a null to error' : function(err, results) {
          assert.isNull(err);
        },
        'should pass an array with 1 record' : function(err, results) {
          assert.length(results, 1);
        },
        'should results equal to' : function(err, results) {
          assert.deepEqual(results[0], [ '1', '7369', 'SMITH' ]);
        },
        'after' : function(err, index) {
          con.end();
        }
      },
      'find some records with < operator' : {
        topic : function(index, con) {
          index.find('<', [ 3 ], 10, 0, this.callback);
        },
        'should pass null to error' : function(err, results) {
          assert.isNull(err);
        },
        'should pass an array with 2 records' : function(err, results) {
          assert.length(results, 2);
        },
        'should results equal to' : function(err, results) {
          assert.deepEqual(results[0], [ '2', '7499', 'ALLEN' ]);
          assert.deepEqual(results[1], [ '1', '7369', 'SMITH' ]);
        },
        'after' : function(err, index) {
          con.end();
        }
      }
    }
  }
}).export(module);
