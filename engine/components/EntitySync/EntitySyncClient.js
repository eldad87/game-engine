define(['engine/core/Exception'], function(Exception) {
    return {
        start: function() {
            if(!this.networkDriver()) {
                throw new Exception('Network drive is missing');
            }

            var self = this;

            this.networkDriver.on('connect', function() {
                self.defineMessageType('updateNewEntity',       self.updateNewEntity.bind(self));
                self.defineMessageType('updateExistingEntity',  self.updateExistingEntity.bind(self));
                self.defineMessageType('updateRemoveEntity',    self.updateRemoveEntity.bind(self));
            });

            return this;
        },

        /**
         * Update on new entity
         * @param data{ id: ,classId: ,sync: }
         * @param sentUptime
         */
        updateNewEntity: function(data, sentUptime) {
            var entity = engine.getRegisteredClassNewInstance(data.classId, {id: data.id})
            if(!entity) {
                throw new Exception('Cannot create new [' + data.classId + '] with ID [' + data.id + ']');
            }

            return entity.sync(data.sync)
        },

        /**
         * Update existing entity
         * @param data{ id: ,sync: }
         * @param sentUptime
         */
        updateExistingEntity: function(data, sentUptime) {
            var entity = engine.getEntityById(data.id);
            if(!entity) {
                throw new Exception('Cannot update [' + data.classId + '] with ID [' + data.id + ']');
            }

            return entity.sync(data.sync)
        },

        /**
         * Remove existing entity
         * @param entityId
         * @param sentUptime
         */
        updateRemoveEntity: function(entityId, sentUptime) {
            var entity = engine.getEntityById(entityId);
            if(!entity) {
                return false;
            }

            entity.destroy();
        },

        process: function() {
            if(!this.start() ||
                false === (Entity.prototype.process.call(this))) {
                return false;
            }

            //Move record from future (those that in the past + this._processLatency) to past queue

            //Keep max 60 records on each queue

            //Process input

            return true;
        }
    };

});