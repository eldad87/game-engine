var io = require('socket.io');

var SocketNetworkDriver = Entity.extend({
	_classId: 'SocketNetworkDriver',

	init: function() {
		Entity.prototype.init.call(this);

		/*if(engine.isServer) {
			var networkImplementation = require('NetworkServer');
		}

		if(!engine.isServer) {
			var networkImplementation = require('NetworkClient');
		}

		this.implement(networkImplementation, true);*/
	},

	start: function (listentOrConnectTo) {
		var self = this;

		if(engine.isServer) {
			this.io = io.listen(listentOrConnectTo);
			
			this.io.on('connection', function (socket) {
				self.connection(socket);
			});

			/*this.io.on('disconnect', function (socket) {
				self.disconnect(socket);
			});*/
		}

		if(!engine.isServer) {
			this.io = io.connect(listentOrConnectTo);

			this.setCommandHandler('connection',function () {
				self.connection();
			});

			this.setCommandHandler('disconnect', function () {
				self.disconnect();
			});
		}

		this._io.on('message', this.message.bind(this));

		return this;
	},

	message: function(data) {

	}

});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = SocketNetworkDriver; }