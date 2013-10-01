define(['engine/core/Exception', 'engine/core/common'], function(Exception) {
    var Class = (function ()
    {
        var initializing = false,
			fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

		// The base Class implementation (does nothing)
		Class = function () {},

		/**
		 * Log a message
		 */
		log = function(msg, type) 
		{
			type = type || 'log';

			if(!console) {
				return ; //Can't log
			}

			if(console[type]) {
				return console[type](msg);
			}

			console.log(msg);
		},

		/**
		 * Copy over the properties and methods of a given class
		 * default override is false
		 */
         implement = function (copyPropFromObject, override) {
			var i, 
				obj = copyPropFromObject.prototype || copyPropFromObject;

			for (i in obj) {
				if (obj.hasOwnProperty(i) && 
						(override || this[i] === undefined)) {

					this[i] = obj[i];
				}
			}

			return this;
		},

		/**
		 * Create a new class that iherit from this one
		 * http://ejohn.org/blog/simple-javascript-inheritance/
		 */
		Class.extend = function(prop) {
			var _super = this.prototype;

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
			
			//Populate our constructed prototype object
			Class.prototype = prototype;
			
			//Enforce the constructor to be what we expect
			Class.prototype.constructor = Class;
			
			//And make this class extendable
			Class.extend = arguments.callee;

			//Add log
			Class.prototype.log = log;

			//Add the implement method
			Class.prototype.implement = implement;

            //Register class
            ClassRegister[prop._classId] = Class;

			return Class;
		};

		return Class;
    }());

    return Class;
});