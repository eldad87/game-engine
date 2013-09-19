define(['engine/core/Eventable', 'node-uuid', 'engine/core/Exception'], function(Eventable, UUID, Exception) {
    var Base = Eventable.extend({
        _classId: 'Base',

        init: function(options) {
            this._id = null;
            this._parent = null;
            this._children = [];
            this._accessors = [];

            if(undefined !== options &&
                undefined !== options.id) {
                this.id(options.id);
            } else {
                this.id();
            }
        },

        /**
         * Get class ID
         */
        getClassId: function ()
        {
            return this._classId;
        },

        extend: function(prop) {
            //Make sure that classId is provided
            if (!prop._classId) {
                console.log(prop);
                throw('Cannot create a new class without the _classId property!');
            }

            //Check if classId is already in use
            if (ClassRegister[prop._classId]) {
                throw('Cannot create class, _classId "' + prop._classId + '" already been exists');
            }

            var Class = Eventable.prototype.extend.call(this, prop);

            return Class;
        },

        /**
         * Get / Set the object ID
         */
        id: function(id) {
            if(undefined === id) {
                if(!this._id) {
                    //Generate a new ID
                    this._id = UUID.v4();
                    //Register
                    engine.registerObject(this);
                }
                return this._id;
            }

            /* User is asking to change ID */
            //Un-register, so it will remove the current ID from the engine
            if(this._id) {
                engine.unRegisterObject(this);
            }

            this._id = id;

            //Register
            engine.registerObject(this);

            return this;
        },

        /**
         * Attach this to parent
         * this will be available via parent[this.getClassId()]
         */
        attach: function(parent, accessor) {
            if(parent === undefined) {
                throw new Exception('Cannot attach to an undefined parent');
            }

            //Before we continue, we must unAtach ourself from our current parent
            this.unAttach();

            //Attach
            this._parent = parent;
            parent._children.push(this);

            //Set accessor
            if(accessor) {
                accessor = (true === accessor ? this.getClassId() : accessor);

                if(this._parent[accessor]) {
                    throw new Exception('Accessor [' + accessor + ']' +  'is already in use.');
                }

                this._parent[accessor] = this;
                this._accessors[accessor] = this;
            }

            this.emit('attached', this._parent);

            return this;
        },

        /**
         * UnAttach this from its parent
         * In case of this typeOf component - this will get destroy();
         */
        unAttach: function() {
            if(!this._parent) {
                return this;
            }

            //Check if its a component, if so - remove its references
            var accessor = this._parent._accessors.pull(this);
            if(accessor) {
                delete this._parent[accessor];
            }

            //Remove parent reference
            delete this._parent;
            //Remove reference from parent
            this._parent._children.pull(this);

            return this;
        },

        destroy: function() {
            this.unAttach();
            engine.unRegisterObject(this);
        },

        /**
         * call the update() method on this, and all childrens
         */
        updateSceneGraph: function() {
            if(false === this.update()) {
                return false; //Stop population
            }

            this._children.eachMethod('updateSceneGraph');

            return true;
        },
        update: function() {
            return true;
        },

        /**
         * call the process() method on this, and all childrens
         */
        processSceneGraph: function() {
            if(false === this.process()) {
                return false; //Stop population
            }

            this._children.eachMethod('processSceneGraph');

            return true;
        },
        process: function() {
            return true;
        }
    });

//  if (typeof(mo~dule) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Base; }
    return Base;
});