var net = require('net'),
	restify = require('restify'),
	url = require('url'),
	util = require('util'),
	events = require('events');
var command = require('./command.js');
var Message = require('./message.js');

const TCP_PORT = 9000;
const HTTP_PORT = 9080;

/**
 * Pub-sub server
 * @module PubsubServer
 */
function PubsubServer(socketPort, httpPort) {
	this.socketPort = socketPort || TCP_PORT;
	this.httpPort = httpPort || HTTP_PORT;
	this.channelList = [];
	this.clients = [];
	//register event
	this.registerEvents();
}

/**
 * Start PubsubServer on specify port
 */
PubsubServer.prototype.start = function () {
	this.startSocketServer();
	this.startHttpServer();
}

/**
 * Start tcp server
 */
PubsubServer.prototype.startSocketServer = function (port) {
	//create socket server
	this.socketServer = net.createServer();
	this.socketServer.on('connection', (socket) => {
		var socketId = Math.floor(Math.random() * 1000);
		socket.id = socketId;

		socket.on('data', (data) => {
			this.handle(socket, data.toString('utf8'));
		});

		socket.on('end', () => {
			//remove clients
			for (var i = 0; i < this.clients.length; i++) {
				var current = this.clients[i];
				if (socket.id == current.id) {
					this.clients.splice(i, 1);
					break;
				}
			}
			// console.log("server disconnected");
		});
	});

	//listening on the port
	this.socketServer.listen(this.socketPort, () => {
		console.log("TCP Server started on " + this.socketPort);
	});
};

/**
 * start http server
 */
PubsubServer.prototype.startHttpServer = function (port) {
	this.httpServer = new restify.createServer();
	this.httpServer.use(restify.acceptParser(this.httpServer.acceptable));
	this.httpServer.use(restify.queryParser());
	this.httpServer.use(restify.bodyParser({
		mapParams: true
	}));
	this.defineRoute(this.httpServer);
	this.httpServer.listen(this.httpPort, () => {
		console.log("HTTP Server started on " + this.httpPort);
	});
}

/**
 * Define a route for restify server
 *
 */
PubsubServer.prototype.defineRoute = function (server) {
	//define post route
	server.post('/publish/:channel', (req, res, next) => {
		var message = new Message(req.body);
		var cmd = new command.Command(command.CommandName.PUBLISH,{
			channel: req.params.channel,
			message: message
		})
		this.emit('publish', null, cmd);

		var sendMessage = new Message({
			body: "Message published"
		});

		res.json(sendMessage.toJSON());
		return;
	});
}

/**
 * stop server
 */
PubsubServer.prototype.stop = function () {
	this.socketServer.close();
	this.httpServer.close();
}

/**
 * register events
 *
 */
PubsubServer.prototype.registerEvents = function () {
	//register events: publish, subscribe, unsubscribe
	var events = ['publish', 'subscribe', 'unsubscribe', 'list', 'error'];
	for (var i = 0; i < events.length; i++) {
		var fn = this[events[i]];
		if (typeof fn === 'function') {
			this.on(events[i], fn);
		}
	}
}

/**
 * Handle the command and dispatch message
 */
PubsubServer.prototype.handle = function (socket, data) {
	var cmd = new command.Command(data);
	// console.log('Socket id: ' + socket.id);
	switch (cmd.name) {
		case 'publish':
			this.emit('publish', socket, cmd);
			break;
		case 'subscribe':
			this.emit('subscribe', socket, cmd);
			break;
		case 'unsubscribe':
			this.emit('unsubscribe', socket, cmd);
			break;
		case 'list':
			this.emit('list', socket, cmd);
			break;
		default:
			this.emit('error', socket, cmd);
	}
}

/**
 * subscribe a channel
 * Create a channel once it cannot be found in channel list
 */
PubsubServer.prototype.subscribe = function (socket, cmd) {
	//if it exists, add to channel user
	//else create it , push do channel list
	if (this.channelList.indexOf(cmd.channel) != -1) {
		//!!! channel users need be implemented later
	} else {
		this.channelList.push(cmd.channel);
	}

	this.clients.push({
		channel: cmd.channel,
		id: socket.id,
		socket: socket
	});
	var msg = new Message({
		channel: cmd.channel,
		command: cmd.name,
		body: 'Joined channel ' + cmd.channel + ' successfully'
	});

	this.responseToClient(socket, msg.toJsonString());
}

/**
 * unsubscribe
 * delete user from channel users list
 *
 */
PubsubServer.prototype.unsubscribe = function (socket, cmd) {
	console.log("unsubscribe channel " + cmd.channel);
	this.removeClient(cmd.Channel);

	var msg = new Message({
		command: cmd.name,
		channel: cmd.channel,
		body: 'unsubscribe ' + cmd.channel + ' successfully'
	})
	this.responseToClient(socket, msg.toJsonString());
}

/**
 * Publish a message to a channel
 * find a channel, then publish message to all subscriber
 */
PubsubServer.prototype.publish = function (socket, cmd) {

	try{
		if(typeof cmd.message === 'string')
			cmd.message = JSON.parse(cmd.message.trim());
	}catch(err){
		console.log("err " + err.message);
	}
	var clientSockets = this.findClients(cmd.channel);
	for (var i = 0; i < clientSockets.length; i++) {
		var client = clientSockets[i];

		var msg = new Message({
			command: cmd.name,
			channel: cmd.channel,
			action: cmd.message.action,
			body: cmd.message.body
		})
		// cmd.message.command = cmd.name;
		// cmd.message.channel = cmd.channel;

		// var msg = cmd.message;
		//resposne to socket client(worker)

		this.responseToClient(client, msg.toJsonString());

		// response message to http client
		var resMsg = new Message({
			command: cmd.name,
			channel: cmd.channel,
			body: "Published message on Channel " + cmd.channel + " successfully"
		})
		this.responseToClient(socket, resMsg.toJsonString());
	}
}

/**
 * List all channel
 *
 */
PubsubServer.prototype.list = function (socket, cmd) {
	// console.log("list");
	var response = 'channel list: \n'
	for (var i = 0; i < this.channelList.length; i++) {
		response += '(' + i + ') ' + this.channelList[i] + '\n';
	}
	var msg = new Message({
		command: cmd.name,
		body: response
	})
	this.responseToClient(socket, msg.toJsonString());
}

/**
 * Handle Error
 */
PubsubServer.prototype.error = function (socket, cmd) {
	// console.log("error command");
	var msg = new Message({
		body: 'unknow command'
	});
	this.responseToClient(socket, msg.toJsonString());
}


/**
 * find clients by channel
 */
PubsubServer.prototype.findClients = function (channel) {
	var result = [];
	//loop for finding client in list
	for (var i = 0; i < this.clients.length; i++) {
		var current = this.clients[i];
		if (channel == current.channel) {
			result.push(current.socket);
		}
	}
	return result;
}

/**
 * remove channel and socket
 */
PubsubServer.prototype.removeClient = function (channel) {
	//loop for finding client in list
	if(this.clients.length == 1){
		this.clients.pop();
		return;
	}
	for (var i = 0; i < this.clients.length; i++) {
		var current = this.clients[i];
		if (channel == current.channel) {
			this.clients.splice(i, 1);
			break;
		}
	}
}

/**
 * Handle response
 */
PubsubServer.prototype.responseToClient = function (socket, response) {
	if(typeof socket !== 'undefined' && socket != null){
		var str = response.toString('utf8');
		socket.write(response.toString('utf8'));
	}
}

util.inherits(PubsubServer, events.EventEmitter);
module.exports = PubsubServer;
