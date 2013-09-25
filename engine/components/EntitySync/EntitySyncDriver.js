define(['engine/core/Base', 'engine/components/EntitySync/EntitySyncServer', 'engine/components/EntitySync/EntitySyncClient'],
    function   (Base, EntitySyncServer, EntitySyncClient) {

    var EntitySyncDriver = Base.extend({
        _classId: 'EntitySyncDriver',
        _forceComponentAccessor: 'sync',

        _start: false,
        _networkDriver: false,

        init: function(options) {
            Base.prototype.init.call(this);

            if(undefined !== options) {
                if(undefined !== options.networkDriver) {
                    this.networkDriver(options.networkDriver);
                }
            }

            if(engine.isServer) {
                this.implement(EntitySyncServer, true);
            }

            if(!engine.isServer) {
                this.implement(EntitySyncClient, true);
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