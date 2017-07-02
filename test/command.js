var should = require('should')
var command = require('../lib/command.js')

describe('Command',function(){
	it('should be parse properly',function(){
		var cmd = new command.Command(command.CommandName.SUBSCRIBE,{channel: 'channel'});
		cmd.name.should.be.exactly('subscribe');

		var cmd1 = new command.Command(command.CommandName.PUBLISH,{
			channel: 'channel',
			message:{
				body:"message"
			}
		});
		cmd1.name.should.be.exactly('publish');
		cmd1.channel.should.be.exactly('channel');
		// console.log("test" + cmd1.message);
		cmd1.message.body.should.be.exactly('message');

		var cmd2 = new command.Command(command.CommandName.UNSUBSCRIBE,{channel: 'channel'});
		cmd2.name.should.be.exactly('unsubscribe');
		cmd2.channel.should.be.exactly('channel');

		var cmd3 = new command.Command(command.CommandName.LIST);
		cmd3.name.should.be.exactly('list');
	});

	it('should not be valid when command is wrong',function(){
		var cmd = new command.Command('test');
		cmd.valid.should.be.false();
	});

	it('should return a valid string by toCommandline method', function(){
		var cmd1 = new command.Command(command.CommandName.PUBLISH,{
			channel: 'channel',
			message: {
				action:'myaction'
			}
		});
		var result = cmd1.toCommandline();
		result.should.be.exactly('publish channel {"action":"myaction"}');
	});
});
