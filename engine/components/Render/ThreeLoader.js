define(['engine/core/Base', 'THREE', 'underscore', 'engine/core/Exception'],
    function(Base, THREE, _, Exception) {

        var ThreeLoader = Base.extend({
            _classId: 'ThreeLoader',
            _forceComponentAccessor: 'threeLoader',

            _totalCount: 0,
            _loadedCount: 0,

            _meshes: {},
            _textures: [],

            _onProgressCallback: function(loaded, total) {

            },

            setOnProgressCallback: function(callback) {
                this._onProgressCallback = callback;

                return this;
            },

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
                    for (var i = 0; i < materials.length; i++) {
                        materials[i].morphTargets = true;
                    }

                    var material = new THREE.MeshFaceMaterial( materials );
                    var mesh = new THREE.Mesh( geometry, material );
                    self._meshes[name] = mesh;

                    self._loadedCount++;

                    //Callback
                    self._onProgressCallback.call(self, self._loadedCount, self._totalCount);
                });

                return this;
            },

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
                    self._onProgressCallback.call(self, self._loadedCount, self._totalCount);
                });

                return this;
            },

            getTexture: function(name) {
                if(undefined === this._textures[name]) {
                    throw new Exception('Texture Name [' + name + '] doest NOT exists');
                }

                return this._textures[name];
            },

            getMesh: function(name) {
                if(undefined === this._meshes[name]) {
                    throw new Exception('Mesh Name [' + name + '] doest NOT exists');
                }

                return this._meshes[name];
            },

            createMesh: function( meshName, textureName, inverse) {
                var mesh = this.getMesh(meshName).clone();
                for(var i = 0; i <  mesh.material.materials.length; i++){
                    mesh.material.materials[i].map = textureName ? this.getTexture(textureName) : null;
                    mesh.material.materials[i].shading = THREE.SmoothShading;
                    mesh.material.materials[i].blending = THREE.AdditiveBlending;
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