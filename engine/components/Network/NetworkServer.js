define([ 'socket.io', 'node-uuid'], function(io, UUID) {
    var NetworkServer = {
        _classId: 'NetworkServer',

        _clientSockets: {},
        _io: io,
        _sockets: null,

        _addClient: function(socket) {
            this._clientSockets[socket.id] = {
                socket: socket,
                pendingCallback: {}
            };
        },

        _removeClient: function(socket) {
            delete this._clientSockets[socket.id];
        },


        _onMessage: function(smessage, socket) {
            var message = this._deserialize(smessage);
            return this.onMessage(message, socket);
        },

        _sendMessage: function(message, callback, socketId) {
            //check if callback is neded
            if(undefined != callback) {
                message['callback_pending'] = true;
                this._clientSockets[socketId]['pendingCallback'][message.id] = callback;
            }

            var sMessage = this._serialize(message);
            this._clientSockets[socketId].socket.send(sMessage);

            return this;
        },

        /**
         * Get/Set latency
         * @param val
         * @param socketId
         * @returns this|latency in MS
         */
        latency: function(val, socketId) {
            if(undefined === socketId) {
                socketId = val;
                val = undefined;
            }

            if(undefined === val) {
                return this._clientSockets[socketId]['latency'] || 0;
            }

            this._clientSockets[socketId]['latency'] = val;

            return this;
        },

        /**
         * Get/Set round trip
         * @param val
         * @param socketId
         * @returns this|round trip in MS
         */
        roundTrip: function(val, socketId) {
            if(undefined === socketId) {
                socketId = val;
                val = undefined;
            }

            if(undefined === val) {
                return this._clientSockets[socketId]['roundTrip'] || 0;
            }

            this._clientSockets[socketId]['roundTrip'] = val;

            return this;
        },

        listen: function(port) {
            var self = this;

            this._sockets = this._io.listen(port);

            this._sockets.on('connection', function(socket){
                    self.onConnection(socket);
                });

            return this;
        },

        onConnection: function(socket) {
            var self = this;
            this._addClient(socket);

            socket.on('disconnect', function(){
                self.onDisconnect(socket);
            });

            socket.on('message', function(message){
                self._onMessage(message, socket);
            });
        },


        onDisconnect: function(socket) {
            this._removeClient(socket);
        },

        /**
         *
         * @param socket {id}
         * @param message {id, type, data, is_callback || callback_pending}
         * @returns {*}
         */
        onMessage: function(message, socket) {
            //Client response
            if(true == message.is_callback) {
                if( ! message.id ||
                    ! this._clientSockets[socket.id] ||
                    ! this._clientSockets[socket.id]['pendingCallback'] ||
                    ! this._clientSockets[socket.id]['pendingCallback'][message.id]) {

                    this.log('Invalid callback; socket: [' + socket.id +'], message: [' + JSON.stringify(message) + ']');
                    return false; //Invalid callback
                }

                //Call callback
                this._clientSockets[socket.id]['pendingCallback'][message.id](message.data, message.sent_uptime/*, message.processed_uptime*/, message.id, socket.id);

                //Remove callback
                delete this._clientSockets[socket.id]['pendingCallback'][message.id];

                return this;
            }

            //Client request
            if(undefined == this._messageTypes[message.type]) {
                this.log('Invalid message type; socket: [' + socket.id +'], message: [' + JSON.stringify(message) + ']');
                return false;
            }

            try {
                //var processedUptime = engine.getUptime();
                var response = this.callDefinedMessage(message.type, message.data, message.sent_uptime, message.id, socket.id);

                if(true === message.callback_pending) {
                    //Send response to client
                    this._sendMessage({
                            id: message.id,
                            data: response,
                            sent_uptime: message.sent_uptime,
                            //processed_uptime: processedUptime,
                            is_callback: true
                        },
                        undefined
                        , socket.id);
                }
            } catch (Exc) {
                this.log(Exc.message + '; socket: [' + socket.id +'], message: [' + JSON.stringify(message) + ']');
            }

            return this;
        },

        /**
         * Send message to given socketIds
         * @param type - on of the defineMessageType
         * @param data - data to send to sockets
         * @param callback - run this callback on each client response
         * @param socketIds - undefined|array|string undefined - all clients, array list of sockets, string - a single client
         * @returns string - message ID
         */
        sendMessage: function(type, data, callback, socketIds) {
            //Prepare message
            var message = {
                id: UUID.v4(),
                type: type,
                data: data,
                sent_uptime: engine.getUptime()
            };

            //Broadcast to all
            if(!socketIds) {
                for(var socketId in this._clientSockets) {
                    this._sendMessage(message, callback, socketId);
                }
            }

            //Send to spesific clients
            if(socketIds instanceof Array) {
                for(var i in clientIds) {
                    this._sendMessage(message, callback, socketIds[i]);
                }
            }

            //Send to 1 client
            this._sendMessage(message, callback, socketIds);

            return message.id;
        }
    };

//    if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = NetworkServer; }

    return NetworkServer;
});