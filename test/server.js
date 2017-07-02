var should = require('should')
var net = require('net');
var restify = require('restify');
var PubsubServer = require('../lib/server.js');

describe('PubsubServer', function() {
	var server = new PubsubServer();

	before(function() {
		//start server
		server.start();
	});

	describe('Should response commands expectedly', function() {
		it('subscribe should be successful', function(done) {
			var client = net.Socket();
			client.connect(9000, 'localhost', function() {
				client.write('subscribe test');
			});
			client.on('data', function(data) {
				var response = data.toString();
				var index = response.indexOf('successful');
				(index).should.not.be.eql(-1);
				client.end();
				done();
			});
			client.on('close', function() {});
		});

		it('publish should be successful', function(done) {
			var client = net.Socket();
			client.connect(9000, 'localhost', function() {
				client.write('subscribe test1');
				client.write('publish test1 hello');
			});
			client.on('data', function(data) {
				var response = data.toString();
				if (response.indexOf('publish') == -1) {
					var index = response.indexOf('hello');
					(index).should.not.be.eql(-1);
				}
				client.destroy();
				done();
			});
			client.on('close', function() {});
		});

		it('list should be successful', function(done) {
			var client = net.Socket();
			client.connect(9000, 'localhost', function() {
				client.write('subscribe test1');
				client.write('subscribe test2');
				client.write('list')
			});
			client.on('data', function(data) {
				var response = data.toString();
				if (response.indexOf('list') != -1) {

					var index = response.indexOf('test1');
					(index).should.not.be.eql(-1);

					index = response.indexOf('test2');
					(index).should.not.be.eql(-1);
				}
				client.destroy();
				done();
			});
			client.on('close', function() {});
		});


		it('unsubscribe should be successful', function(done) {
			var client = net.Socket();
			client.connect(9000, 'localhost', function() {
				client.write('subscribe test')
				client.write('unsubscribe test');
			});

			client.on('data', function(data) {
				var response = data.toString();
				if (response.indexOf('unsubscribe') != -1) {
					var index = response.indexOf('successful');
					(index).should.not.be.eql(-1);
				}
				client.destroy();
				done();
			});
			client.on('close', function() {});
		});

		it('list should be successful', function(done) {
			var client = net.Socket();
			client.connect(9000, 'localhost', function() {
				client.write('unknowcommand')
			});
			client.on('data', function(data) {
				var response = data.toString();
				var index = response.indexOf('unknow');
				(index).should.not.be.eql(-1);
				client.destroy();
				done();
			});
			client.on('close', function() {});
		});

		describe('Restify server ', function() {
			var client = net.Socket();
			var subscriber = net.Socket();
			var restClient = restify.createJsonClient({
				url: 'http://localhost:9080'
			});

			before(function() {
				//create channel
				client.connect(9000, 'localhost', function() {
					client.write('subscribe test1');
				});
				client.on('data', function(data) {});
				client.on('close', function() {});
			});

			it('send and receive message successfully', function(done) {
				subscriber.connect(9000, 'localhost', function() {
					subscriber.write('subscribe test1', function(data) {

						restClient.post('/publish/test1', {
							action: 'email',
							body: 'hello'
						}, function(err, req, res, obj) {});
					});
				});

				subscriber.on('data', function(data) {
					var index = data.indexOf('hello');
					if (index > -1) {
						index.should.not.be.eql(-1);
						done();
					}
				});
			});

			after(function() {
				client.destroy();
				subscriber.destroy();
			})
		});
	});

	// describe('Should');
	after(function() {
		server.stop();
	});
});
