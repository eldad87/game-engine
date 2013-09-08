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

    requirejs(['engine/core/Class', 'engine/Core', 'engine/components/Network/SocketNetworkDriver'], function(Class, Core, SocketNetworkDriver) {
        var Client = Class.extend({
            _classId: 'Client',

            init: function () {
                this.log('start', 'log');

                engine
                    .getRegisteredClassNewInstance('SocketNetworkDriver', true)
                    .attach(engine, 'network')
                    .connect('//localhost:4040')
                    .defineMessageType('welcome', function(data) {
                        return data;
                    });

                //Send message
                engine.network.sendMessage('greeting', {dummy:'data'});
            }
        });

        new Core().start(
            new Client()
        );
    });
}