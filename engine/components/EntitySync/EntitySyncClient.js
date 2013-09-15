define(['engine/core/Exception'], function(Exception) {
    return {

        _processMinLatency: 0,
        _newEntityUpdatesQueue: {},
        _removeEntityQueue: {},
        _existingEntityUpdateQueue: {},

        start: function() {
            if(!this.networkDriver()) {
                throw new Exception('Network drive is missing');
            }

            var self = this;

            this.networkDriver.on('connect', function() {
                self.defineMessageType('updateNewEntity',       self.onUpdateNewEntity.bind(self));
                self.defineMessageType('updateExistingEntity',  self.onUpdateExistingEntity.bind(self));
                self.defineMessageType('updateRemoveEntity',    self.onUpdateRemoveEntity.bind(self));
            });

            return this;
        },

        /**
         * Set the minimum 'age' of a input before processing it.
         *  for example val=100, only when inputs will be 100ms old - they will be process
         * @param val
         * @returns {*}
         */
        processMinLatency: function(val) {
            if(undefined === val) {
                return this._processMinLatency;
            }

            this._processMinLatency = val;

            return this;
        },

        _getFutureInputProcessingUptime:function(inputUptime) {
            var currentUptime = engine.getUptime(),
                currentInputAge = currentUptime - inputUptime;

            return currentInputAge >= this.processMinLatency() ?
                        currentUptime :
                        currentUptime + this.processMinLatency() - currentInputAge;
        },


        /**
         * Storing incoming updates
         */

        onUpdateNewEntity: function(data, sentUptime) {
            var futureProcessingUptime = this._getFutureInputProcessingUptime(sentUptime);

            if(undefined === this._newEntityUpdatesQueue[futureProcessingUptime]) {
                this._newEntityUpdatesQueue[futureProcessingUptime] = [];
            }

            this._newEntityUpdatesQueue[futureProcessingUptime].push(data)
        },

        onUpdateRemoveEntity: function(entityId, sentUptime) {
            var futureProcessingUptime = this._getFutureInputProcessingUptime(sentUptime);

            if(undefined === this._removeEntityQueue[futureProcessingUptime]) {
                this._removeEntityQueue[futureProcessingUptime] = [];
            }

            this._removeEntityQueue[futureProcessingUptime].push(data)
        },

        onUpdateExistingEntity: function(data, sentUptime) {

        },


        /**
         * Processing stored updates
         */

        process: function() {
            if(!this.start() ||
                false === (Entity.prototype.process.call(this))) {
                return false;
            }

            this.processUpdateNewEntity();
            this.processUpdateExistingEntity();
            this.processUpdateRemoveEntity();

            return true;
        },

        processUpdateNewEntity: function() {
            var currentUptime = engine.getUptime(),
                futureProcessingUptime,
                updates,
                i;

            //Go over all updates
            for(futureProcessingUptime in this._newEntityUpdatesQueue) {
                futureProcessingUptime = parseFloat(futureProcessingUptime);

                //If update is at the past/current
                if(currentUptime >= futureProcessingUptime) {
                    //Execute updates
                    updates = this._newEntityUpdatesQueue[futureProcessingUptime];
                    for(i in updates) {
                        this._updateNewEntity(updates[i]);
                    }

                    //Delete updates
                    delete this._newEntityUpdatesQueue[futureProcessingUptime];
                }
            }
        },

        processUpdateRemoveEntity: function() {
            var currentUptime = engine.getUptime(),
                futureProcessingUptime,
                updates,
                i;

            //Go over all updates
            for(futureProcessingUptime in this._removeEntityQueue) {
                futureProcessingUptime = parseFloat(futureProcessingUptime);

                //If update is at the past/current
                if(currentUptime >= futureProcessingUptime) {
                    //Execute updates
                    updates = this._removeEntityQueue[futureProcessingUptime];
                    for(i in updates) {
                        this._updateRemoveEntity(updates[i]);
                    }

                    //Delete updates
                    delete this._removeEntityQueue[futureProcessingUptime];
                }
            }
        },

        processUpdateExistingEntity: function() {

        },


        /**
         * Applying updates
         */

        /**
         * Update on new entity
         * @param data{ id: ,classId: ,sync: }
         */
        _updateNewEntity: function(data) {
            var entity = engine.getRegisteredClassNewInstance(data.classId, {id: data.id})
            if(!entity) {
                throw new Exception('Cannot create new [' + data.classId + '] with ID [' + data.id + ']');
            }

            return entity.sync(data.sync)
        },

        /**
         * Remove existing entity
         * @param entityId
         */
        _updateRemoveEntity: function(entityId) {
            var entity = engine.getEntityById(entityId);
            if(!entity) {
                return false;
            }

            return entity.destroy();
        },

        /**
         * Update existing entity
         * @param data{ id: ,sync: }
         */
        _updateExistingEntity: function(data) {
            var entity = engine.getEntityById(data.id);
            if(!entity) {
                throw new Exception('Cannot update [' + data.classId + '] with ID [' + data.id + ']');
            }

            return entity.sync(data.sync)
        }
    };

});