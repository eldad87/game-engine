define(['ThreeSeaBaseRenderable', 'THREE', 'ShaderParticleEmitter', 'ShaderParticleGroup'], function (ThreeSeaBaseRenderable, THREE) {
    var ThreeRenderableSoliderEntity = ThreeSeaBaseRenderable.extend({
        _classId: 'ThreeRenderableSoliderEntity',

        init: function(options)
        {
            if(undefined === options) {
                options = [];
            }

            options.autoMeshCreation = false;
            this._mesh = engine.threeLoader.getSea('Player');
            this._mesh.scale.set(0.5, 0.5, 0.5);

            ThreeSeaBaseRenderable.prototype.init.call(this, options);
        },

        process: function() {
            ThreeSeaBaseRenderable.prototype.process.call(this);

            if('production' === this.playAnimation()) {
                this.particleGroup.tick( engine.deltaUptime() );
            }

            return true;
        }

    });

    return ThreeRenderableSoliderEntity;
});