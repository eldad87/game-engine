define(['engine/core/Base', 'engine/core/Exception', 'underscore'], function(Base, Exception, _) {
    return {
        _latestEntitySectionUpdate: {},

        start: function() {
            if(!this.networkDriver()) {
                throw new Exception('Network drive is missing');
            }

            var self = this;

            //Listen to any new entity creation
            this.networkDriver().on('connect', function(clientId){
                //Send to client all current objects

                //Get all registered entities
                var entities = engine.getRegisteredEntities();
                for(var entityId in entities) {
                    if(!self._isSyncableObject(entities[entityId])) {
                        //No sync method
                        continue;
                    }

                    //Send each entity to the client
                    self._updateNewEntity(entities[entityId], clientId);
                }

            });

            //New entity, add _entitySync
            engine.on('registerObject', function(objId) {
                var entity = engine.getObjectById(objId);
                if(!self._isSyncableObject(entity)) {
                    return true;
                }
                entity['_entitySync'] = false;
            });

            //Remove entity, remove _entitySync
            engine.on('beforeUnRegisterObject', function(objId) {

                var entity = engine.getObjectById(objId);
                if(!self._isSyncableObject(entity)) {
                    return true;
                }
                delete entity._entitySync;
                delete this._latestEntitySectionUpdate[entity.id()];

                this.networkDriver().sendMessage('updateRemoveEntity', objId);
            });

            return this;
        },

        update: function() {
            if(false === Base.prototype.update.call(this)) {
                return false;
            }

            //Get all registered entities
            var entities = engine.getRegisteredEntities();

            for(var entityId in entities) {
                if(!this._isSyncableObject(entities[entityId])) {
                    //No sync method
                    continue;
                }

                //Check if its a new entity
                if(false === entities[entityId]['_entitySync']) {
                    entities[entityId]['_entitySync'] = true;
                    //New entity
                    this._updateNewEntity(entities[entityId]);
                } else {
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
                'sync':     entity.sync()
            };

            if(!data.sync || 0 == data.sync.length) {
                return true; //Nothing to sync
            }

            this.networkDriver().sendMessage('updateNewEntity', data, undefined, socketId);
        },

        _updateExistingEntity: function( entity ) {
            var data = {
                'id':       entity.id(),
                'sync':     entity.sync()
            };

            if(!data.sync || 0 == data.sync.length) {
                return true; //Nothing to sync
            }

            /**
             * Prevent sending same update again
             */
            var syncSctions = entity.syncSections();
            for(var i in syncSctions) {
                if(undefined === data.sync[syncSctions[i]]) {
                    continue;
                }

                if(undefined === this._latestEntitySectionUpdate[entity.id()]) {
                    //First update for this entity
                    this._latestEntitySectionUpdate[entity.id()] = {};
                }
                if(undefined === this._latestEntitySectionUpdate[entity.id()][syncSctions[i]]) {
                    //This is the first update for this entity/section - set this section update data
                    this._latestEntitySectionUpdate[entity.id()][syncSctions[i]] = data.sync[syncSctions[i]];
                    continue;
                }

                //Check if current sync data === latest sync data
                if(_.isEqual(this._latestEntitySectionUpdate[entity.id()][syncSctions[i]], data.sync[syncSctions[i]])) {
                    //Remove update
                    delete data.sync[syncSctions[i]];
                }
            }

            //Check if any updates left
            if(_.isEmpty(data.sync)) {
                return true; //Nothing to sync
            }

            this.networkDriver().sendMessage('updateExistingEntity', data);
        },

        /**
         * Detemine if the given entity is syncable
         *      Make sure that sync && syncSections method exists
         * @param entity
         * @returns {boolean}
         * @private
         */
        _isSyncableObject: function(entity) {
            /*undefined !==  entity['sync'] &&
             undefined !==  entity['syncSections'] &&*/

            return typeof entity['sync'] == 'function' &&
                    typeof entity['syncSections'] == 'function';
        }



        /*process: function() {
         if(!this.start() ||
         false === (Base.prototype.process.call(this))) {
         return false;
         }

         //Move record from future (those that in the past + this._processLatency) to past queue

         //Keep max 60 records on each queue

         //Process input

         return true;
         },*/

    };
});