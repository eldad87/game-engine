//Connect to server

//Listen for messages

//Set messages

window.onload = function() 
{
    requirejs.config({
        paths: {
            'socket.io' : './node_modules/socket.io/node_modules/socket.io-client/dist/socket.io',
            'node-uuid' : './node_modules/node-uuid/uuid',
            'moment'    : './lib/moment'
            //'bson' : './node_modules/bson/browser_build/bson'
        },
        shim: {
            'lib/three.js/build/three': {
                'exports': 'THREE'
            },
            'lib/three.js/examples/js/Detector': {
                'exports': 'Detector'
            },
            'lib/underscore/underscore': {
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
                'engine/components/EntitySync/EntitySyncDriver', 'engine/components/Render/Three',
                'engine/core/Point', 'lib/three.js/build/three',  'game/DummyEntity'],
        function(Class, Core, SocketNetworkDriver, EntitySyncDriver, Three, Point, threejs, DummyEntity) {

        var Client = Class.extend({
            _classId: 'Client',

            init: function () {
                this.log('start', 'log');

                //Networking
                /*engine
                    .getRegisteredClassNewInstance('SocketNetworkDriver', {pingPongTimeSyncInterval: 1000})
                    .attach(engine, 'network')
                    .connect('//localhost:4040')*/
                    /*.defineMessageType('welcome', function(data) {
                        console.log('Welcom received: ' + JSON.stringify(data))
                        return data;
                    })*/;
                /*setInterval(function() {
                    //Send message
                    engine.network.sendMessage('greeting', {dummy:'data'});
                }, 5000);*/


                //Sync
                /*engine
                    .getRegisteredClassNewInstance('EntitySyncDriver', {networkDriver: engine.network})
                    .processMinLatency(100) //Client only
                    .attach(engine, 'sync')
                    .start();*/


                //Render
                engine
                    .getRegisteredClassNewInstance('Three', {width: window.innerWidth,
                                                            height: window.innerHeight,
                                                            'appendToElement': document.getElementById('renderer')})
                    .addCamera('mainCamera', 'Perspective', 45, window.innerWidth / window.innerHeight, 0.1, 10000, new Point(0, 0, 300) , true)
                    .addPointLight('mainPointLight' ,'0xFFFFFF', new Point(10, 50, 130))
                    .attach(engine, 'renderer')
                    .start(true);

                //On window change, change the renderer width/height
                window.onresize = function() {
                    engine.renderer.getRenderer().setSize(window.innerWidth,  window.innerHeight);
                    engine.renderer.getCamera('mainCamera').aspect = window.innerWidth / window.innerHeight;
                    engine.renderer.getCamera('mainCamera').updateProjectionMatrix();
                }

                var sphereMaterial =
                    new threejs.MeshLambertMaterial(
                        {
                            color: 0xCC0000
                        });

                var sphere = new threejs.Mesh(

                    new threejs.SphereGeometry(
                        50,
                        16,
                        16),

                    sphereMaterial);

                engine.renderer.addToScene(sphere);





                //Ask server to createDummyEntity
                //engine.network.sendMessage('createDummyEntity', {});
            }
        });

        new Core().start(
            new Client()
        );
    });
}