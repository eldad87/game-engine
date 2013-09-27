define(['engine/components/Render/Three', 'lib/three.js/build/three', 'engine/core/Point', 'underscore', 'lib/three.js/examples/js/controls/OrbitControls'],
    function(Three, THREE, Point, _) {

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
                options = _.extend(this._defaultOptions, options);

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

                    light.onlyShadow = false; //Only used for shadow
                    light.castShadow = true;
                    light.shadowMapDarkness = 0.95;
                    light.shadowDarkness = 0.5;
                    light.shadowCameraVisible = this._debug; // only for debugging

                    // these six values define the boundaries of the yellow box seen above
                    light.shadowCameraNear = options.camera.near;
                    light.shadowCameraFar = options.camera.far;
                    light.shadowCameraLeft = -1 * options.width/80;
                    light.shadowCameraRight = options.width/80;
                    light.shadowCameraTop = options.height/80;
                    light.shadowCameraBottom = -1 * options.height/80;
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
            }
        });

        return ThreeIsometric;
    });