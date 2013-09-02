//Connect to server

//Listen for messages

//Set messages

window.onload = function() 
{
	var game = {};

	Core = require('./engine/Core');

	var Client = Class.extend({
		_classId: 'Client',

		init: function () {
			this.log('start', 'log');
			
			engine
				.addComponent(SocketClient)
				.SocketClient
					.start('//localhost:4040')
					.on('connection', function(){console.log('connected...')}); //Listen to port 4040
			//TOOD: listen to network
		}
	});

	new Core().start(
		new Client();
	);
}