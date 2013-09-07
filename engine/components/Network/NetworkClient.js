define(['engine/components/Network/SocketNetworkDriver', 'socket.io', 'node-uuid'], function   (SocketNetworkDriver, io, UUID) {
    var NetworkClient = SocketNetworkDriver.extend( {
        _classId: 'NetworkClient',
        _messageTypes: {},
        _pendingCallback: {},
        _socket: null,
        _io: io,

        init: function() {
            SocketNetworkDriver.prototype.init.call(this);
        },

        connect: function(address) {
            this._socket = io.connect(address);


            var self = this;
            this._socket.on('connect', function(socket){
                self._socket.on('message', self._onMessage.bind(self));
                self._socket.on('disconnect', self.onDisconnect.bind(self));
            });

            return this;
        },

        _onMessage: function(smessage) {
            var message = this._deserialize(smessage);
            return this.onMessage(message);
        },

        _sendMessage: function(message, callback) {
            //check if callback is needed
            if(undefined != callback) {
                message['callback_pending'] = true;
                this._pendingCallback[message.id] = callback;
            }

            var sMessage = this._serialize(message);
            this._socket.send(sMessage);

            return this;
        },

        /**
         *
         * @param message {id, type, data, is_callback || callback_pending}
         * @returns {*}
         */
        onMessage: function(message) {
            //Server response
            if(true == message.is_callback) {
                if( ! message.id ||
                    ! this._pendingCallback ||
                    ! this._pendingCallback[message.id]) {

                    //Call callback
                    this._pendingCallback[message.id](message.data, message.id);

                    //Remove callback
                    delete this._pendingCallback[message.id];

                    return this;
                }
            }

            //Server request
            try {
                var response = this.callDefinedMessage(message.type, {message: message});

                if(true === message.callback_pending) {
                    //Send response to client
                    this._sendMessage({
                        id: message.id,
                        data: response,
                        is_callback: true
                    });
                }
            } catch (Exc) {
                this.log(Exc.message + '; message: [' + JSON.stringify(message) + ']');
            }

            return this;
        },

        onDisconnect: function(message) {

        },

        sendMessage: function(type, data, callback) {
            //Prepare message
            var message = {
                id: UUID.v4(),
                type: type,
                data: data
            };

            this._sendMessage(message, callback);

            return message.id;
        }
    });

//    if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = NetworkClient; }
});