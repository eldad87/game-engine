define(['engine/core/Base', 'engine/core/Exception'], function (Base, Exception) {
    var Core = Base.extend({
        _classId: 'Core',
        _updateSceneGraphInterval: 45,

        init: function(ctx)
        {
            this._register = {};
            this._ctx = ctx;
            this._uptime = 0;
            this.isServer = (typeof(module) !== 'undefined' && module.exports);
            engine = this;

            Base.prototype.init.call(this, {id: 'engine'});
        },

        /**
         * Set rate in MH
         * setRequestAnimationFrame(22) results in 22 iterations per second
         */
        setRequestAnimationFrame: function(rate){
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

        getRegisteredEntities: function() {
            return this._register;
        },

        /**
         * Register an object
         * Late can be find using find()
         */
        registerObject: function(obj, override) {
            console.log('Engine:registerObject');
            if(undefined !== this._register[obj.id()]) {
                if(!override) {
                    throw new Exception('object id [' + obj.id() + '] is already registered');
                }
            }

            this._register[obj.id()]  = obj;

            this.emit('registerObject', obj.id());
            return this;
        },

        /**
         * Unregister an object
         */
        unRegisterObject: function(obj) {
            if(undefined !== this._register[obj.id()]) {

                this.emit('beforeUnRegisterObject', obj.id());

                delete this._register[obj.id()];
            }
            return this;
        },

        /**
         * Get registered object by ID
         */
        getObjectById: function( objId ) {
            return this._register[objId];
        },

        /**
         * Get class by classId
         */
        getRegisteredClass: function (classId) {
            return ClassRegister[classId];
        },

        /**
         * Get a new instance of a registeted class by it's id
         */
        getRegisteredClassNewInstance: function (classId, options) {
            return new ClassRegister[classId](options);
        },

        start: function(callback) {
            requestAnimationFrame(this.engineFrame.bind(this), this._ctx);

            setInterval(this.updateSceneGraph.bind(this), this._updateSceneGraphInterval);

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

        /**
         * run every time that requestAnimationFrame is called
         */
        engineFrame: function (timestamp, ctx) {
            this.updateUptime(timestamp);

            //schedule the next update
            this.updateid = requestAnimationFrame(engine.engineFrame.bind(this), ctx);

            // Update the engine + its childrens
            this.processSceneGraph();
        },

        process: function() {
            Base.prototype.process.call(this);

            //Engine processing goes here
            return true;
        },

        /**
         * All engine updates should run here
         */
        update: function() {
            Base.prototype.update.call(this);

            //Engine updates goes here
            return true;
        },

        /**
         * Update the engine uptime
         * @param curTimestamp - current uptime
         * @returns {*}
         */
        updateUptime: function(curTimestamp) {
            var lastUptime = this._lastUptime || curTimestamp;
            this._lastUptime = curTimestamp;
            return this.incrementUptimeBy(curTimestamp - lastUptime);
        },

        /**
         * Increment uptime by
         * @param increment
         * @returns {*}
         */
        incrementUptimeBy: function(increment) {
            this._uptime += increment;
            //this.log('Uptime: ' + this._uptime);
            return this;
        },

        /**
         * Get current engine uptime
         * @returns {number}
         */
        getUptime: function() {
            return this._uptime;
        },

        destroy: function() {
            Base.prototype.destroy.call(this);
            clearInterval(this.updateid);
        }
    });

//  if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Core; }

    return Core;
});