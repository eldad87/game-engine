define(['engine/core/Base', 'engine/core/Point'], function (Base, Point) {
    var Entity = Base.extend({
        _classId: 'Entity',
        _syncSections: [],
        _geometry: null,

        init: function(options)
        {
            this.geometry(0, 0, 0);
            this.syncSections(['translation']);
            Base.prototype.init.call(this, options);
        },

        geometry: function (x, y, z) {
            if (x !== undefined && y !== undefined && z !== undefined) {
                this._geometry = new Point(x, y, z);
                return this;
            }

            return this._geometry;
        },

        /**
         * Set / Get sync data
         * @param data - data to sync, if undefined - return data
         */
        sync: function(data)
        {
            //return sync data
            if(undefined === data) {
                return {translation: [this._geometry.x, this._geometry.y, this._geometry.z]};
                /*return Base.prototype.init.sync(this, data, deltaSyncOnly)['translation'] = syncData;*/
            }

            if(undefined !== data['translation']) {
                //Handle translation
                this.geometry.apply(this, data['translation']);

                //Delete
                delete data['translation'];
            }

            /*//Pass to parent
            Base.prototype.init.sync(this, data, deltaSyncOnly);*/
        },

        /**
         * Set / Get syc
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
        },

        /**
         * Add sync section
         * @param section
         * @returns {*}
         */
        addSyncSections: function(section) {
            this._syncSections.push(section);
            return this;
        }
    });

    return Entity;
});