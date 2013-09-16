define(['engine/core/Entity', 'engine/components/EntitySync/EntitySyncServer', 'engine/components/EntitySync/EntitySyncClient'],
    function   ( Entity, EntitySyncServer, EntitySyncClient) {

    var EntitySyncDriver = Entity.extend({
        _classId: 'EntitySyncDriver',

        _start: false,
        _networkDriver: false,

        init: function(options) {
            Entity.prototype.init.call(this);

            if(undefined !== options) {
                if(undefined !== options.networkDriver) {
                    this.networkDriver(options.networkDriver);
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
        }
    });

    return EntitySyncDriver;
});