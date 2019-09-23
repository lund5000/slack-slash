# slacktion
Build a slash command for Slack without the boilerplate.

## Example
```js
const Command = require('slacktion').Command;

let repeater = Command(DATA_POSTED_BY_SLACK, VALIDATION_TOKEN);

repeater.action(/reverse (.*)/, 'reverse [text]: Repeats back the text in reverse',
    (data, matches, callback) => {
      callback({
        response_type: 'ephemeral',
        text: matches[1].split('').reverse().join('')
      });
    }
  )
  .action(/.*/, '[text]: Repeats back the text',
    (data, matches, callback) => {
      callback({
        response_type: 'ephemeral',
        text: data.text
      });
    }
  )
  .execute((err, result) => {});
```
## Installation
```
$ npm install slacktion
```
## Features
- validate token
- define multiple actions with regular expressions
- automatically build a help action that explains the command's usage

## Usage
### Create a command
Instantiate your command by passing it the data Slack posted to your URL and the validation token you received from Slack when creating the command.

```js
const Command = require('slacktion').Command;
let repeater = Command(DATA_POSTED_BY_SLACK, VALIDATION_TOKEN);
```

### `action(pattern, description, handler)`
A simple command might have just one action:

```js
repeater.action(/.*/, '[text]: Repeats back the text',
  (data, matches, callback) => {
    callback(null, {
      response_type: 'ephemeral',
      text: data.text
    });
  }
);
```

The `pattern` should be a regular expression that will be executed against the text a user enters. You can use capture groups to parse the text and those matches will be sent to your handler.

The `description` is a string that will be used to automatically build a help action. For example, the action above would respond with the following when a user types "/repeat help":

_• /repeat [text]: Repeats back the text in reverse_

The `handler` should look like `(data, matches, callback) => {}`. The `data` object includes all the data posted to your URL from Slack. The `matches` array includes the results of [executing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec) the `pattern` against the text sent from Slack (i.e., everything that the user typed after the command). The `callback` follows Node's standard `(err, result) => {}` style.

#### Multiple actions
A more complex command can define multiple actions, each with their own regular expression to match against whatever the user typed.

```js
repeater.action(/reverse (.*)/, 'reverse [text]: Repeats back the text in reverse',
    (data, matches, callback) => {
      callback({
        response_type: 'ephemeral',
        text: matches[1].split('').reverse().join('')
      });
    }
  )
  .action(/.*/, '[text]: Repeats back the text',
    (data, matches, callback) => {
      callback({
        response_type: 'ephemeral',
        text: data.text
      });
    }
  )
```

### `execute(callback)`
Execute the command, which will find the first action with a pattern that matches the `text` received from Slack run that action's handler. 

```js
repeater.execute((err, result) => {
  // handle err or result
});
```

If no matching action is found, the `error` will be `null` and the result will be a simple message explaining that the text could not be matched to an action.

### Options
When creating your command, you can force it to respond to the URL Slack provides for delayed responses instead of the original request.
```js
let cmd = Command(DATA_POSTED_BY_SLACK, VALIDATION_TOKEN, {
  force_delay: true
});
```

This can be useful if you want to respond in a channel without showing the original command and without setting up an incoming webhook. You can immediately acknowledge the response and customize that message with the `delay_response` option.
```js
let cmd = Command(DATA_POSTED_BY_SLACK, VALIDATION_TOKEN, {
  force_delay: true,
  delay_response: {
    response_type: 'ephemeral',
    text: '10-4, good buddy'
  }
});
```

