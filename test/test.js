'use strict';

const expect = require('chai').expect;
const Command = require('../lib/slacktion').Command;

describe('Command', function () {
  describe('#constructor()', function () {
    it('should return the Command', function () {
      let cmd = Command();
      expect(cmd).to.exist;
    });
  });

  describe('#action()', function () {
    it('should return the Command', function () {
      let cmd = Command();
      let chain = cmd.action('');
      expect(cmd).to.eql(chain);
    });
  });


  describe('#execute()', function () {
    it('should check the token', function (done) {
      Command({
          command: '/test',
          text: 'help',
          token: 'not the configured token'
        }, 'token')
        .action('.*')
        .execute((err, result) => {
          expect(err).to.eql('Invalid token');
          done();
        });
    });

    it('should handle data passed as a query string', function (done) {
      Command('text=anything&token=token', 'token')
        .action('anything', '', 
          (data, matches, callback) => {
            callback(null, 'first');
          })
        .execute((err, result) => {
          expect(result).to.equal('first');
          done();
        });
    });

    it('should return help text when the event text is "help"', function (done) {
      let help = {
        response_type: 'ephemeral',
        text: '• /test help text'
      };
      
      Command({
          command: '/test',
          text: 'help',
          token: 'token'
        }, 'token')
        .action('.*', 'help text')
        .execute((err, result) => {
          expect(result).to.eql(help);
          done();
        });
    });

    it('should ignore missing help text', function (done) {
      let help = {
        response_type: 'ephemeral',
        text: '• /test help text'
      };
      
      Command({
          command: '/test',
          text: 'help',
          token: 'token'
        }, 'token')
        .action('.*', 'help text')
        .action('.*', '')
        .action('.*')
        .execute((err, result) => {
          expect(result).to.eql(help);
          done();
        });
    });

    it('should find and execute the first matching action', function (done) {
      Command({
          command: '/test',
          text: 'anything',
          token: 'token'
        }, 'token')
        .action('anything', '', 
          (data, matches, callback) => {
            callback(null, 'first');
          })
        .action(/.*/, '', 
          (data, matches, callback) => {
            callback(null, 'second');
          })
        .execute((err, result) => {
          expect(result).to.equal('first');
          done();
        });
    });

    it('should respond even when no matching action was found', function (done) {
      Command({
          command: '/test',
          text: 'anything',
          token: 'token'
        }, 'token')
        .action('nothing', '', 
          (data, matches, callback) => {
            callback(null, 'first');
          })
        .execute((err, result) => {
          expect(result).to.equal('No matching action found to handle "anything"');
          done();
        });
    });

    it('should handle errors thrown in action handlers', function (done) {
      let cmd = Command({
        command: '/test',
        text: 'anything',
        token: 'token'
      }, 'token');

      cmd.action('anything', '', (data, matches, callback) => {
        throw 'up';
      });

      expect(function () { 
        cmd.execute((err, result) => {
          expect(err).to.equal('up');
          done();
        });
      }).not.to.throw('up');
    });
  });

  describe('force_delay: true', function () {
    it('should respond to the callback by default', function (done) {
      let data = {
        command: '/test',
        text: 'anything',
        token: 'token',
        response_url: 'http://www.example.com'
      };

      let response = {
        response_type: 'ephemeral',
        text: 'Got it!'
      };

      Command(data, 'token', { force_delay: true })
        .action('anything', '', 
          (data, matches, callback) => {
            callback(null, 'first');
          })
        .execute((err, result) => {
          expect(result).to.eql(response);
          done();
        });
    });

    it('should respond to the callback with any configured response', function (done) {
      let data = {
        command: '/test',
        text: 'anything',
        token: 'token',
        response_url: 'http://www.example.com'
      };

      let options = { 
        force_delay: true, 
        delay_response: 'OK' 
      };

      Command(data, 'token', options)
        .action('anything', '', 
          (data, matches, callback) => {
            callback(null, 'first');
          })
        .execute((err, result) => {
          expect(result).to.equal(options.delay_response);
          done();
        });
    });
  });
});