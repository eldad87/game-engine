define(['engine/components/Render/ThreeBaseRenderable', 'lib/three.js/build/three', 'engine/core/Exception', 'underscore'], function (ThreeBaseRenderable, THREE, Exception, _) {
    var ThreeTileMap = ThreeBaseRenderable.extend({
        _classId: 'ThreeTileMap',

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

            this.size = options.size;
            this.tileSize = options.tileSize;
            this.tileset = engine.threeLoader.getTexture('tilesetText2');
            this.tileset.needsUpdate = true;
            this.dataTex = this.packArray(options.layerData);

            this.initShaders();
            this.initUniform();
            this.initPlaneMesh();

            //Load mesh
            options.autoMesh = false;
            ThreeBaseRenderable.prototype.init.call(this, options);

            this._mesh.receiveShadow = true;
            this._mesh.castShadow  = false;
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

                '   gl_FragColor = texture2D(tileset, (offset + coord) * inverseTilesetSize);' //grab tile from tileset

            ].join('\n');

            this.fShader = this.fShader.replace("void main() {", fShaderMain).replace("gl_FragColor = vec4( vec3 ( 1.0 ), opacity );", '');
        },

        initUniform: function() {
            //this._uniforms = window._uniforms =  THREE.UniformsUtils.clone(lambertShader.uniforms);

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

        initPlaneMesh: function() {
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
            this._mesh.position.y =  0;
            this._mesh.rotation.x = - Math.PI / 2;

            if(engine.threeRenderer.shadow()) {
                this._mesh.receiveShadow = true;
            }
            this._mesh.receiveShadow = true;
        }

    });

    return ThreeTileMap;
});