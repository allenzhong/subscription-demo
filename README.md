# subscription-demo
Implementation of pub-sub system from scratch by using Node

# Server

1. Listening on port 9000 with TCP, sending and receive message with Socket

2. Starting HTTP Server(Using the third-party module Restify) as publisher, which can receive post requests from clients. URL should follow the URL like ’/ publish/:channel’ and post message as request’s body. This request could trigger the publish event in server.

3. Server can maintain clients list and channels list in order to keep on communicating with client.

4. Traditionally҆if some one would like to use telnet as client, the following command could be available 
    * subscribe: subscribe a channel

    * unsubscribe: unsubscribe a channel

    * publish: publish a message on specify channel

    * listҔlist all channels on server

5. Once client connected with server, client could send command to server. When command is received by server, it have to be validated. If valid, command can emit the event that is already registered on server. If invalid, error handler can be trigger and then return error message to client.

6. The following list include all event registered on server side:

    * subscribeҔ checking channels list, if current channel can be found, client can join this channel, otherwise new channel should be created.ҕ

    * unsubscribeҔ ﬁnding the client related to specify channel, then drop it.

    * publishҔchecking all clients that currently bind to specify channel, then send message to them one by one.

    * listҔreturn all channels list.
