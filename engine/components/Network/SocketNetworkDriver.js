//http://www.joezimjs.com/javascript/plugging-into-socket-io-advanced/
//http://stackoverflow.com/questions/8467784/sending-a-message-to-a-client-via-its-socket-id
define(['engine/core/Base', 'engine/core/Exception', 'engine/components/Network/NetworkServer', 'engine/components/Network/NetworkClient'/*, 'moment', 'bson'*/],
    function(Base, Exception, NetworkServer, NetworkClient, Moment/*, bson*/) {

    var SocketNetworkDriver = Base.extend({
        _classId: 'SocketNetworkDriver',
        _forceComponentAccessor: 'network',

        _messageTypes: {},
        _pingPongTimeSyncInterval: 0,

        init: function(options) {
            Base.prototype.init.call(this);

            if(engine.isServer) {
                this.implement(NetworkServer);
            }

            if(!engine.isServer) {
                this.implement(NetworkClient);
            }

            if(options != undefined && options.pingPongTimeSyncInterval != undefined) {
                this._pingPongTimeSyncInterval = options.pingPongTimeSyncInterval;
            }

            this.defineMessageType('ping', this.ping.bind(this));
        },

        /**
         * Start ping-pong base time sync
         * @returns {*}
         */
        startPingPongTimeSync: function() {
            var self = this;
            if(!this._pingPongTimeSyncTimer) {
                this._pingPongTimeSyncTimer = setInterval(function () { self.startPingPongTimeSync(); }, this._pingPongTimeSyncInterval);
            }

            this.sendMessage('ping', {sent_timestamp: Date.now()}, this.pong.bind(this));

            return this;
        },

        stopPingPongTimeSync: function() {
            clearInterval(this._pingPongTimeSyncTimer);
        },

        /**
         * Return exact message that received to sender + processed
         */
        ping: function(data, sent_uptime) {
            var processTime = Date.now();
            //this.log('Ping received, process time: ' +  processTime);

            return {
                sent_timestamp:         data.sent_timestamp,
                processed_timestamp:    processTime,
                processed_uptime:       engine.getUptime()
            };
        },

        /**
         * Callback of sent ping request
         */
        pong: function(data, sentUptime, messageId, socketId) {
            var curTime = Date.now();

            var roundTrip = (curTime - data.sent_timestamp);
            var latency = (data.sent_timestamp - data.processed_timestamp);

            //Check if clocks are out of sync
            if(latency > roundTrip) {
                latency = roundTrip/2;
            }


            if(!engine.isServer && !this._clockSynced) {
                var uptime = engine.getUptime();

                //Determine the server uptime (received uptime + time it took the message to arrive)
                var serverUptime = data.processed_uptime + ( (roundTrip - latency) );

                //Get diff in uptime
                var uptimeDiff = serverUptime - uptime;

                //Apply diff
                //console.log('Off by: ' + uptimeDiff);
                engine.incrementUptimeBy(uptimeDiff);

                this._clockSynced = true;
            }


            this.latency(latency, socketId);
            this.roundTrip(roundTrip, socketId);
        },

        //message.type, message.data, message.sent_uptime, message.id, socket.id
        defineMessageType: function(name, callback) {
            this._messageTypes[name] = callback;
            return this;
        },

        callDefinedMessage: function(name, data, sentUptime, messageId, socketId) {
            if(undefined == name || undefined == this._messageTypes[name]) {
                throw new Exception('Socket: undefined message type is used')
            }

            return this._messageTypes[name](data, sentUptime, messageId, socketId);
        },

        _serialize: function(message) {
            /*if(engine.isServer) {
                return bson.BSONPure.BSON.serialize(message, false, true, false);
            }

            if(!engine.isServer) {
                return bson.BSON.serialize(message, false, true, false);
            }*/

            return JSON.stringify(message);
        },

        _deserialize: function(smessage) {
           /* if(engine.isServer) {
                return bson.BSONPure.BSON.deserialize(smessage);
            }

            if(!engine.isServer) {
                return bson.BSON.deserialize(smessage);
            }*/

            return JSON.parse(smessage, true);
        },

        destroy: function() {
            Base.prototype.destroy.call(this);
            this.stopPingPongTimeSync();
        }
    });

//  if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = SocketNetworkDriver; }
    return SocketNetworkDriver;
});