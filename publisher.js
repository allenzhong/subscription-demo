var Client = require('./lib/client.js');

var client = new Client('localhost', 9000);

client.errorCallback(function (err) {
	console.log("error" + err);
});

client.createConnection(function (res) {
	console.log('After published, received Message: ' + res.body);
});

client.publish('test', {
	action: 'myaction',
	body: 'hello'
});
