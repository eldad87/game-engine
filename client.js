window.onload = function()
{
    requirejs.config({
        paths: {
            'socket.io'             : './node_modules/socket.io/node_modules/socket.io-client/dist/socket.io',
            'node-uuid'             : './node_modules/node-uuid/uuid',
            'underscore'            : './node_modules/underscore/underscore',
            'Eventable'             : './engine/core/eventable',
            'moment'                : './lib/moment',
            'THREE'                 : './lib/three.js/build/three',
            'ShaderParticleGroup'   : './lib/ShaderParticleEngine/src/ShaderParticleGroup',
            'ShaderParticleEmitter' : './lib/ShaderParticleEngine/src/ShaderParticleEmitter',
            //'bson' : './node_modules/bson/browser_build/bson'

            'ThreeBaseRenderable'               : './engine/components/Render/ThreeBaseRenderable',
            'ThreeRenderableAviaryEntity'       : './game/ThreeRenderableAviaryEntity',
           /* 'ThreeRenderableBlacksmithEntity'   : './game/ThreeRenderableBlacksmithEntity',*/
            'ThreeRenderableCastleEntity'       : './game/ThreeRenderableCastleEntity'
        },
        shim: {
            'THREE': {
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/loaders/OBJMTLLoader' :{
                deps: ['lib/three.js/build/three'],
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/loaders/OBJLoader' :{
                deps: ['lib/three.js/build/three'],
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/loaders/MTLLoader' :{
                deps: ['lib/three.js/build/three'],
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/Detector': {
                'exports': 'Detector'
            },
            'lib/three.js/examples/js/controls/OrbitControls': {
                deps: ['lib/three.js/build/three'],
                'exports': 'Detector'
            },
            'lib/three.js/examples/js/postprocessing/EffectComposer': {
                deps: ['lib/three.js/build/three', 'lib/three.js/examples/js/shaders/CopyShader'],
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/postprocessing/RenderPass': {
                deps: ['lib/three.js/build/three'],
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/postprocessing/ShaderPass': {
                deps: ['lib/three.js/build/three',],
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/shaders/CopyShader': {
                deps: ['lib/three.js/build/three'],
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/shaders/VignetteShader': {
                deps: ['lib/three.js/build/three'],
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/shaders/ColorCorrectionShader': {
                deps: ['lib/three.js/build/three'],
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/shaders/SSAOShader': {
                deps: ['lib/three.js/build/three'],
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/shaders/FXAAShader': {
                deps: ['lib/three.js/build/three'],
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/shaders/HorizontalTiltShiftShader': {
                deps: ['lib/three.js/build/three'],
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/shaders/VerticalTiltShiftShader': {
                deps: ['lib/three.js/build/three'],
                'exports': 'THREE'
            },
            'ShaderParticleEmitter': {
                deps: ['lib/three.js/build/three'],
                'exports': 'ShaderParticleEmitter'
            },
            'ShaderParticleGroup': {
                deps: ['lib/three.js/build/three', 'ShaderParticleEmitter'],
                'exports': 'ShaderParticleGroup'
            },
            'underscore': {
                'exports': '_'
            }
        }
    });


    requirejs([ 'engine/core/Class', 'engine/Core', 'engine/components/Network/NetworkClient',
                'engine/components/EntitySync/EntitySyncClient', 'engine/components/Render/ThreeIsometric',
                'engine/components/Render/ThreeLoader',
                'engine/core/Point',

                'THREE',
                './engine/components/Render/ThreeTileMap',
                './game/AviaryEntity',
                /*'./game/BlacksmithEntity',*/
                './game/CastleEntity'


                ],
        function(Class, Core, NetworkClient, EntitySyncClient, ThreeIsomatric, ThreeLoader, Point, THREE, ThreeTileMap, AviaryEntity, /*BlacksmithEntity,*/ CastleEntity) {

        var Client = Class.extend({
            _classId: 'Client',

            init: function () {
                this.log('start', 'log');

                engine.isServer = false;

                var self = this;
                engine.getRegisteredClassNewInstance('ThreeLoader')
                    .attach(engine, 'threeLoader')
                    .setOnProgressCallback(function(loaded, total, name){
                        if(loaded == total) {
                            console.log('All assets been loaded [' + total + '][' + name + ']');
                            self._init();
                        } else {
                            console.log('Loaded [' + loaded + '/' + total + '][' + name + '] assets');
                        }
                    })

                    //Aviary
                    .loadJS('aviaryMesh', './game/assets/human/buildings/h_aviary/h_aviary.js')
                    .loadTexture('aviaryText', './game/assets/human/buildings/h_aviary/h_aviary.jpg')

                    //castel
                    .loadJS('castleMesh', './game/assets/human/buildings/h_castle/h_castle.js')
                    .loadTexture('castleText', './game/assets/human/buildings/h_castle/h_castle.jpg')

                    .loadTexture('smoke_001', './game/assets/other/smoke_001.png')
                    .loadTexture('ground', './game/assets/ground/grass001.jpg')
                    .loadTexture('tilesetText', './game/assets/map/tilesets.jpg')
            },

            _init: function() {

                //Render
                engine
                    .getRegisteredClassNewInstance('ThreeIsometric', {
                        debug: true,
                        shadow: true,
                        width: window.innerWidth,
                        height: window.innerHeight,
                        appendToElement: document.getElementById('renderer'),
                        camera: {
                            viewAngle: 27,
                            aspect: window.innerWidth / window.innerHeight,
                            near: 0.1,
                            far: 10000,
                            position: new Point(1000, 1000, 0),
                            lookAt:  new Point(0, 0, 0)
                        },
                        light: {
                            color:  0xffffff,
                            position: new Point(100, 60, 30)
                        }
                    })
                    .attach(engine, 'threeRenderer')
//                    .setPlane(1000, 1000, 'ground') //Add plane
                    .start(true);

                //Set resize event handler
                window.onresize = function() {
                    engine.threeRenderer.onResize(window.innerWidth,  window.innerHeight);
                }


                //Load TMX tile map
                new ThreeTileMap({
                    size: new THREE.Vector2(32, 32), //Size
                    tileSize: new THREE.Vector2(256, 256),//Tile size
                    layerData: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 19, 20, 20, 20, 20, 21, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 27, 28, 28, 28, 28, 29, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 27, 28, 28, 28, 28, 29, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 27, 28, 28, 28, 28, 29, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 36, 36, 36, 28, 29, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 5, 5, 5, 5, 5, 5, 5, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 5, 5, 5, 5, 1, 1, 1, 5, 5, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 5, 5, 5, 5, 1, 1, 1, 5, 5, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 5, 5, 5, 5, 1, 1, 1, 5, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 35, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 37, 5, 5, 5, 5, 1, 1, 1, 5, 5, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 5, 5, 5, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 5, 7, 7, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 7, 7, 7, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 7, 7, 7, 7, 7, 7, 7, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 7, 2, 7, 7, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 5, 5, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 5, 5, 5, 4, 4, 4, 4, 4, 4, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 5, 5, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 4, 4, 4, 4, 4, 4, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 4, 4, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], //layerData
                    tileset: 'tilesetText'
                }).attach(engine);


                /*var bs = new BlacksmithEntity();
                bs.geometry(100, 0, 300);
                bs.attach(engine);*/

                var ce = new CastleEntity();
                ce.geometry(500, 0, 0);

                var ae = new AviaryEntity();
                var ae2 = new AviaryEntity();
                ae2.threeRenderable.playAnimation('produce');

                //Attach to de + down-scale
                ae2.attach(ae);
                ae2.threeRenderable.mesh().scale.set(128, 128, 128);
                ae2.threeRenderable.mesh().scale.set(1,1,1);

                //Attach back to engine
                ae2.geometry(128, 0, 128);
                ae2.attach(engine);

                //de.geometry(5,5,5);
                //de.geometry(1,1,1);
                //de.threeRenderable.mesh().position = new THREE.Vector3(0,0,2);
                //de.threeRenderable.mesh().lookAt(new THREE.Vector3(0,0,0));
                //de.threeRenderable.mesh().rotateY(30);



                //de.threeRenderable.mesh().translateX(-2);
                ///de.threeRenderable.mesh().rotation = new THREE.Vector3(0,20,20);
                //de.threeRenderable.mesh().rotation(THREE.Vector3(10,10,10));
                /*de.threeRenderable.mesh().translateX(100);
                de.threeRenderable.mesh().localToWorld(THREE.Vector3(10,10,10));*/
                //de.threeRenderable.mesh().updateMatrix(10);
                //de.threeRenderable.mesh().updateMatrixWorld(10);

                /*var xp = intersects[0].point.x.toFixed(2),
                yp = intersects[0].point.y.toFixed(2),
                zp = intersects[0].point.z.toFixed(2),
                destination = new THREE.Vector3( xp , yp , zp),

                radians =  Math.atan2( ( driller.position.x - xp) , (driller.position.z - zp));
                radians += 90 * (Math.PI / 180);

                var tween = new TWEEN.Tween(driller.rotation).to({ y : radians },200).easing(TWEEN.Easing.Linear.None).start();*/







                /*//Networking
                engine
                 .getRegisteredClassNewInstance('NetworkClient', {pingPongTimeSyncInterval: 1000})
                 .attach(engine, 'network')
                 .connect('//localhost:4040');

                //Sync
                engine
                 .getRegisteredClassNewInstance('EntitySyncClient', {networkDriver: engine.network})
                 .processMinLatency(100) //Client only
                 .attach(engine, 'sync')
                 .start();


                //Ask server to createAviaryEntity
                engine.network.sendMessage('createAviaryEntity', {});*/
            }
        });

        new Core().start(
            new Client()
        );
    });
}