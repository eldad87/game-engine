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
        }/*,
        shim: {
            'bson': {
                exports: 'bson',
                init: function () {
                    return this.bson();
                }
            }
        }*/

    });

    requirejs(['engine/core/Class', 'engine/Core', 'engine/components/Network/SocketNetworkDriver', 'engine/components/EntitySync/EntitySyncDriver'],
        function(Class, Core, SocketNetworkDriver, EntitySyncDriver) {

        var Client = Class.extend({
            _classId: 'Client',

            init: function () {
                this.log('start', 'log');

                //Networking
                engine
                    .getRegisteredClassNewInstance('SocketNetworkDriver', {pingPongTimeSyncInterval: 1000})
                    .attach(engine, 'network')
                    .connect('//localhost:4040')
                    .defineMessageType('welcome', function(data) {
                        console.log('Welcom received: ' + JSON.stringify(data))
                        return data;
                    });

                //Sync
                engine
                    .getRegisteredClassNewInstance('EntitySyncDriver', {networkDriver: engine.network})
                    //.processMinLatency(100) - Client only
                    .attach(engine, 'sync')
                    .start()

                setInterval(function() {
                    //Send message
                    engine.network.sendMessage('greeting', {dummy:'data'});
                }, 5000);


            }
        });

        new Core().start(
            new Client()
        );
    });
}