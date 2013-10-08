define(['engine/components/Render/Three', 'THREE', 'engine/core/Point', 'underscore', 'lib/three.js/examples/js/controls/OrbitControls',
            'lib/three.js/examples/js/postprocessing/EffectComposer',

            'lib/three.js/examples/js/shaders/ColorCorrectionShader',

    'lib/three.js/examples/js/postprocessing/RenderPass',
    'lib/three.js/examples/js/postprocessing/ShaderPass',

    'lib/three.js/examples/js/shaders/SSAOShader',
    'lib/three.js/examples/js/shaders/FXAAShader',
    'lib/three.js/examples/js/shaders/HorizontalTiltShiftShader',
    'lib/three.js/examples/js/shaders/VerticalTiltShiftShader'
],
    function(Three, THREE, Point, _) {

        /**
         * Define an isometric environment
         *  Camera, Controls and light
         *  TODO: improve controls, fog-of-war
         * @type {*}
         */
        var ThreeIsometric = Three.extend({
            _classId: 'ThreeIsometric',
            _forceComponentAccessor: 'threeRenderer',
            _controls: null,

            _defaultOptions: {
                                //Camera
                                camera: {
                                    viewAngle: 45,
                                    aspect: 1920 / 1080,
                                    near: 0.1,
                                    far: 10000,
                                    position: new Point(50, 200, 200),
                                    lookAt:  new Point(0, 0, 0)
                                },
                                //Light
                                light: {
                                    color: 0xffeedd,
                                    position: new Point(1000, 600, 300)
                                }

                            },

            init: function(options) {
                options = _.defaults(options, this._defaultOptions);

                Three.prototype.init.call(this, options);

                //Set perspective camera
                this.createSceneObject('mainCamera', 'PerspectiveCamera',
                                        [options.camera.viewAngle, options.camera.aspect, options.camera.near , options.camera.far ])
                    .setMainCamera('mainCamera')
                //Set point light
                    .createSceneObject('AmbientLight', 'AmbientLight', [options.light.color]);

                //Set camera position
                var mainCamera = this.getObject('mainCamera');
                mainCamera.position.x = options.camera.position.x;
                mainCamera.position.y = options.camera.position.y;
                mainCamera.position.z = options.camera.position.z;
                mainCamera.lookAt(options.camera.lookAt);






                //Set light
                if(this.shadow()) {
                    this.createSceneObject('DirectionalLight', 'DirectionalLight', [0xfff5df, 0.7]);
                    var light = this.getObject('DirectionalLight');
                    light.position.set(options.camera.far/options.camera.aspect, options.camera.far/options.camera.aspect, options.camera.far/options.camera.aspect);
                    light.target.position.set(0, 0, 0);

                    light.onlyShadow = true; //Only used for shadow
                    light.castShadow = true;
                    light.shadowMapDarkness = 0.95;
                    light.shadowDarkness = 0.5;
                    light.shadowCameraVisible = this._debug; // only for debugging

                    // these six values define the boundaries of the yellow box seen above
                    light.shadowCameraNear = options.camera.near;
                    light.shadowCameraFar = options.camera.far;
                    light.shadowCameraLeft = -1 * options.width/options.camera.aspect;
                    light.shadowCameraRight = options.width/options.camera.aspect;
                    light.shadowCameraTop = options.height/options.camera.aspect;
                    light.shadowCameraBottom = -1 * options.height/options.camera.aspect;
                }

                //Set controls
                this._controls = new THREE.OrbitControls( mainCamera, this._renderer.domElement );

                return this;
            },

            process: function() {
                Three.prototype.process.call(this);
                this._controls.update();
            },

            setLightColor: function(hextColor) {
                this.getObject('mainLight').color = this.createObject('color', 'Color', [hextColor]);
                return this;
            },

            onResize: function(width, height) {
                Three.prototype.onResize.call(this, width, height);
                this.getObject('mainCamera').aspect = width / height;
                this.getObject('mainCamera').updateProjectionMatrix();

                return this;
            },

            SSAO: function(options)
            {
                var
                    SCALE = 0.75,

                    effectColor = new THREE.ShaderPass( THREE.ColorCorrectionShader ),
                    effectSSAO = new THREE.ShaderPass( THREE.SSAOShader ),
                    effectFXAA = new THREE.ShaderPass( THREE.FXAAShader ),
                //effectScreen = new THREE.ShaderPass( THREE.ColorCorrectionShader ),

                    hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader ),
                    vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );


                var bluriness = 4;

                hblur.uniforms[ 'h' ].value = bluriness / ( SCALE * options.width );
                vblur.uniforms[ 'v' ].value = bluriness / ( SCALE * options.height );

                hblur.uniforms[ 'r' ].value = vblur.uniforms[ 'r' ].value = 0.5;

                var renderTargetParametersRGB  = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
                var renderTargetParametersRGBA = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
                var depthTarget = new THREE.WebGLRenderTarget( SCALE * options.width, SCALE * options.height, renderTargetParametersRGBA );
                var colorTarget = new THREE.WebGLRenderTarget( SCALE * options.width, SCALE * options.height, renderTargetParametersRGB );

                //effectScreen.renderToScreen = true;
                vblur.renderToScreen = true;

                //effectScreen.enabled = !tiltShiftEnabled;

                var composer = new THREE.EffectComposer( this._renderer, colorTarget );
                composer.addPass( effectSSAO );
                composer.addPass( effectColor );
                composer.addPass( effectFXAA );
                //composer.addPass( effectScreen );
                composer.addPass( hblur );
                composer.addPass( vblur );


                var camera = this.getObject('mainCamera');
                var FAR = camera.far * 0.8;
                this._scene.fog = new THREE.Fog( 0x000000, 10, FAR );

                effectSSAO.uniforms[ 'tDepth' ].texture = depthTarget;
                effectSSAO.uniforms[ 'size' ].value.set( SCALE * options.width, SCALE * options.height );
                effectSSAO.uniforms[ 'cameraNear' ].value = camera.near;
                effectSSAO.uniforms[ 'cameraFar' ].value = camera.far;
                effectSSAO.uniforms[ 'fogNear' ].value = this._scene.fog.near;
                effectSSAO.uniforms[ 'fogFar' ].value = this._scene.fog.far;
                effectSSAO.uniforms[ 'fogEnabled' ].value = 1;
                effectSSAO.uniforms[ 'aoClamp' ].value = 0.5;
                effectSSAO.uniforms.onlyAO.value = 0;
                effectSSAO.renderToScreen = true;
                effectSSAO.enabled = true;
                effectColor.enabled = true;

                effectFXAA.uniforms[ 'resolution' ].value.set( 1 / ( SCALE * options.width ), 1 / ( SCALE * options.height ) );

                effectColor.uniforms[ 'mulRGB' ].value.set( 1.4, 1.4, 1.4 );
                effectColor.uniforms[ 'powRGB' ].value.set( 1.2, 1.2, 1.2 );

                // depth pass

                var depthPassPlugin = new THREE.DepthPassPlugin();
                depthPassPlugin.renderTarget = depthTarget;
                depthPassPlugin.enabled = true;

                this._renderer.addPrePlugin( depthPassPlugin );

                this._renderer.setClearColor( this._scene.fog.color, 1 );
                this._renderer.autoClear = false;
                this._renderer.autoUpdateObjects = true;
                this._renderer.shadowMapEnabled = true;

            }


        });

        return ThreeIsometric;
    });