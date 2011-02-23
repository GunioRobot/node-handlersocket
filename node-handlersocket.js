var events = require('events'), net = require('net'), util = require('util');

exports.connect = connect;
exports.Connection = Connection;
exports.Index = Index;

function connect(options_) {
  var options = options_ || {};
  var host = options.host || 'localhost';
  var port = options.port || 9998;
  return new Connection(host, port);
}

function Connection(host, port) {
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
    self._notifyError(exception);
    self.emit('end', exception);
  });
  stream.on('close', function(hadError) {
    self.emit('close', hadError);
  });
  stream.on('error', function(exception) {
    self._notifyError(exception);
    self.emit('error', exception);
  });
  this._stream = stream;
  this._indexId = 0;
  this._callbacks = [];
  this._received = '';
}
util.inherits(Connection, events.EventEmitter);

Connection.prototype.openIndex = function(database, table, index, columns_, callback) {
  var self = this;
  var columns = Array.isArray(columns_) ? columns_ : [ columns_ ];
  var indexId = self._indexId++;
  var request = [ 'P', indexId, database, table, index, columns.join(',') ];
  self._execute(request, _handleResponse(function(err, fields) {
    if (err) {
      return callback(err);
    }
    return callback(null, new Index(self, indexId, columns.length));
  }));
};

Connection.prototype.end = function() {
  this._stream.end();
};

Connection.prototype._execute = function(request, callback) {
  if (this._stream.readyState !== 'open') {
    return callback(new Error('connection closed'));
  }
  var data = _createRequest(request);
  this._stream.write(data, 'utf8');
  this._callbacks.push(callback);
};

Connection.prototype._notifyError = function(err_) {
  var err = err_ || new Error('connection closed');
  var callbacks = this._callbacks;
  this._callback = [];
  var len = callbacks.length;
  for (var i = 0; i < len; ++i) {
    callbacks[i](err);
  }
}

function Index(con, indexId, columnCount) {
  events.EventEmitter.call(this);
  this._con = con;
  this._indexId = indexId;
  this._columnCount = columnCount;
}
util.inherits(Index, events.EventEmitter);

Index.prototype.find = function(operator, keys_, limit_, offset_, callback_) {
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

Index.prototype.insert = function(values_, callback) {
  var self = this;
  var values = Array.isArray(values_) ? values_ : [ values_ ];
  var request = [ self._indexId, '+', values.length ].concat(values);
  self._con._execute(request, _handleResponse(function(err, response) {
    if (err) {
      return callback(err);
    }
    return callback(null);
  }));
};

Index.prototype.update = function(operator, keys_, limit_, offset_, values_, callback_) {
  var self = this;
  var argc = arguments.length;
  var keys = Array.isArray(keys_) ? keys_ : [ keys_ ];
  var limit = argc > 4 ? limit_ : 1;
  var offset = argc > 5 ? offset_ : 0;
  var values = argc < 5 ? arguments[argc - 2] : values_;
  values = Array.isArray(values) ? values : [ values ];
  var callback = argc < 6 ? arguments[argc - 1] : callback_;
  var request = [ self._indexId, operator, keys.length ].concat(keys, [ limit, offset,
    'U' ], values);
  self._con._execute(request, _handleResponse(function(err, response) {
    if (err) {
      return callback(err);
    }
    var rows = parseInt(response[2]);
    return callback(null, rows);
  }));
};

Index.prototype.remove = function(operator, keys_, limit_, offset_, callback_) {
  var self = this;
  var argc = arguments.length;
  var keys = Array.isArray(keys_) ? keys_ : [ keys_ ];
  var limit = argc > 3 ? limit_ : 1;
  var offset = argc > 4 ? offset_ : 0;
  var callback = argc < 5 ? arguments[argc - 1] : callback_;
  var request = [ self._indexId, operator, keys.length ].concat(keys, [ limit, offset, 'D' ]);
  self._con._execute(request, _handleResponse(function(err, response) {
    if (err) {
      return callback(err, response[2]);
    }
    var rows = parseInt(response[2]);
    return callback(null, rows);
  }));
};

function _createRequest(fields) {
  var request = fields.map(function(field) {
    return _encodeField(field);
  }).join('\t');
  if (exports._debug) {
    util.debug(util.inspect(request));
  }
  return request + '\n';
}

function _handleResponse(callback) {
  return function(response) {
    if (exports._debug) {
      util.debug(util.inspect(response));
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
