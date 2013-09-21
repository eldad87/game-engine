define(['engine/core/Entity'], function (Entity) {
    var DummyEntity = Entity.extend({
        _classId: 'DummyEntity',

        init: function(options)
        {
            console.log('DummyEntity:init');
            Entity.prototype.init.call(this, options);

            this.geometry(10, 10, 10);
            this.addSyncSections('dummySection');
            //Entity.prototype.syncSections.call(this, ['translation', 'dummySection']);
        },

        sync: function(data, deltaSyncOnly)
        {
            console.log('DummyEntity:sync I');

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