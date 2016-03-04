'use strict';

var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');

function Command() {
  this.actions = [];

  mixin(this, EventEmitter.prototype, false);
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

Command.prototype.action = function (pattern, callback) {
  this.actions.push({pattern: pattern, callback: callback});
};

Command.prototype.execute = function (data) {
  var text = data.text;
  var action = this.findAction(text);

  if(action) {
    var matches = action.pattern.exec(text);
    
    try {
      this.emit('success', action.callback(data, matches));
    } catch(e) {
      this.emit('error', e);
    }
  } else {
    this.emit('error', 'No matching action found to handle ' + text);
  }
};

exports.Command = Command;