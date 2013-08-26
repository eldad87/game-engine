Core = require('./engine/Core');

var Server = Class.extend({
	_classId: 'Server',

	init: function () {
		this.log('start', 'log');
		
		//TOOD: listen to network
	}
});

new Core().start(new Server());




//Listen for connections

//On connection, create unit and buind to connection

//Send updates

//Get inputs