//Connect to server

//Listen for messages

//Set messages


var game = {};
window.onload = function() 
{
	Core = require('./engine/Core');

	var Client = Class.extend({
		_classId: 'Server',

		init: function () {
			this.log('start', 'log');
			
			//TOOD: listen to network
		}
	});

	new Core().start(new Client());


	game = new Engine();
	game.setViewPort('viewport');
}