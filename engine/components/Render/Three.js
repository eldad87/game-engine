define(['engine/core/Base', 'engine/core/Point',
    'THREE', 'lib/three.js/examples/js/Detector', 'underscore', 'engine/core/Exception'],
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
             * Init ThreeJS renderer
             *  Create a a WebGL/Canvas Renderer.
             *
             * @param options {  width: window.innerWidth,
             *                   height: window.innerHeight,
             *                   'appendToElement': document.getElementById('renderer')}
             */
            init: function(options) {
                Base.prototype.init.call(this);

                options = _.defaults(options, this._defaultOptions);

                //Detect WebGL support: #http://stackoverflow.com/questions/9899807/three-js-detect-webgl-support-and-fallback-to-regular-canvas
                this._renderer = Detector.webgl ?
                    this.createObject('mainRenderer', 'WebGLRenderer', [{ antialias: true, preserveDrawingBuffer: options.preserveDrawingBuffer }]) :
                    this.createObject('mainRenderer', 'CanvasRenderer', [{ antialias: true, preserveDrawingBuffer: options.preserveDrawingBuffer }]);

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
                    this.createSceneObject('AxisHelper', 'AxisHelper', [100])
                }
            },

            /**
             * Create a basic plane
             *
             * @param width - total plane width
             * @param height - total plane height
             * @param textureName - texture name
             * @param textureRepeatWidth - How many times the texture will repeat itself on the plane WIDTH
             *                              Texture will scale itself if needed.
             * @param textureRepeatHeight - How many times the texture will repeat itself on the plane HEIGHT
             *                              Texture will scale itself if needed.
             * @returns {*}
             */
            setPlane: function(width, height, textureName, textureRepeatWidth, textureRepeatHeight) {
                var floorTexture = engine.threeLoader.getTexture(textureName);

                floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
                floorTexture.repeat.set( (textureRepeatWidth || width/floorTexture.image.naturalWidth) , (textureRepeatHeight || height/floorTexture.image.naturalHeight) ); //Default 1 texture per 'tile'
                var plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 10, 10), new THREE.MeshLambertMaterial({map: floorTexture, side: THREE.DoubleSide}));
                plane.position.y = 0;
                plane.rotation.x = Math.PI / 2;
                if(this.shadow()) {
                    plane.receiveShadow = true;
                }

                if(this._debug) {
                    this.createSceneObject('GridHelper', 'GridHelper', [Math.max(options.width, options.height)*2, 8]);
                }

                this.addToScene(plane);

                return this;
            },

            /**
             * Enable / Disable shadow
             * @param val
             * @returns {*}
             */
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
                THREE.AnimationHandler.update( engine.deltaUptime() );

                this._renderer.render(this._scene, this._objs[this._mainCamera]);
            },

            /**
             * Get object by its identifier
             * @param identifier
             * @returns {*}
             */
            getObject: function(identifier) {
                return this._objs[identifier];
            },

            /**
             * Create a new ThreeJS object
             * @param identifier - object identifier
             * @param name - Three object name, I.e Scene
             * @param args - init arguments
             * @returns {*}
             */
            createObject: function(identifier, name, args) {
                if(undefined === args) {
                    args = [];
                }
                args.unshift(THREE[name]);
                var obj = new (THREE[name].bind.apply(THREE[name],args))();
                this._objs[identifier] = obj;

                return obj;
            },

            /**
             * Add object to scene
             * @param object
             * @returns {*}
             */
            addToScene: function(object) {
                this._scene.add(object);
                return this;
            },

            /**
             * Remove object from scene
             * @param object
             * @returns {*}
             */
            removeFromScene: function(object) {
                this._scene.remove(object);
                return this;
            },

            /**
             * Same as createObject + addToScene
             * @param identifier
             * @param name
             * @param args
             * @returns {*}
             */
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

            /**
             * Set main camera by its identifier
             * @param identifier
             * @returns {*}
             */
            setMainCamera: function(identifier) {
                this._mainCamera = identifier;

                return this;
            },

            /**
             * Resize handler
             * @param width
             * @param height
             * @returns {*}
             */
            onResize: function(width, height) {
                this._renderer.setSize(width, height);

                var camera = this.getObject(this._mainCamera);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();

                return this;
            },

            /**
             * Get all entities in given area
             * @param x
             * @param z
             * @param width
             * @param height
             * @param inGroup
             * @return array of entities' id
             */
            getEntitiesInSelection: function(x, z, width, height, inGroup) {
                var self = this,
                    entitiesMap = [],
                    color = 0,
                    colors = [],
                    ids = [],
                    pickingGeometry = new THREE.Geometry(),
                    pickingMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } ),
                    pickingScene = new THREE.Scene(),
                    pickingTexture = new THREE.WebGLRenderTarget( this._renderer.domElement.width, this._renderer.domElement.height),
                    cloneMesh,
                    entities = inGroup ?
                        engine.getObjectsByGroup(inGroup) : engine.getRegisteredEntities();

                pickingTexture.generateMipmaps = false;

                //Go over each entity, change its color into its ID
                _.forEach(entities, function(entity) {
                    if(undefined == entity.threeRenderable) {
                        return ;
                    }

                    //Clone entity
                    cloneMesh = entity.threeRenderable.mesh().clone();
                    cloneMesh.material = entity.threeRenderable.mesh().material.clone();
                    cloneMesh.material.map = null;
                    cloneMesh.material.vertexColors = THREE.VertexColors;
                    cloneMesh.geometry = entity.threeRenderable.mesh().geometry.clone();
                    cloneMesh.position.copy( entity.threeRenderable.mesh().position );
                    cloneMesh.rotation.copy( entity.threeRenderable.mesh().rotation );
                    cloneMesh.scale.copy( entity.threeRenderable.mesh().scale );

                    //Cancel shadow
                    cloneMesh.castShadow = false;
                    cloneMesh.receiveShadow  = false;

                    //Set color as entity ID
                    entitiesMap[color] = entity.id();
                    self._applyVertexColors(cloneMesh.geometry, new THREE.Color( color ) );
                    color++;

                    THREE.GeometryUtils.merge( pickingGeometry,  cloneMesh);
                });

                pickingScene.add( new THREE.Mesh( pickingGeometry, pickingMaterial ) );

                //render the picking scene off-screen
                this._renderer.render(pickingScene, this._objs[this._mainCamera], pickingTexture );
                var gl = this._renderer.getContext();

                //read the pixel under the mouse from the texture
                var pixelBuffer = new Uint8Array( 4 * width * height );
                gl.readPixels( x, this._renderer.domElement.height - z, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer );

                //Convert RGB in the selected area back to color
                for(var i=0; i<pixelBuffer.length; i+=4) {
                    if( 0 == pixelBuffer[i] && 0 == pixelBuffer[i+1] && 0 == pixelBuffer[i+2] && 0 == pixelBuffer[i+3] ) {
                        continue;
                    }

                    color = ( pixelBuffer[i] << 16 ) | ( pixelBuffer[i+1] << 8 ) | ( pixelBuffer[i+2] );
                    colors.push(color);
                }
                colors = _.unique(colors);

                //Convert colors to ids
                _.forEach(colors, function(color) {
                    ids.push(entitiesMap[color]);
                });

                return ids;
            },

            _applyVertexColors: function( g, c ) {
                g.faces.forEach( function( f ) {
                    var n = ( f instanceof THREE.Face3 ) ? 3 : 4;
                    for( var j = 0; j < n; j ++ ) {
                        f.vertexColors[ j ] = c;
                    }
                });
            }
        });

        return Three
});
