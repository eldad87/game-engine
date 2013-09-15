define(['engine/core/Entity', 'engine/components/EntitySync/EntitySyncServer', 'engine/components/Network/EntitySyncClient'],
    function   ( Entity, EntitySyncServer, EntitySyncClient) {

    var EntitySyncDriver = Entity.extend({
        _classId: 'EntitySyncDriver',

        _start: false,
        _processMinLatency: 0,
        _networkDriver: false,

        init: function(options) {
            Entity.prototype.init.call(this);

            if(undefined === options) {

                if(undefined !== options.networkDriver) {
                    this.networkDriver(options.networkDriver);
                }

                if(undefined !== options.processMinLatency) {
                    this.processMinLatency(options.processMinLatency);
                }
            }

            if(engine.isServer) {
                this.implement(EntitySyncServer);
            }

            if(!engine.isServer) {
                this.implement(EntitySyncClient);
            }
        },

        /**
         * Set network driver
         * @param val
         * @returns {*}
         */
        networkDriver: function(val) {
            if(undefined === val) {
                return this._networkDriver;
            }

            this._networkDriver = val;

            return this;
        },

        /**
         * Set the minimum 'age' of a input before processing it.
         *  for example val=100, only when inputs will be 100ms old - they will be process
         * @param val
         * @returns {*}
         */
        processMinLatency: function(val) {
            if(undefined === val) {
                return this._processMinLatency;
            }

            this._processMinLatency = val;

            return this;
        }
    });

    return EntitySyncDriver;
});