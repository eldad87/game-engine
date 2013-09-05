
bson = require('bson/browser_build/bson');
io = require('socket.io');
Entity = require('./../core/Entity');

//http://www.joezimjs.com/javascript/plugging-into-socket-io-advanced/
//http://stackoverflow.com/questions/8467784/sending-a-message-to-a-client-via-its-socket-id
var SocketNetworkDriver = Entity.extend({
	_classId: 'SocketNetworkDriver',
    _messageTypes: {},

	init: function() {
		Entity.prototype.init.call(this);

		if(engine.isServer) {
			var NetworkServer = require('./Network/NetworkServer');
            this.implement(NetworkServer, true);
		}

		if(!engine.isServer) {
			var NetworkClient = require('./Network/NetworkClient');
            this.implement(NetworkClient, true);
		}


	},

    defineMessageType: function(name, callback) {
        this._messageTypes[name] = callback;
        return this;
    },

    callDefinedMessage: function(name, params) {
        if(undefined == this._messageTypes[name]) {
            throw new Exception('Socket: undefined message type is used')
        }

        this._messageTypes[name](params);
    },

    _serialize: function(data) {
        var BSON = bson().BSON;
        return BSON.serialize(message, false, true, false);
    },

    _deserialize: function(sData) {
        var BSON = bson().BSON;
        return BSON.deserialize(smessage);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = SocketNetworkDriver; }