//Connect to server

//Listen for messages

//Set messages

window.onload = function() 
{
    /*var Core = require('engine/Core');
    var NetworkServer = require('engine/components/Network/NetworkServer');*/


    require = requirejs;
    require.config({
        use: {
            underscore: {
                attach: "_"
            }
        },
        //baseUrl: 'node_modules',
        packages:[
            {
                name: 'socket.io',
                //location: './node_modules/socket.io/lib',
                location: './node_modules/socket.io/node_modules/socket.io-client/dist',
                main: 'socket.io'
            },
            {
                name: 'node-uuid',
                location: './node_modules/node-uuid',
                main: 'uuid'
            },
            {
                name: 'bson',
                location: './node_modules/bson/browser_build',
                main: 'bson'
            }
        ]
    });

    require(['engine/core/Class', 'engine/Core', 'engine/components/Network/NetworkClient'], function(Class, Core, NetworkClient) {

        var Client = Class.extend({
            _classId: 'Client',

            init: function () {
                this.log('start', 'log');

                engine
                    .getRegisteredClassNewInstance('NetworkClient', true)
                    .attach(engine, 'network')
                    .connect('//localhost:4040')
                    .defineMessageType('call', function(data) {
                        return 'response data';
                    });

                //Send message
                engine.network.sendMessage('hey', {str:'dummy'});
            }
        });

        new Core().start(
            new Client()
        );
    });
}