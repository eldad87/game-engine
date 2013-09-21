define(['engine/core/Base', 'engine/core/Point', 'lib/three.js/build/three', 'lib/three.js/examples/js/Detector', 'lib/underscore/underscore', 'engine/core/Exception'],
    function(Base, Point, THREE, Detector, _, Exception) {

        var Three = Base.extend({
            _classId: 'Three',

            _start: false,
            _renderer: null,
            _scene: null,
            _cameras: {},
            _mainCamera: null,
            _pointLight: {},

            /**
             *
             * @param options {  width: window.innerWidth,
             *                   height: window.innerHeight,
             *                   'appendToElement': document.getElementById('renderer')}
             */
            init: function(options) {
                Base.prototype.init.call(this);

                if(undefined === options) {
                    throw new Exception('No settings found');
                }
                options = _.extend({width: 1920, height: 1080}, options);


                //Detect WebGL support: #http://stackoverflow.com/questions/9899807/three-js-detect-webgl-support-and-fallback-to-regular-canvas
                this._renderer = Detector.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();

                this._renderer.setSize(options.width, options.height);
                //Append renderer to view
                options.appendToElement.appendChild( this._renderer.domElement );

                //Init scene
                this._scene = new THREE.Scene();
            },

            start: function(val) {
                if(undefined === val) {
                    return this._start;
                }

                this._start = val;
                return this;
            },

            /**
             * Render to screen!
             */
            process: function() {
                Base.prototype.process.call(this);

                this._renderer.render(this._scene, this._cameras[this._mainCamera ]);
            },

            getRenderer: function() {
                return this._renderer;
            },

            /**
             * Create camera
             * @param identifier
             * @param cameraType
             * @param viewAngle
             * @param aspect
             * @param near
             * @param far
             * @param point - Point
             * @param mainCamera
             * @returns {*}
             */
            addCamera: function(identifier, cameraType, viewAngle, aspect, near, far, point, mainCamera) {
                switch(cameraType) {
                    case 'Perspective':
                        var camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far );
                        break;
                    default:
                        throw new Exception('Unknown cammera type [' + cameraType + ']');
                }

                camera.position.x = point.x;
                camera.position.y = point.y;
                camera.position.z = point.z;

                this._scene.add( camera );

                this._cameras[identifier] = camera;
                if(mainCamera) {
                    this._mainCamera = identifier;
                }

                return this;
            },

            /**
             * Get camera
             * @param identifier
             * @returns {*}
             */
            getCamera: function(identifier) {
                if(undefined === this._cameras[identifier]) {
                    throw new Exception('Camera [' + identifier + '] not found!')
                }

                return this._cameras[identifier];
            },

            /**
             * Add point of light
             * @param identifier
             * @param color
             * @param point - Point
             * @returns {*}
             */
            addPointLight: function(identifier, color, point) {
                var pointLight =
                    new THREE.PointLight(color);

                // set its position
                pointLight.position.x = point.x;
                pointLight.position.y = point.y;
                pointLight.position.z = point.z;

                // add to the scene
                this.addToScene(pointLight);
                this._pointLight[identifier] = pointLight;

                return this;
            },

            /**
             * Get PointLight
             * @param identifier
             * @returns {*}
             */
            getPointLight: function(identifier) {
                if(undefined === this._cameras[identifier]) {
                    throw new Exception('PointLight [' + identifier + '] not found!')
                }

                return this._pointLight[identifier];
            },

            addToScene: function(object) {
                this._scene.add(object);
                return this;
            }
        });

        return Three
});
