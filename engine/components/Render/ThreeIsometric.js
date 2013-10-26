define(['engine/core/Base', 'engine/components/Render/Three', 'THREE', 'engine/core/Point', 'underscore', 'lib/three.js/examples/js/controls/OrbitControls',
    'lib/three.js/examples/js/postprocessing/EffectComposer',
    'lib/three.js/examples/js/shaders/CopyShader',
    'lib/three.js/examples/js/shaders/SSAOShader',
    'lib/three.js/examples/js/postprocessing/RenderPass',
    'lib/three.js/examples/js/postprocessing/ShaderPass',


            'lib/three.js/examples/js/shaders/ColorCorrectionShader',
            'lib/three.js/examples/js/shaders/FXAAShader',
            'lib/three.js/examples/js/shaders/VignetteShader',
            'lib/three.js/examples/js/shaders/HorizontalTiltShiftShader',
            'lib/three.js/examples/js/shaders/VerticalTiltShiftShader'
],
    function(Base, Three, THREE, Point, _) {

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

                this.SSAO(options);

                return this;
            },

            process: function() {
                Base.prototype.process.call(this);
                THREE.AnimationHandler.update( engine.deltaUptime() );
                //this.group.rotation.x += engine.deltaUptime() * 0.2;
                //this.group.rotation.y += engine.deltaUptime() * 0.5;
                //console.log(  this.group.rotation.x);
                //Three.prototype.process.call(this);

                this._scene.overrideMaterial = this.depthMaterial;
                this._renderer.render(this._scene, this._objs[this._mainCamera], this.depthTarget);

                this._scene.overrideMaterial = null;
                this.composer.render();

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

            SSAO: function (options)
            {
                // depth

                this.group = new THREE.Object3D();
                this._scene.add( this.group );

                var geometry = new THREE.CubeGeometry( 10, 10, 10 );
                var material = new THREE.MeshLambertMaterial( { color: 0xfff000 } );

                for ( var i = 0; i < 100; i ++ ) {

                    var mesh = new THREE.Mesh( geometry, material );
                    mesh.position.x = Math.random() * 400 - 200;
                    mesh.position.y = Math.random() * 400 - 200;
                    mesh.position.z = 400 + (Math.random() * 400 - 200 );
                    mesh.rotation.x = Math.random();
                    mesh.rotation.y = Math.random();
                    mesh.rotation.z = Math.random();
                    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 10 + 1;
                    this.group.add( mesh );

                }
                // depth

                var depthShader = THREE.ShaderLib[ "depthRGBA" ];
                var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

                this.depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
                this.depthMaterial.blending = THREE.NoBlending;

                // postprocessing
                var camera = this._objs[this._mainCamera];


                this.depthTarget = new THREE.WebGLRenderTarget( options.width, options.height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBuffer: false } );
                this.colorTarget = new THREE.WebGLRenderTarget( options.width, options.height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat, stencilBuffer: false  } );
                this.composer = new THREE.EffectComposer( this._renderer, this.colorTarget );
                this.composer.addPass( new THREE.RenderPass( this._scene, camera ) );



                colorCorrectionPass = new THREE.ShaderPass( THREE.ColorCorrectionShader );
                ssao = new THREE.ShaderPass( THREE.SSAOShader );
                effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
                //var effectVignette = new THREE.ShaderPass( THREE.VignetteShader );
                hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
                vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );

                var vh = 1.6, vl = 1.2;
                colorCorrectionPass.uniforms[ "powRGB" ].value = new THREE.Vector3( vh, vh, vh );
                colorCorrectionPass.uniforms[ "mulRGB" ].value = new THREE.Vector3( vl, vl, vl );
                colorCorrectionPass.enabled = true;


                ssao.uniforms[ 'tDepth' ].value = this.depthTarget;
                ssao.uniforms[ 'size' ].value.set( options.width, options.height  );
                ssao.uniforms[ 'cameraNear' ].value = camera.near;
                ssao.uniforms[ 'cameraFar' ].value = camera.far;
             /*   ssao.uniforms[ 'fogNear' ].value = camera.near;
                ssao.uniforms[ 'fogFar' ].value = camera.far
                ssao.uniforms[ 'fogEnabled' ].value = 1;*/
                ssao.uniforms[ 'aoClamp' ].value = 0.5;
                ssao.renderToScreen = true;
                ssao.enabled = true;

                effectFXAA.uniforms[ 'resolution' ].value.set( 1 / options.width, 1 / options.height );

                var bluriness = 2;
                hblur.uniforms[ 'h' ].value = bluriness / options.width;
                vblur.uniforms[ 'v' ].value = bluriness / options.height;
                hblur.uniforms[ 'r' ].value = vblur.uniforms[ 'r' ].value = 0.5;
                hblur.renderToScreen = true;


                this.composer.addPass( effectFXAA );
                this.composer.addPass( ssao );
                //this.composer.addPass( effectVignette );
                /*this.composer.addPass( hblur );
                this.composer.addPass( vblur );*/
                this.composer.addPass( colorCorrectionPass );
            },

            onResize: function(width, height) {
                Three.prototype.init.call(this, width, height);

                this.depthTarget = new THREE.WebGLRenderTarget( width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false } );
                this.colorTarget = new THREE.WebGLRenderTarget( width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false  } );

                this.composer.reset( this.colorTarget );

                effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
                ssao.uniforms[ 'size' ].value.set( width, height );
                ssao.uniforms[ 'tDepth' ].value = this.depthTarget;


                /*hblur.uniforms[ 'h' ].value = 4 / width;
                vblur.uniforms[ 'v' ].value = 4 / height;*/

            }

        });

        return ThreeIsometric;
    });