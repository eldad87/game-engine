//Connect to server

//Listen for messages

//Set messages

window.onload = function() 
{
    requirejs.config({
        paths: {
            'socket.io'         : './node_modules/socket.io/node_modules/socket.io-client/dist/socket.io',
            'node-uuid'             : './node_modules/node-uuid/uuid',
            'underscore'            : './node_modules/underscore/underscore',
            'moment'                : './lib/moment',
            'ShaderParticleGroup'   : './lib/ShaderParticleEngine/src/ShaderParticleGroup',
            'ShaderParticleEmitter' : './lib/ShaderParticleEngine/src/ShaderParticleEmitter'
            //'bson' : './node_modules/bson/browser_build/bson'
        },
        shim: {
            'lib/three.js/build/three': {
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

        /*,
        shim: {
            'bson': {
                exports: 'bson',
                init: function () {
                    return this.bson();
                }
            }
        }*/

    });

    requirejs(['engine/core/Class', 'engine/Core', 'engine/components/Network/SocketNetworkDriver',
                'engine/components/EntitySync/EntitySyncDriver', 'engine/components/Render/ThreeIsometric',
                'engine/components/Render/ThreeLoader',
                'engine/core/Point', 'lib/three.js/build/three', 'game/DummyEntity',
                'engine/components/Render/ThreeTileMap'],
        function(Class, Core, SocketNetworkDriver, EntitySyncDriver, ThreeIsomatric, ThreeLoader, Point, THREE, DummyEntity, ThreeTileMap) {

        var Client = Class.extend({
            _classId: 'Client',

            init: function () {
                this.log('start', 'log');

                var self = this;
                engine.getRegisteredClassNewInstance('ThreeLoader')
                    .attach(engine, 'threeLoader')
                    .setOnProgressCallback(function(loaded, total){
                        if(loaded == total) {
                            console.log('All assets been loaded [' + total + ']');
                            self._init();
                        } else {
                            console.log('Loaded [' + loaded + '/' + total + '] assets');
                        }
                    })
                    .loadTexture('tilesetText2', './game/assets/map/grass-tiles-2-small.png')
                    .loadTexture('tilesetText', './game/assets/map/grass_and_water.png')
                    .loadTexture('checkerboard', './game/assets/checkerboard.jpg')
                    .loadTexture('smoke_001', './game/assets/smoke_001.png')
                    .loadJS('horse', './game/assets/horse.js')
                    .loadJS('townHallMesh', './game/assets/human/town_hall/h_town_hall.js')
                    .loadTexture('townHallText', './game/assets/human/town_hall/h_town_hall.jpg')
                    .loadJS('aviaryMesh', './game/assets/human/h_aviary/h_aviary.js')
                    .loadTexture('aviaryText', './game/assets/human/h_aviary/h_aviary.jpg')
                    .loadTexture('ground', './game/assets/ground/grass001.jpg');
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
                            color: 0xffffff,
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

                var de = new DummyEntity();
                var de2 = new DummyEntity();
                de2.threeRenderable.playAnimation('produce');

                //Attach to de + down-scale
                de2.attach(de);
                de2.geometry(1, 1, 1);
                de2.threeRenderable.mesh().scale.set(1,1,1);

                //Attach back to engine
                de2.geometry(128, 0, 128);
                de2.threeRenderable.mesh().scale.set(128, 128, 128);
                de2.attach(engine);


                //Load TMX tile map
                var ttm = new ThreeTileMap({
                    size: new THREE.Vector2(20, 20), //Size
                    tileSize: new THREE.Vector2(32, 32),//Tile size
                    layerData: [13, 2, 1, 2, 1, 2, 1, 28, 9, 7, 8, 8, 20, 27, 1, 2, 1, 2, 1, 2, 1, 14, 13, 14, 13, 14, 14, 28, 21, 7, 10, 19, 7, 27, 13, 1, 1, 14, 13, 14, 1, 14, 1, 2, 1, 2, 14, 40, 21, 22, 8, 21, 7, 39, 2, 2, 1, 2, 16, 38, 13, 14, 11, 13, 14, 14, 13, 28, 22, 9, 8, 21, 9, 27, 13, 16, 38, 38, 18, 22, 1, 2, 23, 2, 1, 2, 1, 40, 9, 20, 8, 10, 7, 39, 16, 18, 20, 8, 20, 8, 13, 14, 13, 14, 13, 14, 14, 1, 6, 8, 10, 7, 20, 17, 18, 7, 19, 21, 10, 5, 1, 2, 1, 2, 1, 2, 16, 37, 18, 9, 22, 8, 19, 22, 21, 7, 21, 7, 5, 3, 13, 14, 13, 14, 16, 37, 18, 20, 19, 19, 8, 21, 19, 22, 19, 19, 5, 26, 3, 14, 1, 16, 37, 38, 18, 22, 21, 22, 7, 9, 22, 5, 6, 5, 26, 26, 2, 1, 1, 2, 38, 18, 7, 10, 7, 9, 19, 7, 21, 5, 26, 14, 4, 3, 14, 2, 14, 1, 13, 14, 20, 20, 7, 20, 8, 9, 5, 25, 26, 3, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 22, 20, 22, 5, 25, 26, 3, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 21, 9, 5, 3, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 11, 2, 25, 26, 3, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 23, 14, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 1, 2, 1, 2, 11, 2, 1, 2, 1, 2, 1, 2, 1, 11, 1, 2, 1, 2, 1, 2, 13, 14, 13, 14, 23, 14, 13, 14, 13, 14, 13, 14, 13, 23, 13, 14, 13, 14, 13, 14, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14], //layerData
                    tileset: 'tilesetText2'
                }).attach(engine);
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
                 .getRegisteredClassNewInstance('SocketNetworkDriver', {pingPongTimeSyncInterval: 1000})
                 .attach(engine, 'network')
                 .connect('//localhost:4040');

                //Sync
                engine
                 .getRegisteredClassNewInstance('EntitySyncDriver', {networkDriver: engine.network})
                 .processMinLatency(100) //Client only
                 .attach(engine, 'sync')
                 .start();


                //Ask server to createDummyEntity
                engine.network.sendMessage('createDummyEntity', {});*/
            }
        });

        new Core().start(
            new Client()
        );
    });
}