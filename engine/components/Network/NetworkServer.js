var io = require('socket.io');
var NetworkServer = Entity.extend({
    _classId: 'NetworkServer',

	_clientSockets: {},
    _io: io,

    _addClient: function(socket) {
        this._clientSockets[socket.id] = {
            socket: socket,
            pendingCallback: {}
        };
    },

    _removeClient: function(socket) {
        delete this._clientSockets[socket.id];
    },


    _onMessage: function(socket, smessage) {
        var message = this._deserialize(smessage);
        return this.onMessage(socket, message);
    },

    _sendMessage: function(message, socketId, callback) {
        //check if callback is neded
        if(undefined != callback) {
            message['callback_pending'] = true;
            this._clientSockets[socketId]['pendingCallback'][message.id] = callback;
        }

        var sMessage = this._serialize(message);
        this._clientSockets[socketId].socket.send(sMessage);

        return this;
    },

    listen: function(port) {
        var self = this;

        this.io.listen(port);

        this.io.sockets.on('connection', function(socket){
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

        socket.on('message', function(message, callback){
            self._onMessage(socket, message, callback);
        });
    },


    onDisconnect: function(socket) {
        this._removeClient(socket);
    },

    onMessage: function(socket, message) {
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
            var response = this._clientSockets[socket.id]['pendingCallback'][message.id](message.data, socket.id, message.id);
            //Send response to client
            this._sendMessage({
                    id: message.id,
                    data: response,
                    is_callback: true
                }
                , socket.id);

            //Remove callback
            delete this._clientSockets[socket.id]['pendingCallback'][message.id];

            return this;
        }

        //Client request
        if(undefined == this._messageTypes[name]) {
            this.log('Invalid message type; socket: [' + socket.id +'], message: [' + JSON.stringify(message) + ']');
            return false;
        }

        try {
            this.callDefinedMessage(message.type, {message: message, socketId: socket.id});
        } catch (Exc) {
            this.log(Exc.message + '; socket: [' + socket.id +'], message: [' + JSON.stringify(message) + ']');
        }

        return this;
    },

    /**
     * Send message to given socketIds
     * @param type - on of the defineMessageType
     * @param data - data to send to sockets
     * @param socketIds - undefined|array|string undefined - all clients, array list of sockets, string - a single client
     * @param callback - run this callback on each client response
     * @returns string - message ID
     */
    sendMessage: function(type, data, socketIds, callback) {
        //Prepare message
        var message = {
            id: UUID.v4(),
            type: type,
            data: data
        };

        //Broadcast to all
        if(!socketIds) {
            for(var socketId in this._clientSockets) {
                this._sendMessage(message, socketId, callback);
            }
        }

        //Send to spesific clients
        if(socketIds instanceof Array) {
            for(var i in clientIds) {
                this._sendMessage(message, socketIds[i], callback);
            }
        }

        //Send to 1 client
        this._sendMessage(message, socketIds, callback);

        return message.id;
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = NetworkServer; }