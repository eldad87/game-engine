require('./core/common.js');
Class = require('./core/Class');

var Core = Class.extend({
	_classId: 'Core',

	init: function(ctx)
	{
		this._ctx = ctx;
		this.isServer = (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined');
		engine = this;
	},

	/**
	 * Set rate in MH
	 * setRequestAnimationFrame(22) results in 22 iterations per second
	 */
	setRequestAnimationFrame: function(rate ){
		if(rate === undefined) {
			return false;
		}

		if(this.isServer) {
			requestAnimFrame = function(callback, element){
				setTimeout(function () { callback(new Date().getTime()); }, 1000 / rate);
			};
		} else {
			window.requestAnimFrame = function(callback, element){
				setTimeout(function () { callback(new Date().getTime()); }, 1000 / rate);
			};
		}
	},

	//TODO: Get entity by id

	//TODO: Get entities by group

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
		this.engineStep(new Date().getTime(), this._ctx)

		this.createTimer();


		if(this.isServer) {
			this.setRequestAnimationFrame(22);
		}

		if(!this.isServer) {
			//A list of recent server updates we interpolate across
			//This is the buffer that is the driving factor for our networking
            this.server_updates = [];
		}

		// Fire callback
		if (typeof(callback) === 'function') {
			callback(true);
		}
	},

	engineStep: function (timeStamp, ctx) {
		this.log('engineStep', 'log');

		//Work out the delta time
		this.dt = this.lastframetime ? ( (timeStamp - this.lastframetime)/1000.0).fixed() : 0.016;

		//Store the last frame time
		this.lastframetime = timeStamp;


//TODO: Update 


		//schedule the next update
		this.updateid = requestAnimationFrame(engine.engineStep.bind(this), ctx);
	},

	/**
	 * A local timer for precision on server and client
	 */
	createTimer: function(){
        this.local_time = 0.016;            //The local timer
        this._dt = new Date().getTime();    //The local timer delta
        this._dte = new Date().getTime();   //The local timer last frame time

		setInterval(function(){
			this._dt = new Date().getTime() - this._dte;
			this._dte = new Date().getTime();
			this.local_time += this._dt/1000.0;
		}.bind(this), 4);
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Core; }