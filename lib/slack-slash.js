'use strict';

var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');

function Command() {
  this.actions = [];
  this.token;

  mixin(this, EventEmitter.prototype, false);
}

Command.prototype.setToken = function (token) {
  this.token = token;
}

Command.prototype._checkToken = function(data) {
  if(!this.token) {
    console.warn('Without a validation token anyone can execute your command.');
  } else {
    if(data.token !== this.token) throw 'Invalid token';
  }
}

Command.prototype._findAction = function (text) {
  var action;

  for(var i = 0; i < this.actions.length; i++) {
    action = this.actions[i];

    console.log(action, action.pattern.test(text));
    if(action.pattern.test(text)) {
      return action;
    }
  }
};

Command.prototype.action = function (pattern, callback) {
  if(typeof pattern !== RegExp) pattern = new RegExp(pattern);
  this.actions.push({pattern: pattern, callback: callback});
};

Command.prototype.execute = function (data) {
  try {
    this._checkToken(data);

    var text = data.text.trim();
    var action = this._findAction(text);

    if(action) {
      this.emit('success', action.callback(data, action.pattern.exec(text)));
    } else {
      this.emit('error', 'No matching action found to handle ' + text);
    }
  } catch(e) {
    this.emit('error', e);
  }
};

exports.Command = Command;