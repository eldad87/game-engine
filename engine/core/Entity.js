Eventable = require('./Eventable');

var Entity = Eventable.extend({
	_classId: 'Entity',

	init: function(id) {
		this._id = null;
		this._parent = null;
		this._children = [];
		this._components = [];

		this.id(id);
		engine.register(this);
	},

	/**
	 * Creates a new instance of the component(options)
	 * The comonent is attach and available via this[component.getClassId()]
	 */
	addComponent: function (component, options) {
		var newComponent = new component(options);
		newComponent.attach(this);

		//Set the component to this.ClassId
		this[newComponent.getClassId()] = newComponent;

		// Add the entity reference to the component array
		this._components.push(newComponent);

		return this;
	},

	/**
	 * Get / Set the object ID
	 */
	id: function(id) {
		if(id == undefined) {
			if(!this._id) {
				//Generate a new ID
				var uuid = require('node-uuid');
				this._id = uuid.v4();
			}

			return this._id;
		}


		/* User is asking to change ID */
		//Unregister
		engine.unRegister(this);
		//Set the new ID
		this._id = id;
		//Register again
		engine.register(this);

		return this;
	},

	/**
	 * Attach this to parent
	 */
	attach: function(parent, componentName) {
		if(parent === undefined) {
			throw new Exception('Cannot attach to an undefined parent'); 
		}

		//Before we continue, we must unAtach ourself from our current parent
		this.unAttach(); 

		this._parent = parent;
		parent._children.push(this);
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
		if (this._parent[classId] && 
				this._parent._components.indexOf(this) > -1) {

			this._parent._components.pull(this);
			delete this._parent[classId] ;

			if(this.destroy) {
				return this.destroy();
			}
		}

		//Remove reference from parent
		this._parent._children.pull(this);
		
		return this;
	},

	destroy: function() {
		this.unAttach();
	},

	/**
	 * call the update() method on this, and all childrens
	 */
	updateSceneGraph: function() {
		this.update();
		this._children.eachMethod('updateSceneGraph');
	},

	update: function() {

	}
});
if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Entity; }