# slack-slash

A small, dependency-free toolkit for building a slash command for Slack that handles token validation, defining multiple actions, and automatically building a help action that explains the command's usage.

## Example

Check out the [example repo](https://github.com/lund5000/slack-slash-example) to see a simple Express app that creates a command using slack-slash.

## Creating and configuring a command

```
var Command = require('slack-slash').Command;

function MyCommand(data, token) {
	var command = new Command(data, token);

	// define actions with command.action();

	return command;
}

module.exports = MyCommand;
```

At execution time the command will compare the token received from Slack against the token defined when it was created. If the tokens do no match, the command will emit an `error` event.

## Methods

### command.action(pattern, description, handler)
- `pattern` RegExp|String
- `description` String
- `handler` Function

The `pattern` should be a regular expression that will be executed against the text a user enters. If the `pattern` is defined as a String, then it will be coerced into a RegExp. You can use capture groups to parse the text and those matches will be sent to your handler.

The `description` is a string that will be used to automatically build a help action. For example, when defining the command `/repeat' a description that reads "reverse [text]: Repeats back the text in reverse" will look this when a user types in "/repeat help":

_• /repeat reverse [text]: Repeats back the text in reverse_

#### Action handlers

Handlers should have the following method signature:

```js
function (data, matches, callback) { }
```
- `data` Object
- `matches` Array 
- `callback` Function

The `data` object includes all the data posted to your URL from Slack. The `matches` array includes the results of [executing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec) the `pattern` against the text sent from Slack (i.e., everything that the user typed after the command).

When the handler is complete, call the `callback()` with the data you would like sent in the `success` event (and likely sent back to Slack). If an error is thrown in the handler, it will be caught and the command will emit an `error` event.

### command.execute()

Execute the command, which will find the first action with a pattern that matches the `text` received from Slack and pass the data to that action's handler. If no matching action is found, the command will emit an `error` event.

## Events

### 'error'
```js
function (err) { }
```

Emitted when the command execution fails.

### 'success'
```js
function (response) { }
```

Emitted when the command executed successfully.