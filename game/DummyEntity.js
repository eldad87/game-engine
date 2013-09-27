define(['engine/core/Entity', 'engine/components/Render/ThreeBaseRenderable'], function (Entity, ThreeBaseRenderable) {
    var DummyEntity = Entity.extend({
        _classId: 'DummyEntity',

        init: function(options)
        {
            console.log('DummyEntity:init');
            Entity.prototype.init.call(this, options);

            this.addSyncSections('dummySection');
            //Entity.prototype.syncSections.call(this, ['translation', 'dummySection']);

            //Give this entity a look
            if(!engine.isServer) {
                var threeRenderable = new ThreeBaseRenderable({meshName: 'aviaryMesh', textureName: 'aviaryText'});
                threeRenderable.attach(this, 'threeRenderable');

                //Define animation
                this.threeRenderable.defineAnimation('produce', 15, 10000, 0);
                this.threeRenderable.playAnimation('produce');

                //Scale
                this.threeRenderable.mesh().scale.set(30,30,30);



                this.particleGroup = new ShaderParticleGroup({
                    texture: engine.threeLoader.getTexture('smoke_001'),
                    maxAge: 2,
                    blending: THREE.NormalBlending
                });

                var emitter = new ShaderParticleEmitter({
                    type: 'cube',
                    position: new THREE.Vector3( -0.24, 0.215, 0.06 ),
                    positionSpread   : new THREE.Vector3( 0.04, 0, 0.04 ),

                    acceleration: new THREE.Vector3( 0, 0, 0 ),
                    accelerationSpread: new THREE.Vector3( 0, 0, 0 ),

                    velocity:  new THREE.Vector3(0.05, 0.1, 0.05),
                    velocitySpread:  new THREE.Vector3(0, 0.1, 0),

                    //colorSpread: new THREE.Vector3(1, 1, 1),
                    colorStart: new THREE.Color('lightgrey'),
                    colorEnd: new THREE.Color('sandybrown'),
                    size: 15,
                    sizeEnd: 12,

                    particlesPerSecond: 10
                });


                this.particleGroup.addEmitter( emitter );
                this.threeRenderable.mesh().add( this.particleGroup.mesh );

                console.log('Total particles: ' + emitter.numParticles);
            }

        },

        process: function() {
            Entity.prototype.process.call(this);

            if(!engine.isServer) {

                this.particleGroup.tick( engine.deltaUptime() );

            }

            //Engine processing goes here
            return true;
        },

        sync: function(data, deltaSyncOnly)
        {
            //console.log('DummyEntity:sync I');

            if(undefined === data) {

                var syncData = Entity.prototype.sync.call(this, data, deltaSyncOnly);
                syncData['dummySection'] = [1,2,3];

                return syncData;
            }

            if(undefined !== data['dummySection']) {
                //Handle dummySection


                delete data['dummySection'];
            }

        }
    });

    return DummyEntity;
});