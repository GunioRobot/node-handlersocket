var vows = require('vows'), assert = require('assert'), events = require('events'),
    hs = require('../lib/node-handlersocket');

vows.describe('Connect').addBatch({
  'connecting to ' : {
    topic : function() {
      return function(options) {
        var emitter = new events.EventEmitter();
        var con = hs.connect(options);
        con.on('connect', function() {
          emitter.emit('success', con);
          console.log('closing ' + options);
          con.end();
        });
        con.on('error', function(err) {
          emitter.emit('success', err);
        });
        return emitter;
      }
    },
    'default host and port' : {
      topic : function(topic) {
        return topic();
      },
      'connected' : function(con) {
        assert.instanceOf(con, hs.Connection);
      }
    },
    'specific host and port' : {
      topic : function(topic) {
        return topic({
          host : '127.0.0.1',
          port : 9999
        });
      },
      'connected' : function(con) {
        assert.instanceOf(con, hs.Connection);
      }
    },
    'illegal port' : {
      topic : function(topic) {
        return topic({
          port : 10000
        });
      },
      'could not connect' : function(con) {
        assert.instanceOf(con, Error);
      }
    }
  }
}).export(module);
