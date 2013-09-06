/*Core = require('./engine/Core');
NetworkServer = require('./engine/components/Network/NetworkServer');*/
//PhysicsSimulation = require('./engine/components/PhysicsSimulation');

requirejs = require('requirejs');
requirejs(['engine/core/Class', 'engine/Core', 'engine/components/Network/NetworkServer'], function(Class, Core, NetworkServer) {

    var Server = Class.extend({
        _classId: 'Server',

        init: function () {
            this.log('start', 'log');


            /*engine
                .getRegisteredClassNewInstance('PhysicsSimulation')
                .attach(engine, true)
                    .start();*/
            engine.isServer = true;

            engine
                .getRegisteredClassNewInstance('NetworkServer')
                .attach(engine, 'network')
                .listen(4040)
                .defineMessageType('greeting', function(data) {
                    engine.log('greeting called: ' + JSON.stringify(data));
                    engine.log('Sending welcome');
                    engine.network.sendMessage('welcome', {dummy: 'data2'}, data.socketId, function(data) {
                        engine.log('welcome - response data: ' + JSON.stringify(data));
                    });
                });
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