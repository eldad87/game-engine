define(['engine/core/Entity'], function (Entity) {
    var Core = Entity.extend({
        _classId: 'Core',

        init: function(ctx)
        {
            this._register = {};
            this._ctx = ctx;
            this._uptime = 0;
            this.isServer = (typeof(module) !== 'undefined' && module.exports);
            engine = this;

            Entity.prototype.init.call(this, 'engine');
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

        /**
         * Register an entity
         * Late can be find using find()
         */
        registerEntity: function(entity, override) {
            if(this._register[entity.id()] !== undefined) {
                if(!override) {
                    throw new Exception('entity id [' + entity.id() + '] is already registered');
                }
            }

            this.unRegisterEntity(entity);
            this._register[entity.id()]  = entity;
            return this;
        },

        /**
         * Unregister an entity
         */
        unRegisterEntity: function(entity) {
            delete this._register[entity.id()];
            return this;
        },

        /**
         * Get registered entity by ID
         */
        getEntityById: function( entityId ) {
            return this._register[entityId];
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
            requestAnimationFrame(this.engineTick.bind(this), this._ctx);

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
        engineTick: function (timestamp, ctx) {
            this.updateUptime(timestamp);

            //schedule the next update
            this.updateid = requestAnimationFrame(engine.engineTick.bind(this), ctx);

            // Update the engine + its childrens
            this.updateSceneGraph();
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

        /**
         * All engine updates should run here
         */
        update: function() {
            Entity.prototype.update.call(this);

            //Engine updates goes here
        },

        destroy: function() {
            Entity.prototype.destroy.call(this);
            clearInterval(this.updateid);
        }
    });

//  if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Core; }

    return Core;
});