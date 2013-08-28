var SocketClient = Entity.extend({
	_classId: 'SocketClient',

	init: function() {
		Entity.prototype.init.call(this);
	},

	start: function (listentOrConnectTo) {
		var io = require('socket.io');
		
		if(engine.isServer) {
			this.io = io.listen(listentOrConnectTo);
		}

		if(!engine.isServer) {
			this.io = io.connect(listentOrConnectTo);
		}

		return this;
	},

	on: function(event, callback) {
		this.io.on(event, callback);

		return this;
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = SocketClient; }