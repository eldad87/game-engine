define(['engine/core/Entity', 'ThreeRenderableWorkerEntity'], function (Entity, ThreeRenderableWorkerEntity) {
    var WorkerEntity = Entity.extend({
        _classId: 'WorkerEntity',

        init: function(options)
        {
            console.log('Solider:init');
            Entity.prototype.init.call(this, options);

            //Give this entity a look
            if(!engine.isServer) {
                var ta = new ThreeRenderableWorkerEntity();
                ta.attach(this, 'threeRenderable');

                engine.addObjectToGroup(this, 'army');
            }

        }
    });

    return WorkerEntity;
});