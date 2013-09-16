/*Core = require('./engine/Core');
NetworkServer = require('./engine/components/Network/NetworkServer');*/
//PhysicsSimulation = require('./engine/components/PhysicsSimulation');

requirejs = require('requirejs');

requirejs.config({
    paths: {
        'moment'    : './lib/moment'
    }
});

requirejs(['engine/core/Class', 'engine/Core', 'engine/components/Network/SocketNetworkDriver', 'engine/components/EntitySync/EntitySyncDriver'],
    function(Class, Core, SocketNetworkDriver, EntitySyncDriver) {

    var Server = Class.extend({
        _classId: 'Server',

        init: function () {
            this.log('start', 'log');


            /*engine
                .getRegisteredClassNewInstance('PhysicsSimulation')
                .attach(engine, true)
                    .start();*/
            engine.isServer = true;

            //Networking
            engine
                .getRegisteredClassNewInstance('SocketNetworkDriver')
                .attach(engine, 'network')
                .listen(4040)
                .defineMessageType('greeting', function(data, sentUptime, messageId, socketId) {
                    engine.log('greeting called: ' + JSON.stringify(data));
                    engine.log('Sending welcome');
                    engine.network.sendMessage('welcome', {dummy: 'data2'}, function(data) {
                        engine.log('welcome - response data: ' + JSON.stringify(data));
                    }, socketId);
                });

            //Sync
            engine
                .getRegisteredClassNewInstance('EntitySyncDriver', {networkDriver: engine.network})
                //.processMinLatency(100) - Client only
                .attach(engine, 'sync')
                .start()
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