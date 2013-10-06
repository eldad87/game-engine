define(['ThreeBaseRenderable'], function (ThreeBaseRenderable) {
    var ThreeRenderableBlacksmithEntity = ThreeBaseRenderable.extend({
        _classId: 'ThreeRenderableBlacksmithEntity',

        init: function(options)
        {
            if(undefined === options) {
                options = [];
            }

            //Load mesh
            options.meshName = 'blacksmithMesh';
            options.textureName = 'blacksmithText';
            ThreeBaseRenderable.prototype.init.call(this, options);
            //Scale
            this.mesh().scale.set(128, 128, 128);
        }
    });

    return ThreeRenderableBlacksmithEntity;
});