define(['engine/core/Base', 'engine/core/Point'], function (Base, Point) {
    var Entity = Base.extend({
        _classId: 'Entity',
        _syncSections: [],
        _position: null,
        _rotation: null,

        init: function(options)
        {
            this.position(0, 0, 0);
            this.rotation(0, 0, 0);

            this.syncSections(['position', 'rotation']);
            Base.prototype.init.call(this, options);
        },

        /**
         * Set the position of an entity
         *
         * @param x
         * @param y
         * @param z
         * @returns {*}
         */
        position: function (x, y, z) {

            if (x !== undefined && y !== undefined && z !== undefined) {
                this._position = new Point(x, y, z);
                return this;
            }

            return this._position;
        },


        /**
         * Set the rotation of an entity
         *
         * @param x
         * @param y
         * @param z
         * @returns {*}
         */
        rotation: function (x, y, z) {

            if (x !== undefined && y !== undefined && z !== undefined) {
                this._rotation = new Point(x, y, z);
                return this;
            }

            return this._rotation;
        },

        /**
         * Set / Get sync data
         * @param data - data to sync, if undefined - return data
         */
        sync: function(data)
        {
            //return sync data
            if(undefined === data) {
                return {position: [this._position.x, this._position.y, this._position.z], rotation: [this._rotation.x, this._rotation.y, this._rotation.z]};
                /*return Base.prototype.init.sync(this, data, deltaSyncOnly)['translation'] = syncData;*/
            }

            if(undefined !== data['position']) {
                this.position(data['position'][0], data['position'][1], data['position'][2]);
                delete data['position'];
            }
            if(undefined !== data['rotation']) {
                this.rotation(data['rotation'][0], data['rotation'][1], data['rotation'][2]);
                delete data['rotation'];
            }
            /*//Pass to parent
            Base.prototype.init.sync(this, data, deltaSyncOnly);*/
        },

        /**
         * Set / Get sync sections
         *  Each sections will be later synced & interpolate individually
         *
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
         * Add a sync section
         *
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