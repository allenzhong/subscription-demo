var should = require('should')

var Client = require('../lib/client.js');
var PubsubServer = require('../lib/server.js');

describe('Client', function() {
	var server = new PubsubServer();
	// var client;
	before(function() {
		server.start();
	});

	it('Should subscribe normally', function(done) {
		var client = new Client('localhost', 9000);
		client.createConnection(function(res) {
			res.channel.should.be.exactly('test');
			res.body.indexOf('successfully').should.be.not.eql(-1);
			client.disconnect();
			done();
		});
		client.subscribe("test");
	});

	it('Should publish normally', function(done) {
		var client = new Client('localhost', 9000);
		client.createConnection(function(res) {
			//once client subscribe successed, publish to this channel
			if (res.command == 'subscribe') {
				var client1 = new Client('localhost', 9000);
				client1.createConnection(function(res1) {
					//waiting for published message
					res1.command.should.be.exactly('publish');
					res1.channel.should.be.exactly('test');
					res1.body.indexOf('successfully').should.be.not.eql(-1);
					client1.disconnect();
					done();
				});
				client1.publish('test', {
					action: 'myaction',
					body: 'hello'
				});
			}
		});
		client.subscribe("test");
	});

	after(function() {
		server.stop();
	});
});
