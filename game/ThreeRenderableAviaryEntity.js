define(['ThreeSeaBaseRenderable', 'THREE', 'ShaderParticleEmitter', 'ShaderParticleGroup'], function (ThreeSeaBaseRenderable, THREE) {
    var ThreeRenderableAviaryEntity = ThreeSeaBaseRenderable.extend({
        _classId: 'ThreeRenderableAviaryEntity',

        init: function(options)
        {
            if(undefined === options) {
                options = [];
            }

            options.autoMeshCreation = false;
            this._mesh = engine.threeLoader.getSea('h_aviary_main');

            //this._mesh.play("idle");

            ThreeSeaBaseRenderable.prototype.init.call(this, options);
            //Load mesh
            /*options.meshName = 'aviaryMesh';
            options.textureName = 'aviaryText';
             ThreeSeaBaseRenderable.prototype.init.call(this, options);

            //Define animation
            this.defineAnimation('produce', 0, 15, 10000);*/



            //TODO: build a wrapper
            //Set particle
            this.particleGroup = new ShaderParticleGroup({
                texture: engine.threeLoader.getTexture('smoke_001'),
                maxAge: 1.5,
                blending: THREE.NormalBlending
            });

            var emitter = new ShaderParticleEmitter({
                type: 'cube',
                position: new THREE.Vector3( -0.24, 0.2, 0.06 ),
                positionSpread: new THREE.Vector3( 0.04, 0, 0.04 ),

                acceleration: new THREE.Vector3( 0, 0.1, 0 ),
                accelerationSpread: new THREE.Vector3( 0, 0, 0 ),

                velocity:  new THREE.Vector3(0.05, 0.1, 0.05),
                velocitySpread:  new THREE.Vector3(0, 0.1, 0),
                
                colorStart: new THREE.Color('lightgrey'),
                colorEnd: new THREE.Color('sandybrown'),
                size: 40,
                sizeEnd: 120,

                particlesPerSecond: 10
            });


            this.particleGroup.addEmitter( emitter );
            this.mesh().add( this.particleGroup.mesh );
        },

        process: function() {
            ThreeSeaBaseRenderable.prototype.process.call(this);

            if('produce' === this.playAnimation()) {
                this.particleGroup.tick( engine.deltaUptime() );
            }

            return true;
        }

    });

    return ThreeRenderableAviaryEntity;
});