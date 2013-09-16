define(['engine/core/Exception'], function(Exception) {
    return {

        _processMinLatency: 0,
        _sectionBufferSize: 120,
        _newEntityUpdatesQueue: {},
        _removeEntityQueue: {},
        _existingEntityUpdateQueue: {},

        start: function() {
            if(!this.networkDriver()) {
                throw new Exception('Network drive is missing');
            }

            var self = this;

            this.networkDriver().on('connect', function() {
                self.networkDriver().defineMessageType('updateNewEntity',       self.onUpdateNewEntity.bind(self));
                self.networkDriver().defineMessageType('updateExistingEntity',  self.onUpdateExistingEntity.bind(self));
                self.networkDriver().defineMessageType('updateRemoveEntity',    self.onUpdateRemoveEntity.bind(self));
            });

            return this;
        },

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

        /**
         * Calc on which UpTime the input should run - which in turn will be processMinLatency() old
         * @param inputUptime
         * @returns {number}
         * @private
         */
        _getFutureInputProcessingUptime:function(inputUptime) {
            var currentUptime = engine.getUptime(),
                currentInputAge = currentUptime - inputUptime;

            return currentInputAge >= this.processMinLatency() ?
                        currentUptime :
                        currentUptime + this.processMinLatency() - currentInputAge;
        },


        /**
         * Store new entities updates
         */
        onUpdateNewEntity: function(data, sentUptime) {
            var futureProcessingUptime = this._getFutureInputProcessingUptime(sentUptime);

            if(undefined === this._newEntityUpdatesQueue[futureProcessingUptime]) {
                this._newEntityUpdatesQueue[futureProcessingUptime] = [];
            }

            this._newEntityUpdatesQueue[futureProcessingUptime].push(data)
        },

        /**
         * Process new entities updates
         */
        processUpdateNewEntity: function() {
            var currentUptime = engine.getUptime(),
                futureProcessingUptime,
                updates,
                i,
                data,
                entity;

            //Go over all updates
            for(futureProcessingUptime in this._newEntityUpdatesQueue) {
                futureProcessingUptime = parseFloat(futureProcessingUptime);

                //If update is at the past/current
                if(currentUptime >= futureProcessingUptime) {
                    //Execute updates
                    updates = this._newEntityUpdatesQueue[futureProcessingUptime];
                    for(i in updates) {
                        data = updates[i];
                        entity = engine.getRegisteredClassNewInstance(data.classId, {id: data.id})
                        if(!entity) {
                            throw new Exception('Cannot create new [' + data.classId + '] with ID [' + data.id + ']');
                        }

                        entity.sync(data.sync)
                    }

                    //Delete updates
                    delete this._newEntityUpdatesQueue[futureProcessingUptime];
                }
            }
        },


        /**
         * Store remove entity updates
         * @param entityId
         * @param sentUptime
         */
        onUpdateRemoveEntity: function(entityId, sentUptime) {
            var futureProcessingUptime = this._getFutureInputProcessingUptime(sentUptime);

            if(undefined === this._removeEntityQueue[futureProcessingUptime]) {
                this._removeEntityQueue[futureProcessingUptime] = [];
            }

            this._removeEntityQueue[futureProcessingUptime].push(data)
        },

        /**
         * Process remove entity updates
         */
        processUpdateRemoveEntity: function() {
            var currentUptime = engine.getUptime(),
                futureProcessingUptime,
                updates,
                i,
                entityId,
                entity;

            //Go over all updates
            for(futureProcessingUptime in this._removeEntityQueue) {
                futureProcessingUptime = parseFloat(futureProcessingUptime);

                //If update is at the past/current
                if(currentUptime >= futureProcessingUptime) {
                    //Execute updates
                    updates = this._removeEntityQueue[futureProcessingUptime];
                    for(i in updates) {
                        entityId = updates[i];

                        //Delete entity updates
                        delete this._existingEntityUpdateQueue[entityId];

                        //Destroy entity
                        entity = engine.getEntityById(entityId);
                        if(!entity) {
                            continue;
                        }
                        entity.destroy();
                    }

                    //Delete updates
                    delete this._removeEntityQueue[futureProcessingUptime];
                }
            }
        },


        /**
         * _existingEntityUpdateQueue: {
         *      entityId: {
         *          sectionI: []
         *          sectionII: []
         *      }
         * }
         * @param  data {id:, stnc}
         * @param sentUptime
         */
        onUpdateExistingEntity: function(data, sentUptime) {
            var entity = engine.getEntityById(data.id);
            if(!entity) {
                throw new Exception('Cannot update [' + data.classId + '] with ID [' + data.id + ']');
            }
            var futureProcessingUptime = this._getFutureInputProcessingUptime(sentUptime);

            //Get entity sections
            var syncSctions = entity.syncSections();

            //First entity update
            if(undefined === this._existingEntityUpdateQueue[entity.id()]) {
                //Add entity
                this._existingEntityUpdateQueue[entity.id()] = {};

                //Add sections
                for(var i in syncSctions) {
                    this._existingEntityUpdateQueue[entity.id()][syncSctions[i]] = [];
                }
            }


            //Go over the sync data
            for(var sectionName in this._existingEntityUpdateQueue[entity.id()]) {
                //Check if section sync data is provided
                if(undefined === data[sectionName]) {
                    continue;
                }

                //Add sync data to each section
                this._existingEntityUpdateQueue[entity.id()][sectionName].push(
                    {
                        sync: data.sync,
                        uptime: futureProcessingUptime
                    }
                );

                //Limit buffer in max this._sectionBufferSize records PER section
                if(this._existingEntityUpdateQueue[entity.id()][sectionName].length >= this._sectionBufferSize) {
                    this._existingEntityUpdateQueue[entity.id()][sectionName].splice(0,1);
                }
            }

            return true;
        },

        /**
         * Process all updates - per entity-section that their sentUptime is < now
         */
        processUpdateExistingEntity: function() {
            var uptime = engine.getUptime();
            for(var entityId in this._existingEntityUpdateQueue) {
                var entity = engine.getEntityById(entityId);
                if(!entity) {
                    throw new Exception('Cannot process updates entiy with ID [' + data.id + '] not found');
                }

                for(var sectionName in this._existingEntityUpdateQueue[entityId]) {

                    /**
                     * Starting to search for the relevant update from the 'oldest' update to the newest.
                     *  The relevant update is the 'newest' with uptime<now that
                     */
                    for(var i in this._existingEntityUpdateQueue[entityId][sectionName]) {

                        var prevUpdate = this._existingEntityUpdateQueue[entityId][sectionName][i-1],
                            update = this._existingEntityUpdateQueue[entityId][sectionName][i],
                            nextUpdate = this._existingEntityUpdateQueue[entityId][sectionName][i+1];


                        if(parseFloat(update.uptime) < uptime) {

                            //Remove prev update, its too old
                            if(undefined !== prevUpdate) {
                                delete this._existingEntityUpdateQueue[entityId][sectionName][i-1];
                                delete prevUpdate;
                            }

                            //Check if we need to stop
                            if(uptime < parseFloat(nextUpdate.uptime)) {
                                break; //BINGO
                            }
                        } else {
                            continue; //All updates are future one, or now updates presents
                        }

                        //Found an update
                        var syncData = {};
                        syncData[sectionName] = update;
                        entity.sync(syncData);
                    }
                }
            }
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