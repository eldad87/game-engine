Eventable = require('./Eventable');
UUID = require('node-uuid');

var Entity = Eventable.extend({
	_classId: 'Entity',

	init: function(id) {
		this._id = null;
		this._parent = null;
		this._children = [];
		this._accessors = [];

		this.id(id);
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
		if(id == undefined) {
			if(!this._id) {
				//Generate a new ID
				this._id = UUID.v4();
			}

			return this._id;
		}


		/* User is asking to change ID */
		//Unregister, so it will remove the current ID from the engine
		engine.unRegisterEntity(this);
		//Set the new ID
		this._id = id;
		//Register again
		engine.registerEntity(this);

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
			if(this._parent[this.getClassId()]) {
				throw new Exception('Accessor name [' + this.getClassId() + ']' +  'is already in use.');
			}

			this._parent[this.getClassId()] = this;
			this._accessors.push(this);
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
		if (this._parent[classId] && 
				this._parent._accessors.indexOf(this) > -1) {
			this._parent._accessors.pull(this);
		}

		var parent = this._parent;
		
		//Remove parent reference
		delete this._parent;
		//Remove reference from parent
		this._parent._children.pull(this);
		
		this.emit('unattached', this._parent);

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