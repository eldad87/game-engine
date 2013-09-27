define(['engine/core/Base', 'engine/core/Exception', 'underscore'],
    function(Base, Exception, _) {
        var ThreeBaseRenderable = Base.extend({
            _classId: 'ThreeBaseRenderable',
            _forceComponentAccessor: 'threeRenderable',
            _defaultOptions: {textureName: null, inverse: false},
            _mesh: null,
            _currentAnimation: undefined,
            _animations: {},

            init: function(options) {
                Base.prototype.init.apply(this, options);

                if(undefined === options) {
                    throw new Exception('No options provided');
                }
                if(undefined === options.meshName) {
                    throw new Exception('meshName option is missing in settings')
                }

                options = _.extend(this._defaultOptions, options);

                //Set mesh
                this.mesh(
                    engine.threeLoader.createMesh(options.meshName, options.textureName, options.inverse)
                );
            },

            mesh: function(mesh) {
                if(undefined === mesh) {
                    return this._mesh;
                }

                //Check if mesh already exists
                if(this._mesh) {
                    //Remove mesh from renderer
                    engine.threeRenderer.removeFromScene( this._mesh );
                }

                mesh.scale.set(2,2,2);

                if(engine.threeRenderer.shadow()) {
                    mesh.castShadow = true;
                    mesh.receiveShadow  = false;
                }

                this._mesh = mesh;
                //Add mesh to threeRenderer
                engine.threeRenderer.addToScene( this._mesh );

                return this;
            },

            /**
             *
             * @param name
             * @param keyframes -  total number of animation frames
             * @param duration - milliseconds to complete animation
             * @param animOffset - starting frame of animation
             */
            defineAnimation: function(name, keyframes, duration, animOffset) {
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

            playAnimation: function(name) {
                if(undefined === name) {
                    return this._currentAnimation;
                }

                if(undefined === this._animations[name]) {
                    throw new Exception('Animation name [' + name + '] is missing!');
                }

                return this._currentAnimation = name;
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

            process: function() {
                var point = this._parent.geometry();
                this.mesh().position.set(point.x, point.y, point.z);

                if(this.playAnimation()) {
                    this._playAnimation(this.playAnimation());
                }
                return true;
            },

            destroy: function() {
                engine.threeRenderer.removeFromScene( this.mesh() );
                return this;
            }
        });

        return ThreeBaseRenderable;
});