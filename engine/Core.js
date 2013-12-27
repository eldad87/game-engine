define(['engine/core/Base', 'engine/core/Exception'], function (Base, Exception) {
    var Core = Base.extend({
        _classId: 'Core',
        _updateSceneGraphInterval: 45,

        init: function(ctx)
        {
            this._register = {};
            this._groups = {};
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
         * Register an object.
         *  Now its Retrievable via getObjectById() method.
         */
        registerObject: function(obj, override) {
            console.log('Engine:registerObject: ' + obj.id());
            if(undefined !== this._register[obj.id()]) {
                if(!override) {
                    throw new Exception('object id [' + obj.id() + '] is already registered');
                }
            }

            this._register[obj.id()]  = obj;

            this.trigger('registerObject', obj.id());
            return this;
        },

        /**
         * Un-register an object
         */
        unRegisterObject: function(obj) {
            if(undefined !== this._register[obj.id()]) {

                this.trigger('beforeUnRegisterObject', obj.id());

                this.removeObjectFromGroup(obj);
                delete this._register[obj.id()];
            }
            return this;
        },

        replaceRegisterObjectId: function(obj, newId) {
            if(undefined ===  this._register[obj.id()]) {
                throw new Exception('object id [' + obj.id() + '] not exists');
            }
            if(undefined != this._register[newId]) {
                throw new Exception('object id [' + obj.id() + '] is already in use');
            }

            //Switch to new ID
            this._register[newId] = this._register[currentId];
            //Delete old id
            //delete this._register[currentId];
        },

        /**
         * Get registered object by ID.
         */
        getObjectById: function( objId ) {
            return this._register[objId];
        },

        /**
         * Add object to group
         * @param object
         * @param group
         * @returns {Core}
         */
        addObjectToGroup: function(object, group)
        {
            if(undefined === this._groups[group]) {
                this._groups[group] = {};
            }

            this._groups[group][object.id()] = object;

            return this;
        },

        /**
         * Remove object from group
         * @param object
         * @param group
         * @returns {Core}
         */
        removeObjectFromGroup: function(object, group)
        {
            if(undefined === group) {
                for(var i in this._groups) {
                    this._removeObjectFromGroup(object, i);
                }
            } else {
                this._removeObjectFromGroup(object, group);
            }

            return this;
        },

        _removeObjectFromGroup: function(object, group)
        {
            if(undefined === this._groups[group] ||
                undefined === this._groups[group][object.getId()]) {
                return true;
            }

            delete this._groups[group][object.getId()];
        },

        /**
         * Get objects by group
         * @param group
         * @returns {*}
         */
        getObjectsByGroup: function(group)
        {
            if(undefined === this._groups[group])
            {
                return [];
            }

            return this._groups[group];
        },

        /**
         * Get class by its classId.
         */
        getRegisteredClass: function (classId) {
            return ClassRegister[classId];
        },

        /**
         * Get a new instance of a registered class, by it's id.
         */
        getRegisteredClassNewInstance: function (classId, options) {
            return new ClassRegister[classId](options);
        },

        start: function(callback) {
            requestAnimationFrame(this.engineFrame.bind(this), this._ctx);

            setInterval(this.updateSceneGraph.bind(this), this._updateSceneGraphInterval);

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

        /**
         * Engine processing time
         *  Process / Calculate new state
         * @returns {boolean}
         */
        process: function() {
            Base.prototype.process.call(this);

            //Engine processing goes here
            return true;
        },

        /**
         * Engine update time
         *  Send updates to client/server
         * @returns {boolean}
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
            return this.incrementUptimeByLatestDelta(curTimestamp - lastUptime);
        },

        /**
         * Increment uptime by latest processing delta time
         * @param delta
         * @returns {*}
         */
        incrementUptimeByLatestDelta: function(delta) {
            this._uptime += delta;
            this.deltaUptime( delta / 1000 );
            return this;
        },

        /**
         * Get / Set latest process time in seconds
         * @param val
         * @returns {*}
         */
        deltaUptime: function(val) {
            if(undefined === val) {
                return this._uptimeDelta;
            }

            this._uptimeDelta = val;
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

    return Core;
});