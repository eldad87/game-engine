require('./core/common.js');
Class = require('./core/Class');

var Core = Class.extend({
	_classId: 'Core',

	init: function(ctx)
	{
		this.isServer = (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined');
		engine = this;
	},

	//Create entity

	//Get entity

	//Get entities by group

	/**
	 * Set class by id
	 */
	registerClass: function (id, obj) {
		ClassRegister[id] = obj;
	},

	/**
	 * Get class by id
	 */
	getRegisteredClass: function (id) {
		return ClassRegister[id];
	},

	/**
	 * Get a new instance of a registeted class by it's id
	 */
	getRegisteredClassNewInstance: function (id, options) {
		return new ClassRegister[id](options);
	},

	start: function(callback) {
		requestAnimFrame(engine.engineStep);

		// Fire callback
		if (typeof(callback) === 'function') {
			callback(true);
		}
	},

	engineStep: function (timeStamp, ctx) {

		requestAnimFrame(engine.engineStep);
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Core; }