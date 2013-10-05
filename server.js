requirejs = require('requirejs');

requirejs.config({
    paths: {
        'moment'                            : './lib/moment',
        'Eventable'                         : './engine/core/eventable',
        "ThreeRenderableAviaryEntity"       : "empty",
        "ThreeRenderableBlacksmithEntity"   : "empty"
    }
});
requirejs(['engine/core/Class', 'engine/Core', 'engine/components/Network/NetworkServer', 'engine/components/EntitySync/EntitySyncServer', 'game/AviaryEntity'],
    function(Class, Core, NetworkServer, EntitySyncServer, AviaryEntity) {

    var Server = Class.extend({
        _classId: 'Server',

        init: function () {
            this.log('start', 'log');

            engine.isServer = true;

            //Networking
            engine
                .getRegisteredClassNewInstance('NetworkServer')
                .attach(engine, 'network')
                .listen(4040)
                .defineMessageType('greeting', function(data, sentUptime, messageId, socketId) {
                    engine.log('greeting called: ' + JSON.stringify(data));
                    engine.log('Sending welcome');
                    engine.network.sendMessage('welcome', {dummy: 'data2'}, function(data) {
                        engine.log('welcome - response data: ' + JSON.stringify(data));
                    }, socketId);
                });

            //Define creation of a new entity
            engine.network.defineMessageType('createAviaryEntity', function(/*data, sentUptime, messageId, socketId*/) {
                engine.getRegisteredClassNewInstance('AviaryEntity')
            });

            //Sync
            engine
                .getRegisteredClassNewInstance('EntitySyncServer', {networkDriver: engine.network})
                //.processMinLatency(100) - Client only
                .attach(engine, 'sync')
                .start();
        }
    });

    new Core().start(function(){
        new Server();
    });
});

/**
 greeting called: {deummy:data}
 Sending welcome
 welcome - response data: {deummy:data2}
 */






//Listen for connections

//On connection, create unit and buind to connection

//Send updates

//Get inputs