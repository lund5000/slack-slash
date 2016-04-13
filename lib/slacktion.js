'use strict';

function Command(data, token) {
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

  function execute(callback) {
    try {
      checkToken();

      let text = data.text.trim();
      let action = actions.find(action => action.pattern.test(text));

      if(text === 'help') {
        callback(null, getHelpText());
      } else if(action) {
        action.handler(data, action.pattern.exec(text), callback);
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