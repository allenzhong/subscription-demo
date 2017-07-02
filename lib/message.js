/**
 * Message class for client
 * @module Message
 */
function Message(options) {

	if (typeof options === 'object' && typeof options.channel !== 'undefined') {
		this.channel = options.channel;
	}

	if (typeof options === 'object' && typeof options.command !== 'undefined') {
		this.command = options.command;
	}

	if (typeof options === 'object' && typeof options.action !== 'undefined') {
		this.action = options.action;
	}

	if (typeof options === 'object' && typeof options.body !== 'undefined') {
		this.body = options.body;
	}

	if (typeof options === 'string')
		this.body = options

}

/**
 * Format to json string
 */
Message.prototype.toJsonString = function () {
	var json = this.toJSON();
	return JSON.stringify(this.toJSON());
}

/**
 * To json
 */
Message.prototype.toJSON = function () {
	var json = {};
	if (typeof this.command !== 'undefined')
		json['command'] = this.command;
	if (typeof this.channel !== 'undefined')
		json['channel'] = this.channel;
	if (typeof this.action !== 'undefined')
		json['action'] = this.action;
	if (typeof this.body !== 'undefined')
		json['body'] = this.body;

	return json;
}


module.exports = Message;
