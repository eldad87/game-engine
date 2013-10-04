define(['engine/core/Base'], function(Base) {
    var EntitySyncBase = Base.extend({
        _classId: 'EntitySyncBase',
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

    return EntitySyncBase;
});
