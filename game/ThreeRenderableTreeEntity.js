define(['ThreeSeaBaseRenderable', 'THREE'], function (ThreeSeaBaseRenderable, THREE) {
    var ThreeRenderableTreeEntity = ThreeSeaBaseRenderable.extend({
        _classId: 'ThreeRenderableTreeEntity',

        init: function(options)
        {
            if(undefined === options) {
                options = [];
            }

            options.autoMeshCreation = false;
            this._mesh = engine.threeLoader.getSea('h_tree_001');

            ThreeSeaBaseRenderable.prototype.init.call(this, options);
        }
    });

    return ThreeRenderableTreeEntity;
});