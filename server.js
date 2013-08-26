Core = require('./engine/Core');
SocketClient = require('./engine/components/SocketClient');
PhysicsSimulation = require('./engine/components/PhysicsSimulation');

var Server = Class.extend({
	_classId: 'Server',

	init: function () {
		this.log('start', 'log');

		engine.addComponent(PhysicsSimulation);
		engine.PhysicsSimulation
			.start();

		engine.addComponent(SocketClient);
		engine.SocketClient
			.start(4040)
			.on('connection', function(){console.log('connected...')}); //Listen to port 4040
	}
});

new Core().start(function(){
	new Server()
});




//Listen for connections

//On connection, create unit and buind to connection

//Send updates

//Get inputs