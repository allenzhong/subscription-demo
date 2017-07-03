# subscription-demo
Implementation of pub-sub system from scratch by using Node

# Server

1. Listening on port 9000 with TCP, sending and receive message with Socket

2. Starting HTTP Server(Using the third-party module Restify) as publisher, which can receive post requests from clients. URL should follow the URL like ’/ publish/:channel’ and post message as request’s body. This request could trigger the publish event in server.

3. Server can maintain clients list and channels list in order to keep on communicating with client.

4. Traditionally if some one would like to use telnet as client, the following command could be available 
    * subscribe: subscribe a channel

    * unsubscribe: unsubscribe a channel

    * publish: publish a message on specify channel

    * list: list all channels on server

5. Once client connected with server, client could send command to server. When command is received by server, it have to be validated. If valid, command can emit the event that is already registered on server. If invalid, error handler can be trigger and then return error message to client.

6. The following list include all event registered on server side:

    * subscribe: checking channels list, if current channel can be found, client can join this channel, otherwise new channel should be created.ҕ

    * unsubscribe: ﬁnding the client related to specify channel, then drop it.

    * publish: checking all clients that currently bind to specify channel, then send message to them one by one.

    * list: return all channels list.


# Client (Worker)

1. Connecting server with socket and maintaining the long-term connection

2. Client can develop a program that can waiting for message from Server.

3. Client should also apply event mechanism to handle return message and error messages.


# Client (REST Client)

1. Client such as PAW can send a message with URL like ‘http://localhost:9080/ publish/mychannel” and a JSON string as request body to server.

2. Client’s messages should include following attribute( currently supported):

    * action: this would trigger work’s task.

    * body: this contains some message that someone would like to send to worker.

# Instruction of System

## Install and Environment

To install all required modules, please type npm install under project directory.

# Start Server

1. To start server, `node index.js`

2. To find out help, `node index.js --help`

# Client

1. `node worker.js`
2. Test it with REST Client

