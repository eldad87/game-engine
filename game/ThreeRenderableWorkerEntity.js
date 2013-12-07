define(['ThreeSeaBaseRenderable', 'THREE', 'ShaderParticleEmitter', 'ShaderParticleGroup'], function (ThreeSeaBaseRenderable, THREE) {
    var ThreeRenderableWorkerEntity = ThreeSeaBaseRenderable.extend({
        _classId: 'ThreeRenderableWorkerEntity',

        init: function(options)
        {
            if(undefined === options) {
                options = [];
            }

            options.autoMeshCreation = false;
            this._mesh = engine.threeLoader.getSea('worker');
            this._mesh.scale.set(0.5, 0.5, 0.5);

            ThreeSeaBaseRenderable.prototype.init.call(this, options);
        }
    });

    return ThreeRenderableWorkerEntity;
});