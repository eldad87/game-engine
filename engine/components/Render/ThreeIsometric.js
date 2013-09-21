define(['engine/components/Render/Three', 'engine/core/Point', 'underscore'],
    function(Three, Point, _) {

        var ThreeIsometric = Three.extend({
            _classId: 'ThreeIsometric',

            _defaultOptions: {
                                //Camera
                                camera: {
                                    viewAngle: 45,
                                    aspect: 1920 / 1080,
                                    near: 0.1,
                                    far: 10000,
                                    position: new Point(0, 0, 300)
                                },
                                //Light
                                light: {
                                    color: '0xFFFFFF',
                                    position: new Point(10, 50, 130)
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
                    .createSceneObject('mainPointLight', 'PointLight', [options.light.color]);

                //Set camera position
                var mainCamera = this.getObject('mainCamera');
                mainCamera.position.x = options.camera.position.x;
                mainCamera.position.y = options.camera.position.y;
                mainCamera.position.z = options.camera.position.z;

                //Set light position
                var light = this.getObject('mainPointLight');
                light.position.x = options.light.position.x;
                light.position.y = options.light.position.y;
                light.position.z = options.light.position.z;

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