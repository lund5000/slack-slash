'use strict';

const request = require('request');
const merge = require('lodash.merge');
const qs = require('qs');

function Command(rawData, token, opts) {
  const actions = [];
  const helpEntries = [];
  const options = merge({
    delay_response: {
      response_type: 'ephemeral',
      text: 'Got it!'
    },
    force_delay: false
  }, opts);

  let data = {};
  if(typeof rawData === 'string') {
    data = qs.parse(rawData);
  } else {
    data = rawData;
  }

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

  function finish(callback) {
    return function (err, result) {
      if(options.force_delay) {
        request.post({
          url: data.response_url,
          body: result,
          json: true
        });
      } else {
        callback(err, result);
      }
    };
  }

  function execute(callback) {
    try {
      checkToken();

      let text = data.text.trim();
      if(text === 'help') {
        callback(null, getHelpText());
        return;
      }

      let action = actions.find(action => action.pattern.test(text));
      if(action) {
        if(options.force_delay === true) {
          callback(null, options.delay_response);
        }
        action.handler(data, action.pattern.exec(text), finish(callback));
      } else {
        callback(null, `No matching action found to handle "${text}"`);
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