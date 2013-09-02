Core = require('./engine/Core');
SocketNetworkDriver = require('./engine/components/SocketNetworkDriver');
//PhysicsSimulation = require('./engine/components/PhysicsSimulation');

var Server = Class.extend({
	_classId: 'Server',

	init: function () {
		this.log('start', 'log');

		/*engine
			.getRegisteredClassNewInstance('PhysicsSimulation')
			.attach(engine, true)
				.start();*/

		engine
			.getRegisteredClassNewInstance('SocketNetworkDriver', true)
			.attach(engine)
				/*.start('4040')
				.on('connection', function(){console.log('connected...')}); //Listen to port 4040*/
	}
});

new Core().start(function(){
	new Server();
});




//Listen for connections

//On connection, create unit and buind to connection

//Send updates

//Get inputs