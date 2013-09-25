//Connect to server

//Listen for messages

//Set messages

window.onload = function() 
{
    requirejs.config({
        paths: {
            'socket.io' : './node_modules/socket.io/node_modules/socket.io-client/dist/socket.io',
            'node-uuid' : './node_modules/node-uuid/uuid',
            'underscore' : './node_modules/underscore/underscore',
            'moment'    : './lib/moment'
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
                'engine/core/Point', 'lib/three.js/build/three',  'game/DummyEntity'],
        function(Class, Core, SocketNetworkDriver, EntitySyncDriver, ThreeIsomatric, ThreeLoader, Point, THREE, DummyEntity) {

        var Client = Class.extend({
            _classId: 'Client',

            init: function () {
                this.log('start', 'log');

                var self = this;
                engine.getRegisteredClassNewInstance('ThreeLoader')
                    .attach(engine, 'threeLoader')
                    .setOnProgressCallback(function(loaded, total){
                        if(loaded == total) {
                            /*console.log('WooHoo!! let\'s rock! [' + loaded + '/' + total + ']');

                            var mesh = this.createMesh( 'townHallGeo', 'Lambert', 'townHallText', false);
                            mesh.position.set(0,0,0);
                            //mesh.scale.set( 3, 3, 3 );
                            //mesh.overdraw = true;
                            engine.renderer.addToScene( mesh );*/

                            console.log('All assets been loaded [' + total + ']');
                            self._init();
                        } else {
                            console.log('Loaded [' + loaded + '/' + total + '] assets');
                        }
                    })
                    .loadGeometry('townHallGeo', './game/assets/human/town_hall/h_town_hall.js')
                    .loadTexture('townHallText', './game/assets/human/town_hall/h_town_hall.jpg');
            },

            _init: function() {

                //Render
                engine
                    .getRegisteredClassNewInstance('ThreeIsometric', {
                        debug: true,
                        width: window.innerWidth,
                        height: window.innerHeight,
                        appendToElement: document.getElementById('renderer'),
                        camera: {
                            viewAngle: 27,
                            aspect: window.innerWidth / window.innerHeight,
                            near: 0.1,
                            far: 10000,
                            position: new Point(25, 25, 0),
                            lookAt:  new Point(0, 0, 0)
                        },
                        light: {
                            color: 0xffeedd,
                            position: new Point(100, 60, 30)
                        }
                    })
                    .attach(engine, 'threeRenderer')
                    .start(true);

                //Set resize event handler
                window.onresize = function() {
                    engine.renderer.onResize(window.innerWidth,  window.innerHeight);
                }

                //new DummyEntity();


                //Networking
                engine
                 .getRegisteredClassNewInstance('SocketNetworkDriver', {pingPongTimeSyncInterval: 1000})
                 .attach(engine, 'network')
                 .connect('//localhost:4040')
                /*.defineMessageType('welcome', function(data) {
                 console.log('Welcom received: ' + JSON.stringify(data))
                 return data;
                 })*/;
                /*setInterval(function() {
                 //Send message
                 engine.network.sendMessage('greeting', {dummy:'data'});
                 }, 5000);*/


                //Sync
                engine
                 .getRegisteredClassNewInstance('EntitySyncDriver', {networkDriver: engine.network})
                 .processMinLatency(100) //Client only
                 .attach(engine, 'sync')
                 .start();


                //Ask server to createDummyEntity
                engine.network.sendMessage('createDummyEntity', {});
            }
        });

        new Core().start(
            new Client()
        );
    });
}