define(['engine/core/Entity', 'ThreeRenderableAviaryEntity'], function (Entity, ThreeRenderableAviaryEntity) {
    var AviaryEntity = Entity.extend({
        _classId: 'AviaryEntity',

        init: function(options)
        {
            console.log('Aviary:init');
            Entity.prototype.init.call(this, options);

            this.addSyncSections('dummySection');
            //Entity.prototype.syncSections.call(this, ['translation', 'dummySection']);

            //Give this entity a look
            if(!engine.isServer) {
                var ta = new ThreeRenderableAviaryEntity();
                ta.attach(this, 'threeRenderable');
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

    return AviaryEntity;
});