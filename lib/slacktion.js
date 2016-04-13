'use strict';

const request = require('request');

function Command(data, token, options) {
  const actions = [];
  const helpEntries = [];

  function checkToken() {
    if(!token) {
      console.warn('Without a validation token anyone can execute your command.');
    } else {
      if(data.token !== token) throw 'Invalid token';
    }
  }

  function getHelpText() {
    return {
      response_type: 'ephemeral',
      text: helpEntries.reverse().map(entry => `• ${data.command} ${entry}`).join('\n')
    };
  }

  function action(pattern, help, handler) {
    if(typeof pattern !== RegExp) {
      pattern = new RegExp(pattern);
    }

    actions.push({pattern, handler});
    helpEntries.push(help);
    
    return this;
  }

  function finish(err, result) {
    if(options.delay.force) {
      request.post({
        url: data.response_url,
        body: result,
        json: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      callback(err, result);
    }
  }

  function execute(callback) {
    try {
      checkToken();

      let text = data.text.trim();
      let action = actions.find(action => action.pattern.test(text));

      if(text === 'help') {
        callback(null, getHelpText());
      } else if(action) {
        action.handler(data, action.pattern.exec(text), finish);
      } else {
        callback(`No matching action found to handle ${text}`);
      }
    } catch(e) {
      callback(e);
    }
  }

  return {
    action: action,
    execute: execute
  };
}

exports.Command = Command;