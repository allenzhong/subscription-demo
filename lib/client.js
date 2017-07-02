var net = require('net'),
	util = require('util'),
	events = require('events'),
	command = require('./command.js'),
	Message = require('./message.js');

var CommandName = command.CommandName;

/**
 * Client class
 * For connecting to server in order to send and receive message when subscribed.
 * @module Client
 */
function Client(host, port, options) {
	this.host = host;
	this.port = port;
	this.registerEvents();
}

/**
 * Register Events for client
 */
Client.prototype.registerEvents = function() {
	//handle response that is from server
	this.on('subscribed', this.subscribed);
	this.on('published', this.published);
	this.on('unsubscribed',this.unsubscribed);
	this.on('listed',this.listed);
	this.on('errors', this.handleError);
}

/**
 * Start connection
 */
Client.prototype.createConnection = function(callback) {
	this.callback = callback;
	this.client = net.Socket();
	this.client.connect(this.port, this.host, () => {
		//when connected
	});

	this.client.on('data', (res) => {
		var data;
		try{
			var str = res.toString('utf8');
			data = JSON.parse(res.toString('utf8'));
			var message = new Message(data);
		}catch(err){
			this.emit('errors',"error message: " + err.message);
			return;
		}

		if(typeof message.command === 'undefined') this.emit('errors',message);

		switch (message.command) {
			case CommandName.SUBSCRIBE:
				this.emit('subscribed',message,this.callback);
				break;
			case CommandName.UNSUBSCRIBE:
				this.emit('unsubscribed',message,this.callback);
				break;
			case CommandName.PUBLISH:
				this.emit('published',message,this.callback);
				break;
			case CommandName.LIST:
				this.emit('listed',message, this.callback);
				break;
			default:
				this.emit('errors',message, this.errorCallback);
				break;
		}

	});

	this.client.on('close', () => {
		//when connection is closing
		// console.log('disconnected');
	});
}
/**
 * Disconnect
 */
Client.prototype.disconnect = function () {
	this.client.destroy();
};
/**
 * Subscribe a channel
 */
Client.prototype.subscribe = function(channel, callback) {
	var cmd = new command.Command(command.CommandName.SUBSCRIBE,{channel:channel});
	if(typeof callback === 'function') this.callback = callback;
	this.client.write(cmd.toCommandline());
}

/**
 * Unsubscribe a channel
 */
Client.prototype.unsubscribe = function(channel, callback) {
	var cmd = new command.Command(command.CommandName.UNSUBSCRIBE,{channel:channel});
	if(typeof callback === 'function') this.callback = callback;
	this.client.write(cmd.toCommandline());
}

/**
 * Publish message to a channel
 */
Client.prototype.publish = function(channel, message, callback) {
	var cmd = new command.Command(command.CommandName.PUBLISH,{channel:channel,message:message});
	if(typeof callback === 'function') this.callback = callback;
	this.client.write(cmd.toCommandline());
}

/**
 * List channels
 */
Client.prototype.list = function(channel, message, callback) {
	var cmd = new command.Command(command.CommandName.LIST);
	if(typeof callback === 'function') this.callback= callback;
	this.client.write(cmd.toCommandline());
}

/**
 * Set error callback before start connection
 */
Client.prototype.errorCallback = function(callback){
	if(typeof callback === 'function') this.errorCallback = callback;
}

/**
 * invoke callback for Subscribe command
 */
Client.prototype.subscribed = function(message,callback) {
	if(typeof callback === 'function') callback(message);
}

/**
 * invoke callback after unsubscribed
 * the callback is same as Subscribe's
 */
Client.prototype.unsubscribed = function(message,callback) {
	if(typeof callback === 'function') callback(message);
}

/**
 * invoke after published
 */
Client.prototype.published = function(message,callback){
	if(typeof callback === 'function') callback(message);
}

/**
 * Invoke after list
 */
Client.prototype.listed = function(message,callback){
	if(typeof callback === 'function') callback(message);
}

/**
 * Invoke when error happened
 */
Client.prototype.handleError = function(message, callback){
	if(typeof callback === 'function') callback(message);
}

util.inherits(Client, events.EventEmitter);
module.exports = Client;
