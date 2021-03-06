define(['engine/components/EntitySync/EntitySyncBase', 'engine/core/Exception'], function(EntitySyncBase, Exception) {
    var EntitySyncClient = EntitySyncBase.extend({
        _classId: 'EntitySyncClient',

        _processMinLatency: 0,
        _sectionBufferSize: 120,
        _newEntityUpdatesQueue: {},
        _removeEntityQueue: {},
        _existingEntityUpdateQueue: {},
        _rawExistingEntityUpdateQueue: {},

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

        /**
         * Process new entities, existing entities and entities that need to be removed
         * @returns {boolean}
         */
        process: function() {
            if(!this.start() ||
                false === (EntitySyncBase.prototype.process.call(this))) {
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

                        entity.sync(data.sync);

                        //Now updates can get processed for this entity
                        this._existingEntityUpdateQueue[data.id] = {};
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
                        //Delete entity raw updates
                        delete this._rawExistingEntityUpdateQueue[entityId];

                        //Destroy entity
                        entity = engine.getObjectById(entityId);
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
         * Store data in RAW update queue
         * _existingEntityUpdateQueue: {
         *      entityId: {
         *          sectionI: []
         *          sectionII: []
         *      }
         * }
         * @param  data {id:, sync}
         * @param sentUptime
         */
        onUpdateExistingEntity: function(data, sentUptime) {
            if(undefined === this._rawExistingEntityUpdateQueue[data.id]) {
                this._rawExistingEntityUpdateQueue[data.id] = [];
            }
            this._rawExistingEntityUpdateQueue[data.id].push([data, sentUptime]);
        },

        /**
         * Process all updates - per entity-section that their sentUptime is < now
         */
        processUpdateExistingEntity: function() {
            var uptime = engine.getUptime();
            for(var entityId in this._existingEntityUpdateQueue) {
                var entity = engine.getObjectById(entityId);
                if(!entity) {
                    throw new Exception('Cannot process updates entiy with ID [' + data.id + '] not found');
                }
                this.processRawExistingEntityUpdateQueue(entityId);

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
         * Process RAW sync data for existing entity
         */
        processRawExistingEntityUpdateQueue: function(entityId) {
            for(var i in this._rawExistingEntityUpdateQueue[entityId]) {
                try{
                    this._processRawExistingEntityUpdateQueue(this._rawExistingEntityUpdateQueue[entityId][i][0], this._rawExistingEntityUpdateQueue[entityId][i][1]);
                    delete this._rawExistingEntityUpdateQueue[entityId][i];
                } catch (exception) {
                    console.log('Exception: ' + exception.message);
                }
            }
            delete this._rawExistingEntityUpdateQueue[entityId];
        },

        _processRawExistingEntityUpdateQueue: function(data, sentUptime) {
            var entity = engine.getObjectById(data.id);
            if(!entity) {
                throw new Exception('Cannot find entity with ID [' + data.id + '] for update I');
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
         * Update existing entity
         * @param data{ id: ,sync: }
         */
        _updateExistingEntity: function(data) {
            var entity = engine.getObjectById(data.id);
            if(!entity) {
                throw new Exception('Cannot find entity with ID [' + data.id + '] for update II');
            }

            return entity.sync(data.sync)
        }
    });

    return EntitySyncClient;
});