define(['engine/core/Entity', 'engine/components/Render/ThreeBaseRenderable'], function (Entity, ThreeBaseRenderable) {
    var DummyEntity = Entity.extend({
        _classId: 'DummyEntity',

        init: function(options)
        {
            console.log('DummyEntity:init');
            Entity.prototype.init.call(this, options);

            this.addSyncSections('dummySection');
            //Entity.prototype.syncSections.call(this, ['translation', 'dummySection']);

            //Give this entity a look
            if(!engine.isServer) {
                var threeRenderable = new ThreeBaseRenderable({geometryName: 'aviaryGeo', material: 'Lambert', textureName: 'aviaryText'});
                threeRenderable.attach(this, 'threeRenderable');
            }

        },

        sync: function(data, deltaSyncOnly)
        {
            //console.log('DummyEntity:sync I');

            if(undefined === data) {

                var syncData = Entity.prototype.sync.call(this, data, deltaSyncOnly);
                syncData['dummySection'] = [1,2,3];

                return syncData;
            }

            if(undefined !== data['dummySection']) {
                //Handle dummySection


                delete data['dummySection'];
            }

        }
    });

    return DummyEntity;
});