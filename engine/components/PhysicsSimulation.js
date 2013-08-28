var PhysicsSimulation = Entity.extend({
	_classId: 'PhysicsSimulation',

	init: function() {
		 Entity.prototype.init.call(this);
	},

	/**
	 * Set up some physics integration values
	 */
	start: function () {
		this._pdt = 0.0001;                 //The physics update delta time
        this._pdte = new Date().getTime();  //The physics update last delta time

		setInterval(function(){
			this._pdt = (new Date().getTime() - this._pdte)/1000.0;
			this._pdte = new Date().getTime();
			this.updatePhysics();
		}.bind(this), 15);
	},

	updatePhysics: function() {
//TODO:
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PhysicsSimulation; }