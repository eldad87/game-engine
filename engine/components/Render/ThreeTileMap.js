define(['ThreeBaseRenderable', 'THREE', 'engine/core/Exception', 'underscore'], function (ThreeBaseRenderable, THREE, Exception, _) {
    //http://stackoverflow.com/questions/13516990/render-tmx-map-on-threejs-plane
    /**
     * Create a tile map
     * @type {*}
     */
    var ThreeTileMap = ThreeBaseRenderable.extend({
        _classId: 'ThreeTileMap',
        _defaultOptions: {position:{ y: 0},  rotation:{x: - Math.PI / 2}},

        /**
         * Create a tile map
         * new ThreeTileMap({
         *      size: new THREE.Vector2(20, 20),
         *      tileSize: new THREE.Vector2(32, 32),
         *      layerData: [13, 2, 1, 2, 1, 2, 1],
         *      tileset: 'tilesetText'
         *  })
         *
         * @param options {
         *  size - Three vector2 of map size
         *  tilesize - Three vector2 of tile size
         *  layerData - TMX layer-data as array
         *  tileset - name of the loaded texture that holds the tile-set
         * }
         */
        init: function(options)
        {
            if(undefined === options.size) {
                throw new Exception('size is missing');
            }
            if(undefined === options.tileSize) {
                throw new Exception('tileSize is missing');
            }
            if(undefined === options.layerData) {
                throw new Exception('layerData is missing');
            }
            if(undefined === options.tileset) {
                throw new Exception('tileset is missing');
            }
            options = _.defaults(options, this._defaultOptions);

            this.size = options.size;
            this.tileSize = options.tileSize;
            this.tileset = engine.threeLoader.getTexture(options.tileset);
            this.tileset.needsUpdate = true;
            this.dataTex = this.packArray(options.layerData);

            this.initShaders();
            this.initUniform();
            this.initPlaneMesh(options);

            //Load mesh
            options.autoMeshCreation = false;
            ThreeBaseRenderable.prototype.init.call(this, options);

            if(engine.threeRenderer.shadow()) {
                this._mesh.receiveShadow = true;
                this._mesh.castShadow  = false;
            }

            if(engine.threeRenderer._debug) {
                var maxTileSize = Math.max(this.tileSize.x, this.tileSize.y);
                var maxSize = Math.max(this.size.x, this.size.y);

                engine.threeRenderer.createSceneObject('GridHelper', 'GridHelper', [maxSize*maxTileSize/2, maxTileSize]);
            }
        },

        packArray: function(layerData) {
            var arrayBuff = new ArrayBuffer(layerData.length * 3),
                array8 = new Uint8Array(arrayBuff),
                dataTex;

            for(var i = 0, y = 0, il = layerData.length; i < il; ++i, y += 3) {
                var value = layerData[i];

                array8[y + 0] = (value & 0x000000ff);
                array8[y + 1] = (value & 0x0000ff00) >> 8;
                array8[y + 2] = (value & 0x00ff0000) >> 16;
            }

            dataTex = new THREE.DataTexture(
                array8,
                this.size.x, //width
                this.size.y, //height
                THREE.RGBFormat, //format
                THREE.UnsignedByteType, //type
                THREE.UVMapping, //mapping
                THREE.ClampToEdgeWrapping, //wrapS
                THREE.ClampToEdgeWrapping, //wrapT
                THREE.NearestFilter, //magFilter
                THREE.NearestMipMapNearestFilter //minFilter
            );
            dataTex.needsUpdate = true;

            return dataTex;
        },

        initShaders: function() {
            var lambertShader = THREE.ShaderLib['lambert'];

            this.vShader = [
                'varying vec2 pixelCoord;',
                'varying vec2 texCoord;',

                'uniform vec2 mapSize;',
                'uniform vec2 inverseLayerSize;',

                'uniform vec2 inverseTileSize;'
            ].join('\n') + "\n" + lambertShader.vertexShader;

            var vShaderMain = [
                'void main() {',
                '   pixelCoord = (uv * mapSize);',
                '   texCoord = pixelCoord * inverseLayerSize * inverseTileSize;',
                '   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);' //hand this position to WebGL

            ].join('\n');

            this.vShader = this.vShader.replace("void main() {", vShaderMain);



            this.fShader = [
                'varying vec2 pixelCoord;',
                'varying vec2 texCoord;',

                'uniform vec2 inverseTilesetSize;',

                'uniform vec2 tileSize;',
                'uniform vec2 numTiles;',

                'uniform sampler2D tileset;',
                'uniform sampler2D tileIds;',

                'float decode24(const in vec3 rgb) {',
                '   const vec3 bit_shift = vec3((256.0*256.0), 256.0, 1.0);',
                '   float fl = dot(rgb, bit_shift);', //shift the values appropriately
                '   return fl * 255.0;', //denormalize the value
                '}'
            ].join('\n') + "\n" + lambertShader.fragmentShader;

           var fShaderMain = [
                'void main() {',
                '   vec3 tileId = texture2D(tileIds, texCoord).rgb;', //grab this tileId from the layer data
                '   tileId.rgb = tileId.bgr;', //flip flop due to endianess
                '   float tileValue = decode24(tileId);', //decode the normalized vec3 into the float ID
                '   vec2 tileLoc = vec2(mod(tileValue, numTiles.x) - 1.0, floor(tileValue / numTiles.x));', //convert the ID into x, y coords;
                '   tileLoc.y = numTiles.y - 1.0 - tileLoc.y;', //convert the coord from bottomleft to topleft

                '   vec2 offset = floor(tileLoc) * tileSize;', //offset in the tileset
                '   vec2 coord = mod(pixelCoord, tileSize);', //coord of the tile.

                '   vec4 color = texture2D(tileset, (offset + coord) * inverseTilesetSize);', //grab tile from tileset'
                '   if ( color.a < 0.1 ) discard;', //If tile is white, make it transparent
                '   gl_FragColor = color;',
            ].join('\n');

            this.fShader = this.fShader.replace("void main() {", fShaderMain).replace("gl_FragColor = vec4( vec3 ( 1.0 ), opacity );", '');
        },

        initUniform: function() {
            var lambertShader = THREE.ShaderLib['lambert'];
            var uniforms = THREE.UniformsUtils.clone(lambertShader.uniforms);
            this._uniforms = window._uniforms = _.extend(uniforms,
                {
                mapSize:            { type: 'v2', value: new THREE.Vector2(this.size.x * this.tileSize.x, this.size.y * this.tileSize.y) },
                inverseLayerSize:   { type: 'v2', value: new THREE.Vector2(1 / this.size.x, 1 / this.size.y) },
                inverseTilesetSize: { type: 'v2', value: new THREE.Vector2(1 / this.tileset.image.width, 1 / this.tileset.image.height) },

                tileSize:           { type: 'v2', value: this.tileSize },
                inverseTileSize:    { type: 'v2', value: new THREE.Vector2(1 / this.tileSize.x, 1 / this.tileSize.y) },
                numTiles:           { type: 'v2', value: new THREE.Vector2(this.tileset.image.width / this.tileSize.x, this.tileset.image.height / this.tileSize.y) },

                tileset:            { type: 't', value: this.tileset },
                tileIds:            { type: 't', value: this.dataTex }
            });
        },

        initPlaneMesh: function(options) {
            /** Create plane */
           this._material = new THREE.ShaderMaterial({
                uniforms: this._uniforms,
                vertexShader: this.vShader,
                fragmentShader: this.fShader,
                transparent: (this.opacity === 0),
                lights:			true,
                side: THREE.DoubleSide,

                fog: true
            });
            this._material.shading = THREE.SmoothShading;

            this._plane = new THREE.PlaneGeometry(
                this.size.x * this.tileSize.x,
                this.size.y * this.tileSize.y
            );

            this._mesh = new THREE.Mesh(this._plane, this._material);
            this._mesh.position.y =  options.position.y;
            this._mesh.rotation.x = options.rotation.x;

            if(engine.threeRenderer.shadow()) {
                this._mesh.receiveShadow = true;
            }
            this._mesh.receiveShadow = true;
        }

    });

    return ThreeTileMap;
});