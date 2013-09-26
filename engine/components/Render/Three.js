define(['engine/core/Base', 'engine/core/Point',
    'lib/three.js/build/three', 'lib/three.js/examples/js/Detector', 'underscore', 'engine/core/Exception'],
    function(Base, Point, THREE, Detector, _, Exception) {

        var Three = Base.extend({
            _classId: 'Three',
            _forceComponentAccessor: 'threeRenderer',

            _debug: true,
            _shadow: true,
            _start: false,
            _renderer: null,
            _scene: null,
            _objs: {},
            _mainCamera: null,
            _defaultOptions: {debug: true, shadow: true, width: 1920, height: 1080},

            /**
             *
             * @param options {  width: window.innerWidth,
             *                   height: window.innerHeight,
             *                   'appendToElement': document.getElementById('renderer')}
             */
            init: function(options) {
                Base.prototype.init.call(this);

                options = _.extend(this._defaultOptions, options);

                //Detect WebGL support: #http://stackoverflow.com/questions/9899807/three-js-detect-webgl-support-and-fallback-to-regular-canvas
                this._renderer = Detector.webgl ? this.createObject('mainRenderer', 'WebGLRenderer') : this.createObject('mainRenderer', 'CanvasRenderer', [{ antialias: true }]);

                this.shadow(options.shadow);


                if(this.shadow()) {
                    this._renderer.shadowMapEnabled = true;
                    this._renderer.shadowMapSoft = true;
                    this._renderer.shadowMapType = THREE.PCFSoftShadowMap;
                    this._renderer.physicallyBasedShading = true;
                }


                this._renderer.setSize(options.width, options.height);
                //Append renderer to view
                options.appendToElement.appendChild( this._renderer.domElement );

                //Init scene
                this._scene = this.createObject('mainScene', 'Scene');

                this._debug = options.debug;
                if(this._debug) {
                    this.createSceneObject('AxisHelper', 'AxisHelper', [100]);
                    this.createSceneObject('GridHelper', 'GridHelper', [Math.max(options.width, options.height), 1]);
                }
            },

            setPlane: function(textureName, repeatX, repeatY) {
                var floorTexture = engine.threeLoader.getTexture(textureName);
                floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
                floorTexture.repeat.set(repeatX, repeatY);
                var plane = new THREE.Mesh(new THREE.PlaneGeometry(repeatX, repeatY), new THREE.MeshLambertMaterial({map: floorTexture, side: THREE.DoubleSide}));
                plane.position.y = 0;
                plane.rotation.x = Math.PI / 2;
                if(this.shadow()) {
                    plane.receiveShadow = true;
                }
                this.addToScene(plane);

                return this;
            },

            shadow: function(val) {
                if(undefined === val) {
                    return this._shadow;
                }

                this._shadow = val;
                return this;
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

                this._renderer.render(this._scene, this._objs[this._mainCamera]);
            },

            getObject: function(identifier) {
                return this._objs[identifier];
            },

            createObject: function(identifier, name, args) {
                if(undefined === args) {
                    args = [];
                }
                args.unshift(THREE[name]);
                var obj = new (THREE[name].bind.apply(THREE[name],args))();
                this._objs[identifier] = obj;

                return obj;
            },

            addToScene: function(object) {
                this._scene.add(object);
                return this;
            },
            removeFromScene: function(object) {
                this._scene.remove(object);
                return this;
            },

            createSceneObject: function(identifier, name, args) {
                var obj = this.createObject(identifier, name, args);

                this.addToScene(
                    obj
                );

                if(this._debug) {
                    if( ['Camera', 'OrthographicCamera', 'PerspectiveCamera'].indexOf(name) > -1 ) { //Camera
                        this.createSceneObject('CameraHelper', 'CameraHelper', [obj]);
                    }
                }

                return this;
            },

            setMainCamera: function(identifier) {
                this._mainCamera = identifier;

                return this;
            },

            onResize: function(width, height) {
                this._renderer.setSize(width, height);

                return this;
            }
        });

        return Three
});
