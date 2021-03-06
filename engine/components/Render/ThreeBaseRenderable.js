define(['engine/core/Base', 'engine/core/Exception', 'underscore'],
    function(Base, Exception, _) {
        var ThreeBaseRenderable = Base.extend({
            _classId: 'ThreeBaseRenderable',
            _forceComponentAccessor: 'threeRenderable',
            _defaultOptions: {textureName: null, inverse: false, autoMeshCreation: true},
            /**
             * Point to the parent mesh - if any
             */
            _parentMesh: false,
            /**
             * Object's mesh
             */
            _mesh: null,
            /**
             * Current playing animation
             */
            _currentAnimation: undefined,
            /**
             * Defined animation
             */
            _animations: {},

            /**
             *
             * @param options {  autoMeshCreation: true, - Auto create mesh using the provided meshName + texturename
             *                      meshName: 'mesh type name'
             *                      textureName: 'texture name'
             *                  }
             */
            init: function(options) {
                if(undefined === options) {
                    throw new Exception('No options provided');
                }

                options = _.defaults(options, this._defaultOptions);

                if(options.autoMeshCreation) {
                    if(undefined === options.meshName) {
                        throw new Exception('meshName option is missing in settings')
                    }
                    //Create mesh
                    this._mesh = engine.threeLoader.createMesh(options.meshName, options.textureName, options.inverse);
                }
                if(engine.threeRenderer.shadow()) {
                    this._mesh.castShadow = true;
                    this._mesh.receiveShadow  = true;
                }

                //Base class - attach default to the engine, therefore we must create the mesh above first (in order  for the attach() to work properly)
                Base.prototype.init.apply(this, options);
            },

            /**
             * Return mesh
             * @returns {null}
             */
            mesh: function() {
                return this._mesh;
            },

            /**
             * @inheritDoc
             *  manage the ThreeJS object attachment.
             * @param parent
             * @param accessor
             */
            attach: function(parent, accessor) {
                Base.prototype.attach.call(this, parent, accessor);
                this._attachMesh();

                //When our parent attach itself again - Re attach mesh
                this._parent.on('attached', this._unAttachMesh, this);
                this._parent.on('attached', this._attachMesh, this);
            },

            _attachMesh: function() {
                if(this._parent._parent && this._parent._parent.threeRenderable) {
                    this._parentMesh = this._parent._parent.threeRenderable.mesh();
                    this._parentMesh.add( this.mesh() );
                } else {
                    engine.threeRenderer.addToScene( this.mesh() );
                }
            },

             /**
             * @inheritDoc
             *  manage the ThreeJS object attachment.
             * @returns {*}
             */
            unAttach: function() {
                if(this._parent) {
                    //Remove events
                    this._parent.off('attached', this._unAttachMesh, this);
                    this._parent.off('attached', this._attachMesh, this);
                }

                this._unAttachMesh();
                Base.prototype.unAttach.apply(this);
                return this;
            },

            _unAttachMesh: function() {
                if(this._parentMesh) {
                    this._parentMesh.remove( this.mesh() );
                    this._parentMesh = false;
                } else {
                    engine.threeRenderer.removeFromScene( this.mesh() );
                }
            },

            /**
             * Define object animation
             * @param name
             * @param animOffset - starting frame of animation
             * @param keyframes -  total number of animation frames
             * @param duration - milliseconds to complete animation
             */
            defineAnimation: function(name, animOffset, keyframes, duration) {
                if(undefined !== this._animations[name]) {
                    //throw new Exception('Animation name [' + name + '] already exists!');
                }

                this._animations[name] = {
                    animOffset: animOffset || 0,
                    duration: duration,
                    interpolation: duration / keyframes,
                    lastKeyframe: 0,
                    currentKeyframe: 0
                };

                return this;
            },

            /**
             * Play object animation
             * @param name
             * @returns {*}
             */
            playAnimation: function(name) {
                if(undefined === name) {
                    return this._currentAnimation;
                }

                if(undefined === this._animations[name]) {
                    throw new Exception('Animation name [' + name + '] is missing!');
                }

                this._currentAnimation = name;
                return this;
            },

            _playAnimation: function(name) {
                var settings = this._animations[name];

                var time = engine.getUptime() % settings.duration;
                var keyframe = Math.floor( time / settings.interpolation ) + settings.animOffset;
                if ( keyframe != settings.currentKeyframe ) {

                    this.mesh().morphTargetInfluences[ settings.lastKeyframe ] = 0;
                    this.mesh().morphTargetInfluences[ settings.currentKeyframe ] = 1;
                    this.mesh().morphTargetInfluences[ keyframe ] = 0;

                    this._animations[name].lastKeyframe = settings.currentKeyframe;
                    this._animations[name].currentKeyframe = keyframe;
                }

                this.mesh().morphTargetInfluences[ keyframe ] = ( time % settings.interpolation ) / settings.interpolation;
                this.mesh().morphTargetInfluences[ settings.lastKeyframe ] = 1 - this.mesh().morphTargetInfluences[ keyframe ];
            },

            /**
             * Process geometry and animation
             * @returns {boolean}
             */
            process: function() {
                if(this._parent && this._parent.position) {
                    var point = this._parent.position();
                    this.mesh().position.set(point.x, point.y, point.z);
                }

                if(this._parent && this._parent.rotation) {
                    var point = this._parent.rotation();
                    this.mesh().rotation.set(point.x, point.y, point.z);
                }

                if(this.playAnimation()) {
                    this._playAnimation(this.playAnimation());
                }
                return true;
            },

            /**
             * @inheritDoc
             *  Remove object from ThreeJS
             * @returns {*}
             */
            destroy: function() {
                Base.prototype.destroy.apply(this); //Will call unAttach()

                this._mesh = null;

                //engine.threeRenderer.removeFromScene( this.mesh() );
                return this;
            }
        });

        return ThreeBaseRenderable;
});