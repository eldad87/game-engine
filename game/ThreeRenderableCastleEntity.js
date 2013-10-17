define(['ThreeBaseRenderable'], function (ThreeBaseRenderable) {
    var ThreeRenderableBlacksmithEntity = ThreeBaseRenderable.extend({
        _classId: 'ThreeRenderableBlacksmithEntity',

        init: function(options)
        {
            if(undefined === options) {
                options = [];
            }

            //Load mesh
            //options.meshName = 'castleMesh';
            //options.textureName = 'castleTextBlank';
            //options.textureName = false;

            options.autoMeshCreation = false;
            this._mesh = engine.threeLoader.getSea('h_castle');
            ThreeBaseRenderable.prototype.init.call(this, options);
            //Scale
//            this.mesh().scale.set(128, 128, 128);
        }
    });

    return ThreeRenderableBlacksmithEntity;
});