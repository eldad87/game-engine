define(['engine/core/Entity', 'ThreeRenderableSoliderEntity'], function (Entity, ThreeRenderableSoliderEntity) {
    var SoliderEntity = Entity.extend({
        _classId: 'SoliderEntity',

        init: function(options)
        {
            console.log('Solider:init');
            Entity.prototype.init.call(this, options);

            //Give this entity a look
            if(!engine.isServer) {
                var ta = new ThreeRenderableSoliderEntity();
                ta.attach(this, 'threeRenderable');
            }

        }
    });

    return SoliderEntity;
});