/*Core = require('./engine/Core');
NetworkServer = require('./engine/components/Network/NetworkServer');*/
//PhysicsSimulation = require('./engine/components/PhysicsSimulation');

require = require('requirejs');
require(['engine/core/Class', 'engine/Core', 'engine/components/Network/NetworkServer'], function(Class, Core, NetworkServer) {
    var Server = Class.extend({
        _classId: 'Server',

        init: function () {
            this.log('start', 'log');


            /*engine
                .getRegisteredClassNewInstance('PhysicsSimulation')
                .attach(engine, true)
                    .start();*/


            engine
                .getRegisteredClassNewInstance('NetworkServer')
                .attach(engine, 'network')
                .listen(4040)
                .defineMessageType('hey', function(data) {
                    engine.log('hey called: ' + JSON.stringify(data));

                    engine.log('Sending call');
                    engine.network.sendMessage('call', {eldad: 'yamin'}, data.socketId, function(data) {
                        engine.log('call - reponse data: ' + JSON.stringify(data));
                    });
                });
        }
    });

    new Core().start(function(){
        new Server();
    });
});






//Listen for connections

//On connection, create unit and buind to connection

//Send updates

//Get inputs