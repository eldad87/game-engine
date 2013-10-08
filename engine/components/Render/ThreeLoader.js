define(['engine/core/Base', 'THREE', 'underscore', 'engine/core/Exception', 'SEA3D', 'SEA3DLoader', 'SEA3DDeflate', 'SEA3DLZMA'],
    function(Base, THREE, _, Exception) {

        /**
         * Load textures and JS objects
         * @type {*}
         */
        var ThreeLoader = Base.extend({
            _classId: 'ThreeLoader',
            _forceComponentAccessor: 'threeLoader',

            _totalCount: 0,
            _loadedCount: 0,

            _meshes: {},
            _textures: [],
            _sea: {},

            _onProgressCallback: function(loaded, total, name) {

            },

            /**
             * Set a callback for whenever an object is loaded
             * @param callback
             * @returns {*}
             */
            setOnProgressCallback: function(callback) {
                this._onProgressCallback = callback;

                return this;
            },

            loadSea: function(meshName, seaPath) {
                if(undefined !== this._sea[meshName]) {
                    throw new Exception('SEA [' + meshName + '] Name already exists');
                }

                //Load model
                this._totalCount++;



                var loader = new THREE.SEA3D( false );
                loader.matrixAutoUpdate = true;
                loader.invertCamera = true;

                var self = this;
                loader.onComplete = function( e ) {

                    self._sea[meshName] = loader.getMesh(meshName);

                    self._loadedCount++;
                    self._onProgressCallback.call(self, self._loadedCount, self._totalCount, meshName);


                    /*player.play("idle");
                    player.scale.set( playerConfig.scale, playerConfig.scale, -playerConfig.scale );
                    scene.add( player );*/
                };
                loader.load( seaPath );

                return this;
            },

            getSea: function(name) {
                if(undefined === this._sea[name]) {
                    throw new Exception('Sea Name [' + name + '] doest NOT exists');
                }
                return this._sea[name];
            },

            /**
             * Load JS object
             *  Object is added as MESH
             * @param name
             * @param JSPath
             * @returns {*}
             */
            loadJS: function(name, JSPath) {
                if(undefined !== this._meshes[name]) {
                    throw new Exception('Mesh Name already exists');
                }

                //Load model
                this._totalCount++;
                var self = this,
                    loader = new THREE.JSONLoader();

                loader.load( JSPath, function(geometry, materials){

                    //If no materials - set default
                    if( !materials || materials.length==0) {
                        materials = [new THREE.MeshLambertMaterial()];
                    }

                    // for preparing animation
                    if(undefined !== geometry.morphTargets && geometry.morphTargets.length > 0) {
                        for (var i = 0; i < materials.length; i++) {
                            materials[i].morphTargets = true;
                        }
                    }

                    var material = new THREE.MeshFaceMaterial( materials );
                    var mesh = new THREE.Mesh( geometry, material );
                    self._meshes[name] = mesh;

                    self._loadedCount++;

                    //Callback
                    self._onProgressCallback.call(self, self._loadedCount, self._totalCount, name);
                });

                return this;
            },

            /**
             * Load texture
             * @param name
             * @param texturePath
             * @returns {*}
             */
            loadTexture: function(name, texturePath) {
                if(undefined !== this._textures[name]) {
                    throw new Exception('Texture Name already exists');
                }

                //Load model
                this._totalCount++;
                var self = this,
                    loader = new THREE.ImageLoader();

                loader.load( texturePath, function(image){
                    var texture = new THREE.Texture(image);
                    texture.needsUpdate = true;

                    self._textures[name] = texture;
                    self._loadedCount++;

                    //Callback
                    self._onProgressCallback.call(self, self._loadedCount, self._totalCount, name);
                });

                return this;
            },

            /**
             * Get loaded texture
             * @param name
             * @returns {*}
             */
            getTexture: function(name) {
                if(undefined === this._textures[name]) {
                    throw new Exception('Texture Name [' + name + '] doest NOT exists');
                }

                return this._textures[name];
            },

            /**
             * Get loaded mesh
             * @param name
             * @returns {*}
             */
            getMesh: function(name) {
                if(undefined === this._meshes[name]) {
                    throw new Exception('Mesh Name [' + name + '] doest NOT exists');
                }

                return this._meshes[name];
            },

            /**
             * Clone a loaded mesh + apply a texture to it
             *
             * @param meshName
             * @param textureName
             * @param inverse
             * @returns mesh object
             */
            createMesh: function( meshName, textureName, inverse) {
                var mesh = this.getMesh(meshName).clone();
                mesh.material = mesh.material.clone(); //Clone matirial, otherwise we won't be able to use different textures on it.


                for(var i = 0; i <  mesh.material.materials.length; i++){
                    mesh.material.materials[i].map = textureName ? this.getTexture(textureName) : null;
                    mesh.material.materials[i].shading = THREE.SmoothShading;
                    mesh.material.materials[i].blending = THREE.AdditiveBlending;
                    if(engine.threeRenderer._debug) {
//                        mesh.material.materials[i].wireframe = true;
                    }
                }

                if(inverse) {
                    mesh.geometry.dynamic = true
                    mesh.geometry.__dirtyVertices = true;
                    mesh.geometry.__dirtyNormals = true;

                    mesh.flipSided = true;

                    for(var i = 0; i<mesh.geometry.faces.length; i++) {
                        mesh.geometry.faces[i].normal.x = -1*mesh.geometry.faces[i].normal.x;
                        mesh.geometry.faces[i].normal.y = -1*mesh.geometry.faces[i].normal.y;
                        mesh.geometry.faces[i].normal.z = -1*mesh.geometry.faces[i].normal.z;
                    }
                    mesh.geometry.computeVertexNormals();
                    mesh.geometry.computeFaceNormals();
                }

                return mesh;
            }
        });

        return ThreeLoader;
});