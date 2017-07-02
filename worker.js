var Client = require('./lib/client.js');

var client = new Client('localhost', 9000);

client.errorCallback(function(err) {
	console.log("error" + JSON.stringify(err));
});

client.createConnection(function(res) {
	console.log(JSON.stringify(res));
	if (res.command == 'publish') {
		job(res.action, res.body);
	}else if(res.command == 'list'){
		console.log(res.body);
	}
});
// subscribe test channel
client.subscribe('test');

//excute jobs by name and send message
function job(name, message) {
	switch (name) {
		case 'doJob1':
			doJob1(message);
			break;
		case 'doJob2':
			doJob2(message);
			break;
		case 'doJob3':
			doJob3(message);
			break;
		case 'doJob4':
			doJob4(message);
			break;
		case 'doJob5':
			doJob5(message);
			break;
		case 'unsubscribe':
			client.unsubscribe("test");
			break;
		case 'list':
			client.list();
			break;
		default:
			console.log('no matched job');
	}
}

function doJob1(message) {
	console.log("do job1 with message: " + message);
	console.log("Sending email.............");
}

function doJob2(message) {
	console.log("do job2 with message: " + message);
	console.log("Testing system.............");
}

function doJob3(message) {
	console.log("do job3 with message: " + message);
	console.log("Run ci system.............");

}

function doJob4(message) {
	console.log("do job4 with message: " + message);
	console.log("Restart system.............");

}

function doJob5(message) {
	console.log("do job5 with message: " + message);
	console.log("shut down system.............");

}
