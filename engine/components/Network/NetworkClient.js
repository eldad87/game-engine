var io = require('socket.io');
var NetworkClient = Entity.extend( {
    _classId: 'NetworkClient',
    _messageTypes: {},
    _pendingCallback: {},
    _socket: null,

    connect: function(address) {
        this._socket = io.connect(address);

        var self = this;
        this._socket.on('connect', function(){
            self._socket.on('message', self._onMessage);
            self._socket.on('disconnect', self.onDisconnect);
        });
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

        var sMessage = this._serialize(smessage);
        this._socket.send(sMessage);

        return this;
    },

    onMessage: function(message) {
        //Server response
        if(true == message.is_callback) {
            if( ! message.id ||
                ! this._pendingCallback ||
                ! this._pendingCallback[message.id]) {

                //Call callback
                var response = this._pendingCallback[message.id](message.data, message.id);
                //Send response to client
                this._sendMessage({
                        id: message.id,
                        data: response,
                        is_callback: true
                    });

                //Remove callback
                delete this._pendingCallback[message.id];

                return this;
            }
        }

        //Server request
        try {
            this.callDefinedMessage(message.type, {message: message});
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

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = NetworkClient; }