define(['engine/components/Render/Three', 'engine/core/Point', 'underscore'],
    function(Three, Point, _) {

        var ThreeIsometric = Three.extend({
            _classId: 'ThreeIsometric',
            _forceComponentAccessor: 'threeRenderer',

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


                this.createSceneObject('DirectionalLight', 'DirectionalLight', [0xfff5df, 1.2]);
                var light = this.getObject('DirectionalLight');

                light.position.set( 200, 450, 500 );
                light.castShadow = true;
                light.shadowMapWidth = 1024;
                light.shadowMapHeight = 1024;
                light.shadowMapDarkness = 0.95;
                //light.shadowCameraVisible = true;

                light.shadowCascade = true;
                light.shadowCascadeCount = 3;
                light.shadowCascadeNearZ = [ -1.000, 0.995, 0.998 ];
                light.shadowCascadeFarZ  = [  0.995, 0.998, 1.000 ];
                light.shadowCascadeWidth = [ 1024, 1024, 1024 ];
                light.shadowCascadeHeight = [ 1024, 1024, 1024 ];

                return this;
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