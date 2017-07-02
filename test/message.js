var should = require('should')
var Message = require('../lib/Message.js')

describe('Message',function(){
	it('Message should be create normally',function(done){
		var msg = new Message({
			channel : 'channel',
			action: 'publish',
			body: 'body'
		});
		msg.channel.should.be.exactly('channel');
		msg.action.should.be.exactly('publish');
		msg.body.should.be.exactly('body');
		done();
	});

	it('Message should export json format string normally',function(){
		var msg = new Message({
			channel : 'channel',
			action: 'publish',
			body: 'body'
		});
		var str = msg.toJsonString();
		var json = JSON.parse(str);
		json.channel.should.be.exactly('channel');
		json.action.should.be.exactly('publish');
		json.body.should.be.exactly('body');
	});
})
