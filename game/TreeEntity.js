define(['engine/core/Entity', 'ThreeRenderableTreeEntity'], function (Entity, ThreeRenderableTreeEntity) {
    var TreeEntity = Entity.extend({
        _classId: 'TreeEntity',

        init: function(options)
        {
            console.log('Tree:init');
            Entity.prototype.init.call(this, options);

            //Give this entity a look
            if(!engine.isServer) {
                var ta = new ThreeRenderableTreeEntity();
                ta.attach(this, 'threeRenderable');
            }

        }
    });

    return TreeEntity;
});