define(['Eventable', 'node-uuid', 'engine/core/Exception', 'underscore'], function(Eventable, UUID, Exception, _) {

    var Base = Eventable.extend({
        _classId: 'Base',
        /**
         * If set, and attaching this object.
         *  The value of the accessor must be equal to this.
         */
        _forceComponentAccessor: null,

        /**
         * Init object
         *
         * @param options {
         *  id: 'object id'
         * }
         */
        init: function(options) {
            Eventable.prototype.init.call(this, options);

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

            if(engine !== this) {
                //Engine can't attach to himself - recursive
                this.attach(engine);
            }
        },

        /**
         * Get CLASS ID
         */
        getClassId: function ()
        {
            return this._classId;
        },


        /**
         * @inheritDoc
         */
        extend: function(obj) {
            //Make sure that classId is provided
            if (!obj._classId) {
                console.log(obj);
                throw('Cannot create a new class classId property!');
            }

            //Check if classId is already in use
            if (ClassRegister[obj._classId]) {
                throw('Cannot create class, _classId "' + obj._classId + '" already been exists');
            }

            var Class = Eventable.prototype.extend.call(this, obj);

            return Class;
        },

        /**
         * Get / Set the object ID
         *  If no id is provided, UUID is used to generate one.
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

            if(this._id) {
                //User is asking to change ID
                engine.replaceRegisterObjectId(this, id);
            } else {
                //Register
                this._id = id;
                engine.registerObject(this);
            }
            return this;
        },

        /**
         * Attach this to parent
         *  this will be available via parent[this.getClassId()] OR parent[accessor]
         * @param parent
         * @param accessor
         * @returns {*}
         */
        attach: function(parent, accessor) {
            if(parent === undefined) {
                throw new Exception('Cannot attach to an undefined parent');
            }
            if(parent === this) {
                return this; //Can't attach to yourself
            }

            //Check if entity want to force its accessor
            if(undefined !== accessor && undefined !== this._forceComponentAccessor && null !== this._forceComponentAccessor) {
                if(this._forceComponentAccessor !== accessor) {
                    throw new Exception('You cant attach using accessor [' + accessor + '], ' +
                                            'Instead please use [' + this._forceComponentAccessor + ']');
                }
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

            this.trigger('attached', this._parent);

            return this;
        },

        /**
         * UnAttach this from its parent
         * In case of this typeOf component - this will get destroy();
         * @returns {*}
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

            //Remove reference from parent
            this._parent._children.pull(this);
            //Remove parent reference
            delete this._parent;

            return this;
        },

        /**
         * Destroy this object
         *      and call destroy() on his attachments/children (in scene graph)
         * @returns {boolean}
         */
        destroy: function() {
            this.unAttach();
            engine.unRegisterObject(this);

            _.each(this._children, function(element, index){
                this._children[index]['destroy']();
            }, this);

            return true;
        },

        /**
         * call the update() method on this, and his attachments/children (in scene graph)
         */
        updateSceneGraph: function() {
            if(false === this.update()) {
                return false; //Stop population
            }

            _.each(this._children, function(element, index){
                this._children[index]['updateSceneGraph']();
            }, this);

            return true;
        },
        update: function() {
            return true;
        },

        /**
         * call the process() method on this, his attachments/children (in scene graph)
         */
        processSceneGraph: function() {
            if(false === this.process()) {
                return false; //Stop population
            }

            _.each(this._children, function(element, index){
                this._children[index]['processSceneGraph']();
            }, this);

            return true;
        },
        process: function() {
            return true;
        }
    });

    return Base;
});