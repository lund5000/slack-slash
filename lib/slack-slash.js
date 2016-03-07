'use strict';

var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');

function Command(data, token) {
  this.data = data;
  this.token = token;
  this.actions = [];
  this.helpEntries = [];

  mixin(this, EventEmitter.prototype, false);
}

Command.prototype._checkToken = function() {
  if(!this.token) {
    console.warn('Without a validation token anyone can execute your command.');
  } else {
    if(this.data.token !== this.token) throw 'Invalid token';
  }
}

Command.prototype._findAction = function (text) {
  var action;

  for(var i = 0; i < this.actions.length; i++) {
    action = this.actions[i];
    if(action.pattern.test(text)) {
      return action;
    }
  }
};

Command.prototype.action = function (pattern, help, callback) {
  if(typeof pattern !== RegExp) pattern = new RegExp(pattern);
  this.actions.push({pattern: pattern, callback: callback});
  this.helpEntries.push(help);
};

Command.prototype._getHelpText = function () {
  var command = this.data.command;
  var entries = this.helpEntries.map(function (entry) {
    return '• ' + command + ' ' + entry;
  });

  return {
    response_type: 'ephemeral',
    text: entries.join('\n')
  };
}

Command.prototype._finish = function (response) {
  this.emit('success', response);
}

Command.prototype.execute = function () {
  var data = this.data;

  try {
    this._checkToken();

    var text = data.text.trim();
    var action = this._findAction(text);

    if(text === 'help') {
      this.emit('success', this._getHelpText());
    } else if(action) {
      action.callback(data, action.pattern.exec(text), this._finish.bind(this));
    } else {
      this.emit('error', 'No matching action found to handle ' + text);
    }
  } catch(e) {
    this.emit('error', e);
  }
};

exports.Command = Command;