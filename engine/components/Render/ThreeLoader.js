define(['engine/core/Base', 'lib/three.js/build/three', 'underscore', 'engine/core/Exception'],
    function(Base, THREE, _, Exception) {

        var ThreeLoader = Base.extend({
            _classId: 'ThreeLoader',

            _totalCount: 0,
            _loadedCount: 0,

            _geometries: {},
            _textures: [],

            _onProgressCallback: function(loaded, total) {

            },

            setOnProgressCallback: function(callback) {
                this._onProgressCallback = callback;

                return this;
            },

            loadGeometry: function(name, geometryPath) {
                if(undefined !== this._geometries[name]) {
                    throw new Exception('Geometry Name already exists');
                }

                //Load model
                this._totalCount++;
                var self = this,
                    loader = new THREE.JSONLoader();

                loader.load( geometryPath, function(geometry){

                    self._geometries[name] = geometry;
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

            getGeometry: function(name) {
                if(undefined === this._geometries[name]) {
                    throw new Exception('Geometry Name [' + name + '] doest NOT exists');
                }

                return this._geometries[name];
            },

            createMesh: function( geometryName, textureName, material, inverse) {
                var geometry    = this.getGeometry(geometryName),
                    texture     = this.getTexture(textureName),
                    material    = new THREE['Mesh' + material + 'Material']( { map:texture, shading: THREE.SmoothShading, blending: THREE.AdditiveBlending }),
                    mesh        = new THREE.Mesh( geometry, material );

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