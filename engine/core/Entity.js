define(['engine/core/Base', 'engine/core/Point'], function (Base, Point) {
    var Entity = Base.extend({
        _classId: 'Entity',
        _syncSections: [],

        init: function(options)
        {
            Base.prototype.init.call(this, options);
            Base.prototype.syncSections.call(this, ['translation']);
        },

        size3d: function (x, y, z) {
            if (x !== undefined && y !== undefined && z !== undefined) {
                this._geometry = new IgePoint(x, y, z);
                return this;
            }

            return this._geometry;
        },

        wolrdPos: function()
        {

        },

        /**
         *
         * @param data - data to sync, if undefined - return data
         * @param deltaSyncOnly - true: return only the changes from last sync, false: return all
         */
        sync: function(data, deltaSyncOnly)
        {
            //return sync data
            if(undefined === data) {
                var syncData = {};
                if(deltaSyncOnly) {
                    //Only delta
                } else {
                    //All data
                }

                return Base.prototype.init.sync(this, data, deltaSyncOnly)['translation'] = syncData;
            }

            if(undefined !== data['translation']) {
                //Handle translation

                //Delete
                delete data['translation'];
            }

            //Pass to parent
            Base.prototype.init.sync(this, data, deltaSyncOnly);
        },

        /**
         * @param sections
         * @returns {*}
         */
        syncSections: function(sections)
        {
            if(undefined === sections) {
                return this._syncSections;
            }

            this._syncSections = sections

            return this;
        }
    });

    return Entity;
});