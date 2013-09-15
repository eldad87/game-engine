define(['engine/core/Entity', 'engine/core/Point'], function (Entity, Point) {
    var PlayerEntity = Entity.extend({
        _classId: 'PlayerEntity',

        init: function(options)
        {
            Entity.prototype.init.call(this, options);
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

        sync: function(section, data, deltaSyncOnly)
        {

        },

        syncSections: function(sections, data)
        {
            if(id == undefined) {
                if(!this._id) {
                    //Generate a new ID
                    this._id = UUID.v4();
                }

                return this._id;
            }

            return this;
        }
    });

    return PlayerEntity;
});