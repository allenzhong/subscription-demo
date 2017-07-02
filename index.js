var argv = require('minimist')(process.argv.slice(2));
var help = '\nUSAGE: node index.js [--tcp <ARG>] [--http <ARG>]\n '
						+ '        --tcp <ARG> specify tcp port\n'
						+ '         --http <ARG> specify http port\n';
						+ '         --help       show help\n';


//interpret arguments of command line
var tcpPort,httpPort;
if(typeof argv.help !== 'undefined') {
	console.log(help);
	return;
}
if(typeof argv.tcp !== 'undefined') tcpPort = argv.tcp;
if(typeof argv.http !== 'undefined') httpPort = argv.http;

var PubsubServer = require('./lib/server.js');
var server = new PubsubServer(tcpPort,httpPort);
// start server
server.start();
