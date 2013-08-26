var Class = (function () 
{
	var initializing = false,
			fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

		// The base Class implementation (does nothing)
		Class = function () {},

		/**
		 * Get class ID
		 */
		getClassId = function () 
		{
			return this._classId;
		},

		/**
		 * Log a message
		 * @param {String} text - text to log.
		 * @param {String} type - The type of log, default is 'log',
		 */
		log = function(text, type) 
		{
			type = type || 'log';
			var msg = 'Engine ***' + type + '** [' + this.getClassId() + '] : ' + text;

			if(!console) {
				return ; //Can't log
			}

			if(console[type]) {
				return console[type](msg);
			}

			console.log(msg);
		}

		/**
		 * Copies all properties and methods from the classObj object
		 * to "this". If the overwrite flag is not set or set to false,
		 * only properties and methods that don't already exists in
		 * "this" will be copied. If overwrite is true, they will be
		 * copied regardless.
		 * @param {Function} classObj
		 * @param {Boolean} overwrite
		 */
		 implement = function (classObj, overwrite) {
			var i, obj = classObj.prototype || classObj;

			// Copy the class object's properties to (this)
			for (i in obj) {
				// Only copy the property if this doesn't already have it
				if (obj.hasOwnProperty(i) && (overwrite || this[i] === undefined)) {
					this[i] = obj[i];
				}
			}
			return this;
		},

		/**
		 * Gets / sets a key / value pair in the object's data object. Useful for
		 * storing arbitrary game data in the object.
		 * @param {String} key The key under which the data resides.
		 * @param {*=} value The data to set under the specified key.
		 * @return {*}
		 */
		data = function (key, value) {
			if (key !== undefined) {
				if (value !== undefined) {
					this._data = this._data || {};
					this._data[key] = value;

					return this;
				}
				
				if (this._data) {
					return this._data[key];
				} else {
					return null;
				}
			}
		};

		//TODO: add component

		/** 
		 * Create a new Class that inherits from this class
		 * @name extend
		 * @example #Creating a new class by extending an existing one
		 *     var NewClass = Class.extend({
		 *         // Init is your constructor
		 *         init: function () {
		 *             console.log('I\'m alive!');
		 *         }
		 *     });
		 * 
		 * http://ejohn.org/blog/simple-javascript-inheritance/
		 * @return {Function}
		 */
		// Create a new Class that inherits from this class
		Class.extend = function(prop) {
			var _super = this.prototype;

			// Check that the class has been assigned a _classId and bug out if not
			if (!prop._classId) {
				console.log(prop);
				throw('Cannot create a new class without giving the class a classId property!');
			}

			// Check that the _classId is not already in use
			if (ClassRegister[prop._classId]) {
				// This _classId has already been used, bug out
				throw('Cannot create class with _classId "' + prop._classId + '" because a class with that ID has already been created!');
			}
			
			// Instantiate a base class (but only create the instance,
			// don't run the init constructor)
			initializing = true;
			var prototype = new this();
			initializing = false;
			
			// Copy the properties over onto the new prototype
			for (var name in prop) {
				// Check if we're overwriting an existing function
				prototype[name] = typeof prop[name] == "function" &&
					typeof _super[name] == "function" && fnTest.test(prop[name]) ?
					(function(name, fn){
						return function() {
							var tmp = this._super;
			
							// Add a new ._super() method that is the same method
							// but on the super-class
							this._super = _super[name];
			
							// The method only need to be bound temporarily, so we
							// remove it when we're done executing
							var ret = fn.apply(this, arguments);
							this._super = tmp;
			
							return ret;
						};
					})(name, prop[name]) :
					prop[name];
			}
			
			// The dummy class constructor
			function Class() {
				// All construction is actually done in the init method
				if ( !initializing && this.init )
					this.init.apply(this, arguments);
			}
			
			// Populate our constructed prototype object
			Class.prototype = prototype;
			
			// Enforce the constructor to be what we expect
			Class.prototype.constructor = Class;
			
			// And make this class extendable
			Class.extend = arguments.callee;

			// Add log capability
			Class.prototype.log = log;

			// Add data capability
			Class.prototype.data = data;

			// Add class name capability
			Class.prototype.getClassId = getClassId; // This is a method that returns _classId

			Class.prototype._classId = prop._classId || 'Class';

			// Add the implement method
			Class.prototype.implement = implement;

			// Register the class with the class store
			ClassRegister[prop._classId] = Class;
			
			return Class;
		};

		Class.prototype._classId = 'Class';

		return Class;
}());

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Class; }
