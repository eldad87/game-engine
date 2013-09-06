//http://www.joezimjs.com/javascript/plugging-into-socket-io-advanced/
//http://stackoverflow.com/questions/8467784/sending-a-message-to-a-client-via-its-socket-id
define(['engine/core/Entity', 'engine/core/Exception', 'bson'], function(Entity, Exception, bson) {
    var SocketNetworkDriver = Entity.extend({
        _classId: 'SocketNetworkDriver',
        _messageTypes: {},

        defineMessageType: function(name, callback) {
            this._messageTypes[name] = callback;
            return this;
        },

        callDefinedMessage: function(name, params) {
            if(undefined == this._messageTypes[name]) {
                throw new Exception('Socket: undefined message type is used')
            }

            return this._messageTypes[name](params);
        },

        _serialize: function(data) {
            /*console.log(bson);
            var BSON = bson().BSON;
            return BSON.serialize(message, false, true, false);*/

            return JSON.stringify(data);
        },

        _deserialize: function(smessage) {
            /*var BSON = bson().BSON;
            return BSON.deserialize(smessage);*/

            return JSON.parse(smessage, true);
        }
    });

//  if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = SocketNetworkDriver; }
    return SocketNetworkDriver;
});