var events = require('events'), net = require('net'), util = require('util');

exports.connect = function(options_) {
  var options = options_ || {};
  var host = options.host || 'localhost';
  var port = options.port || 9998;
  return new exports.Connection(host, port);
};

exports.Connection = function(host, port) {
  events.EventEmitter.call(this);
  var self = this;
  var stream = net.createConnection(port, host);
  stream.setEncoding('utf8');
  stream.on('connect', function() {
    self.emit('connect');
  });
  stream.on('data', function(data) {
    if (data) {
      var received = self._received += data;
      var pos;
      while ((pos = received.indexOf('\n')) !== -1) {
        var response = received.substring(0, pos + 1);
        received = self._received = received.substring(pos + 1);
        var callback = self._callbacks.shift();
        callback(response);
      }
    }
  });
  stream.on('end', function(exception) {
    self.emit('end', exception);
  });
  stream.on('close', function(hadError) {
    self.emit('close', hadError);
  });
  stream.on('error', function(exception) {
    self.emit('error', exception);
  });
  this._stream = stream;
  this._indexId = 0;
  this._callbacks = [];
  this._received = '';
};
util.inherits(exports.Connection, events.EventEmitter);

exports.Connection.prototype.openIndex = function(database, table, index, _columns, callback) {
  var self = this;
  var columns = Array.isArray(_columns) ? _columns : [ _columns ];
  var indexId = self._indexId++;
  var request = [ 'P', indexId, database, table, index, columns.join(',') ];
  self._execute(request, _handleResponse(function(err, fields) {
    if (err) {
      return callback(err);
    }
    return callback(null, new exports.Index(self, indexId, columns.length));
  }));
};

exports.Connection.prototype.end = function() {
  this._stream.end();
};

exports.Connection.prototype._execute = function(request, callback) {
  if (this._stream.readyState !== 'open') {
    return callback(new Error('connection closed'));
  }
  var data = _createRequest(request);
  this._stream.write(data, 'utf8');
  this._callbacks.push(callback);
};

exports.Index = function(con, indexId, columnCount) {
  events.EventEmitter.call(this);
  this._con = con;
  this._indexId = indexId;
  this._columnCount = columnCount;
};
util.inherits(exports.Index, events.EventEmitter);

exports.Index.prototype.find = function(operator, keys_, limit_, offset_, callback_) {
  var self = this;
  var argc = arguments.length;
  var keys = Array.isArray(keys_) ? keys_ : [ keys_ ];
  var limit = argc > 3 ? limit_ : 1;
  var offset = argc > 4 ? offset_ : 0;
  var callback = argc > 5 ? callback_ : arguments[argc - 1];
  var request = [ self._indexId, operator, keys.length ].concat(keys, [ limit, offset ]);
  self._con._execute(request, _handleResponse(function(err, response) {
    if (err) {
      return callback(err);
    }
    var len = response.length;
    var numColumns = parseInt(response[1]);
    var results = [];
    for (var i = 2; i < len; i += numColumns) {
      results.push(response.slice(i, i + numColumns));
    }
    return callback(null, results);
  }));
};

exports.Index.prototype.insert = function(values_, callback) {
  var self = this;
  var values = Array.isArray(values_) ? values_ : [ values_ ];
  var request = [ self._indexId, '+', values.length ].concat(values);
  self._con._execute(request, _handleResponse(function(err, response) {
    if (err) {
      return callback(err);
    }
    var rows = parseInt(response[1]);
    return callback(null, rows);
  }));
};

exports.Index.prototype.update = function(operator, _keys, _limit, _offset, _values, _callback) {
  var self = this;
  var argc = arguments.length;
  var keys = Array.isArray(_keys) ? _keys : [ _keys ];
  var limit = argc > 4 ? _limit : 1;
  var offset = argc > 5 ? _offset : 0;
  var values = argc < 5 ? arguments[argc - 2] : _values;
  values = Array.isArray(values) ? values : [ values ];
  var callback = argc < 6 ? arguments[argc - 1] : _callback;
  var request = [ self._indexId, operator, keys.length ].concat(keys, [ limit, offset,
    'U' ], values);
  self._con._execute(request, _handleResponse(function(err, response) {
    if (err) {
      return callback(err);
    }
    var rows = parseInt(response[1]);
    return callback(null, rows);
  }));
};

exports.Index.prototype.remove = function(operator, _keys, _limit, _offset, _callback) {
  var self = this;
  var argc = arguments.length;
  var keys = Array.isArray(_keys) ? _keys : [ _keys ];
  var limit = argc > 3 ? _limit : 1;
  var offset = argc > 4 ? _offset : 0;
  var callback = argc < 5 ? arguments[argc - 1] : _callback;
  var request = [ self._indexId, operator, keys.length ].concat(keys, [ limit, offset, 'D' ]);
  self._con._execute(request, _handleResponse(function(err, response) {
    if (err) {
      return callback(err, response[2]);
    }
    var rows = parseInt(response[1]);
    return callback(null, rows);
  }));
};

function _createRequest(fields) {
  var array = [];
  fields.forEach(function(field) {
    array.push(_encodeField(field))
  });
  var request = array.join('\t');
  if (exports._debug) {
    util.debug(request);
  }
  return request + '\n';
}

function _handleResponse(callback) {
  return function(response) {
    if (exports._debug) {
      util.debug(response);
    }
    var fields = [];
    response.substring(0, response.length - 1).split('\t').forEach(function(field) {
      fields.push(_decodeField(field));
    });
    var err = fields[0];
    if (err === '0') {
      return callback(null, fields);
    }
    var message = fields[2];
    return callback(new Error(message ? err + ' ' + message : err));
  };
}

function _encodeField(field) {
  if (field === undefined || field === null) {
    return '\0';
  }
  if (field === '') {
    return '';
  }
  if (typeof field !== 'string') {
    field = field.toString();
  }
  return field.replace(/[\x00-\x0F]/g, function(ch) {
    return String.fromCharCode(0x01, ch.charCodeAt(0) + 0x40);
  });
}

function _decodeField(field) {
  if (field === '\0') {
    return null;
  }
  return field.replace(/\u0001[\x40-\x4F]/g, function(ch) {
    return String.fromCharCode(ch.charCodeAt(1) - 0x40);
  });
}

// for tests
exports._debug = false;
exports._createRequest = _createRequest;
exports._handleResponse = _handleResponse;
exports._encodeField = _encodeField;
exports._decodeField = _decodeField;
