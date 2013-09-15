define(['engine/core/Exception', 'engine/core/common'], function(Exception) {
    return {
        start: function() {
            if(!this.networkDriver()) {
                throw new Exception('Network drive is missing');
            }

            var self = this;

            //Listen to any new entity creation
            this.networkDriver.on('connect', function(clientId){
                //Send to client all current objects

                //Get all registered entities
                var entities = engine.getRegisterEntities();
                for(var entityId in entities) {
                    if(!self._isSyncableEntity(entities[entityId])) {
                        //No sync method
                        continue;
                    }

                    //Send each entity to the client
                    self._updateNewEntity(entities[entityId], clientId);
                }

            });

            //New entity, add _entitySync
            engine.on('registerEntity', function(entityId) {

                var entity = engine.getEntityById(entityId);
                if(!self._isSyncableEntity(entity)) {
                    return true;
                }
                entity['_entitySync'] = false;
            });

            //Remove entity, remove _entitySync
            engine.on('beforeUnRegisterEntity', function(entityId) {

                var entity = engine.getEntityById(entityId);
                if(!self._isSyncableEntity(entity)) {
                    return true;
                }
                delete entity._entitySync;

                this.networkDriver.send('updateRemoveEntity', entityId);
            });

            return this;
        },

        update: function() {
            if(false === Entity.prototype.update.call(this)) {
                return false;
            }

            //Get all registered entities
            var entities = engine.getRegisteredEntities();

            for(var entityId in entities) {
                if(this._isSyncableEntity(entities[entityId])) {
                    //No sync method
                    continue;
                }

                //Check if its a new entity
                if(false === entities[entityId]['_entitySync']) {
                    //New entity
                    this._updateNewEntity(entities[entityId]);
                } else {
                    entities[entityId]['_entitySync'] = true;

                    //Entity already created, just update its delta
                    this._updateExistingEntity(entities[entityId]);
                }
            }

            return true;
        },

        _updateNewEntity: function( entity, socketId ) {
            var data = {
                'id':       entity.id(),
                'classId':  entity.getClassId(),
                'sync':     entity.sync(undefined, false) //WHOLE sync data, not only the delta
            };

            if(!data.sync || 0 == data.sync.length) {
                return true; //Nothing to sync
            }

            this.networkDriver.send('updateNewEntity', data, undefined, socketId);
        },

        _updateExistingEntity: function( entity ) {
            var data = {
                'id':       entity.id(),
                'sync':     entity.sync(undefined, true) //Update delta only
            };

            if(!data.sync || 0 == data.sync.length) {
                return true; //Nothing to sync
            }

            this.networkDriver.send('updateExistingEntity', data);
        },

        /**
         * Detemine if the given entity is syncable
         *      Make sure that sync && syncSections method exists
         * @param entity
         * @returns {boolean}
         * @private
         */
        _isSyncableEntity: function(entity) {
            /*undefined !==  entity['sync'] &&
             undefined !==  entity['syncSections'] &&*/

            return isFunction(entity['sync']) &&
                    isFunction(entity['syncSections']);
        }


        /*process: function() {
         if(!this.start() ||
         false === (Entity.prototype.process.call(this))) {
         return false;
         }

         //Move record from future (those that in the past + this._processLatency) to past queue

         //Keep max 60 records on each queue

         //Process input

         return true;
         },*/

    };
});