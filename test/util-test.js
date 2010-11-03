var vows = require('vows'), assert = require('assert'), hs = require('../lib/node-handlersocket');

vows.describe('Utilities').addBatch({
  'encodeField' : {
    'empty string' : {
      topic : function() {
        return hs._encodeField('');
      },
      'should be empty string' : function(topic) {
        assert.equal(topic, '');
      }
    },
    'basic string' : {
      topic : function() {
        return hs._encodeField('abcdef0123+-*/');
      },
      'shoud be same string' : function(topic) {
        assert.equal(topic, 'abcdef0123+-*/');
      }
    },
    'need encode' : {
      topic : function() {
        return hs._encodeField('\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007' + '\u0008\u0009\u000A\u000B\u000C\u000D\u000E\u000F\u0010');
      },
      'shoud be encoded' : function(topic) {
        assert.equal(topic, '\u0001\u0040\u0001\u0041\u0001\u0042\u0001\u0043' + '\u0001\u0044\u0001\u0045\u0001\u0046\u0001\u0047' + '\u0001\u0048\u0001\u0049\u0001\u004A\u0001\u004B' + '\u0001\u004C\u0001\u004D\u0001\u004E\u0001\u004F\u0010');
      }
    }
  },
  'decodeField' : {
    'empty string' : {
      topic : function() {
        return hs._decodeField('');
      },
      'should be empty string' : function(topic) {
        assert.equal(topic, '');
      }
    },
    'basic string' : {
      topic : function() {
        return hs._decodeField('abcdef0123+-*/');
      },
      'shoud be same string' : function(topic) {
        assert.equal(topic, 'abcdef0123+-*/');
      }
    },
    'need decode' : {
      topic : function() {
        return hs._decodeField('\u0001\u0040\u0001\u0041\u0001\u0042\u0001\u0043' + '\u0001\u0044\u0001\u0045\u0001\u0046\u0001\u0047' + '\u0001\u0048\u0001\u0049\u0001\u004A\u0001\u004B' + '\u0001\u004C\u0001\u004D\u0001\u004E\u0001\u004F\u0010');
      },
      'shoud be encoded' : function(topic) {
        assert.equal(topic, '\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007' + '\u0008\u0009\u000A\u000B\u000C\u000D\u000E\u000F\u0010');
      }
    }
  },
  'createRequest' : {
    'basic string' : {
      topic : function() {
        return hs._createRequest([ 'P', '1', 'database', 'table', 'PRIMARY', 'aaa,bbb,ccc' ]);
      },
      'should be tab separated string' : function(topic) {
        assert.equal(topic, 'P\t1\tdatabase\ttable\tPRIMARY\taaa,bbb,ccc\n');
      }
    },
    'need encode' : {
      topic : function() {
        return hs._createRequest([ '1', '=', '2', 'a\ta', 'b\nb', 1, 0 ]);
      },
      'should be tab separated and encoded string' : function(topic) {
        assert.equal(topic, '1\t=\t2\ta\u0001\u0049a\tb\u0001\u004Ab\t1\t0\n');
      }
    },
    'include empty fields' : {
      topic : function() {
        return hs._createRequest([ '1', '=', '2', '', '', 1, 0 ]);
      },
      'should be tab separated string' : function(topic) {
        assert.equal(topic, '1\t=\t2\t\t\t1\t0\n');
      }
    }
  },
  'handleResponse' : {
    'sucess' : {
      topic : function() {
        return hs._handleResponse(this.callback)('0\t1\n');
      },
      'should not error' : function(err, response) {
        assert.isNull(err);
      },
      'shoud have 2 fields' : function(err, response) {
        assert.deepEqual(response, ['0', '1']);
      }
    },
    'error' : {
      topic : function() {
        return hs._handleResponse(this.callback)('1\t1\n');
      },
      'should error' : function(err, response) {
        assert.instanceOf(err, Error);
      },
      'should have error code' : function(err, response) {
        assert.equal(err.message, '1');
      }
    },
    'error with message' : {
      topic : function() {
        return hs._handleResponse(this.callback)('1\t1\thoge\n');
      },
      'should error' : function(err, response) {
        assert.instanceOf(err, Error);
      },
      'should have error code' : function(err, response) {
        assert.equal(err.message, '1 hoge');
      }
    }
  }
}).export(module);
