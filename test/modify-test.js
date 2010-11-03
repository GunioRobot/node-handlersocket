var vows = require('vows'), assert = require('assert'), events = require('events'), util = require('util'),
    hs = require('../lib/node-handlersocket');

//hs._debug = true;
var con;
function openIndex(port, callback) {
  con = hs.connect({'port': port});
  con.on('connect', function() {
    con.openIndex('test', 'EMPLOYEE', 'PRIMARY', [ 'EMPLOYEE_ID', 'EMPLOYEE_NO',
      'EMPLOYEE_NAME' ], callback);
  });
}
function find(callback) {
  openIndex(9998, function(err, index) {
    index.find('=', [ 100 ], callback);
  });
}

var suite = vows.describe('Modify')
suite.addBatch({
  'find before insert' : {
    topic : function() {
      find(this.callback);
    },
    'should empty result' : function(err, results) {
      con.end();
      assert.isNull(err);
      assert.length(results, 0);
    }
  }
});
suite.addBatch({
  'insert' : {
    topic : function() {
      var self = this;
      openIndex(9999, function(err, index) {
        index.insert([ '100', '9999', 'KOICHIK' ], self.callback);
      })
    },
    'should one row inserted' : function(err, rows) {
      con.end();
      assert.isNull(err);
      assert.equal(rows, 1);
    }
  }
});
suite.addBatch({
  'find after insert' : {
    topic : function() {
      find(this.callback);
    },
    'should find one record' : function(err, results) {
      con.end();
      assert.isNull(err);
      assert.length(results, 1);
      assert.deepEqual(results[0], [ '100', '9999', 'KOICHIK' ]);
    }
  }
});
suite.addBatch({
  'update' : {
    topic : function() {
      var self = this;
      openIndex(9999, function(err, index) {
        index.update('=', [100], [ '100', '9999', 'EBIYURI' ], self.callback);
      })
    },
    'should one row updated' : function(err, rows) {
      con.end();
      assert.isNull(err);
      assert.equal(rows, 1);
    }
  }
});
suite.addBatch({
  'find after update' : {
    topic : function() {
      find(this.callback);
    },
    'should find one record' : function(err, results) {
      con.end();
      assert.isNull(err);
      assert.length(results, 1);
      assert.deepEqual(results[0], [ '100', '9999', 'EBIYURI' ]);
    }
  }
});
suite.addBatch({
  'delete' : {
    topic : function() {
      var self = this;
      openIndex(9999, function(err, index) {
        index.remove('=', [100], self.callback);
      })
    },
    'should one row deleted' : function(err, rows) {
      con.end();
      assert.isNull(err);
      assert.equal(rows, 1);
    }
  }
});
suite.addBatch({
  'find after delete' : {
    topic : function() {
      find(this.callback);
    },
    'should find no record' : function(err, results) {
      con.end();
      assert.isNull(err);
      assert.length(results, 0);
    }
  }
});
suite.export(module);
