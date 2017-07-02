exports.CommandName = {
	PUBLISH: 'publish',
	SUBSCRIBE: 'subscribe',
	UNSUBSCRIBE: 'unsubscribe',
	LIST: 'list'
}
const COMMAND_LIST = ['publish','subscribe','unsubscribe','list'];

/**
 * Command class
 * a command should be called in server
 */
function Command(name, options){
	if(this.validate(name)){
		this.name = name;
		if(typeof options !== 'undefined' && typeof options.channel !== 'undefined')
			this.channel = options.channel;
		if(typeof options !== 'undefined' && typeof options.message !== 'undefined')
			this.message = options.message;
	}

	if(typeof options === 'undefined'){
		this.parse(name);
	}
}

/**
 * validate command
 */
Command.prototype.validate = function (command) {
	var result = COMMAND_LIST.indexOf(command) !== -1;
	this.valid = result;
	return result;
};

/**
 * Parse command
 */
Command.prototype.parse = function (commandString) {
	// body...
	var args = commandString.split(/\s+/);
	switch(args.length){
		case 0:
			this.error = "unknow command"
			break;
		case 1:
			this.name = args[0];
			break;
		case 2:
			this.name = args[0];
			this.channel = args[1];
			break;
		default:
			this.name = args[0],
			this.channel = args[1],
			this.message = commandString.substr(commandString.indexOf(args[2])).trim()
	}
};

/**
 * Parse option
 */
Command.prototype.parseOptions = function (options) {
	// body...
	if (typeof options === 'undefined') return;
	var args = options.split(/\s+/);
	switch(args.length){
		case 0:
			break;
		case 1:
			this.channel = args[0];
			break;
		default:
			this.channel = args[0],
			this.message = options.substr(options.indexOf(args[1])).trim()
	}
}
/**
 * Convert object to a string that can be excute for server
 */
Command.prototype.toCommandline = function(){
	var cmds = [this.name, this.channel, JSON.stringify(this.message)];
	return cmds.join(' ');
}

// /**
//  * Parse text message to Message object
//  *
//  */
// Command.prototype.parseMessage = function(text){
// 	if(typeof text === 'object')
// 		return text;
// 	if(typeof text === 'string')
// 		return new Message({
// 			body: text
// 		})
// }

exports.Command = Command;
