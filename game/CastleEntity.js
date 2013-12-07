define(['engine/core/Entity', 'ThreeRenderableCastleEntity'], function (Entity, ThreeRenderableCastleEntity) {
    var CastleEntity = Entity.extend({
        _classId: 'CastleEntity',

        init: function(options)
        {
            console.log('Castle:init');
            Entity.prototype.init.call(this, options);

            //Give this entity a look
            if(!engine.isServer) {
                var bs = new ThreeRenderableCastleEntity();
                bs.attach(this, 'threeRenderable');

                engine.addObjectToGroup(this, 'army');
            }

        }
    });

    return CastleEntity;
});