define(['engine/core/Entity', 'ThreeRenderableBlacksmithEntity'], function (Entity, ThreeRenderableBlacksmithEntity) {
    var BlacksmithEntity = Entity.extend({
        _classId: 'BlacksmithEntity',

        init: function(options)
        {
            console.log('Blacksmit:init');
            Entity.prototype.init.call(this, options);

            //Give this entity a look
            if(!engine.isServer) {
                var bs = new ThreeRenderableBlacksmithEntity();
                bs.attach(this, 'threeRenderable');

                engine.addObjectToGroup(this, 'army');
            }

        }
    });

    return BlacksmithEntity;
});