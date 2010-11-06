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
  'finding before insert' : {
    topic : function() {
      find(this.callback);
    },
    'should pass an empty array' : function(err, results) {
      con.end();
      assert.isNull(err);
      assert.length(results, 0);
    }
  }
});
suite.addBatch({
  'inserting' : {
    topic : function() {
      var self = this;
      openIndex(9999, function(err, index) {
        index.insert([ '100', '9999', 'KOICHIK' ], self.callback);
      })
    },
    'should not be error' : function() {
      con.end();
    }
  }
});
suite.addBatch({
  'finding after insert' : {
    topic : function() {
      find(this.callback);
    },
    'should pass an array which contains one record' : function(err, results) {
      con.end();
      assert.isNull(err);
      assert.length(results, 1);
      assert.deepEqual(results[0], [ '100', '9999', 'KOICHIK' ]);
    }
  }
});
suite.addBatch({
  'updating' : {
    topic : function() {
      var self = this;
      openIndex(9999, function(err, index) {
        index.update('=', [100], [ '100', '9999', 'EBIYURI' ], self.callback);
      })
    },
    'should update one row' : function(err, rows) {
      con.end();
      assert.isNull(err);
      assert.equal(rows, 1);
    }
  }
});
suite.addBatch({
  'finding after update' : {
    topic : function() {
      find(this.callback);
    },
    'should pass an array which contains one record' : function(err, results) {
      con.end();
      assert.isNull(err);
      assert.length(results, 1);
      assert.deepEqual(results[0], [ '100', '9999', 'EBIYURI' ]);
    }
  }
});
suite.addBatch({
  'deleting' : {
    topic : function() {
      var self = this;
      openIndex(9999, function(err, index) {
        index.remove('=', [100], self.callback);
      })
    },
    'should delete one row' : function(err, rows) {
      con.end();
      assert.isNull(err);
      assert.equal(rows, 1);
    }
  }
});
suite.addBatch({
  'finding after delete' : {
    topic : function() {
      find(this.callback);
    },
    'should pass an empty array' : function(err, results) {
      con.end();
      assert.isNull(err);
      assert.length(results, 0);
    }
  }
});
suite.export(module);
