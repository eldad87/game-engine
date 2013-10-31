define(['ThreeBaseRenderable', 'THREE', 'engine/core/Exception', 'underscore'], function (ThreeBaseRenderable, THREE, Exception, _) {
    //http://stemkoski.github.io/Three.js/Shader-Heightmap-Textures.html
    //http://www.chandlerprall.com/webgl/terrain/

    /**
     * Create a layer map
     * new ThreeLayerMap({
     *      maskTexture: ['grass_mask', 'pavel_mask', 'rock_mask'], //Texture masks
     *      tilesTexture: ['dirt_tile', 'grass_tile', 'tile_tile'], //Textures
     *      tilesSegments: 10, //how many tiles segments will be, 10 = each tile will placed 10x10 times on the grid
     *      width: 1000,
     *      height: 1000
     *  });
     * @type {*}
     */
    var ThreeLayerMap = ThreeBaseRenderable.extend({
        _classId: 'ThreeLayerMap',

        init: function(options)
        {
            if(!options) {
                throw new Exception('Missing parameters');
            }

            if(undefined === options.width) {
                throw new Exception('width is missing');
            }
            if(undefined === options.height) {
                throw new Exception('height is missing');
            }
            if(undefined === options.maskTexture) {
                throw new Exception('maskTexture is missing');
            }
            if(undefined === options.tilesTexture) {
                throw new Exception('tilesTexture is missing');
            }
            if(options.maskTexture.length != options.tilesTexture.length) {
                throw new Exception('tilesTexture and maskTexture length must be identical');
            }
            if(undefined === options.tilesSegments) {
                throw new Exception('tilesSegments is missing');
            }

            this.initShaders(options);
            this.initUniform(options);
            this.initPlaneMesh(options);

            //Load mesh
            options.autoMeshCreation = false;
            ThreeBaseRenderable.prototype.init.call(this, options);

            //engine.threeLoader.getTexture(options.tileset);
        },


        initShaders: function(options) {

            this.vShader = [];
            for(var i in options.maskTexture) {
                this.vShader.push( 'uniform sampler2D ' + 'mask_' + options.maskTexture[i] + ';'); //uniform sampler2D mask_grass;
                this.vShader.push( 'varying float ' + 'v_' + options.maskTexture[i] + '_amount;'); //varying float v_grass_amount;
            }

            this.vShader.push('varying vec2 vUV;');

            this.vShader.push('void main()');
            this.vShader.push('{');
            this.vShader.push('vUV = uv;');

            for(var i in options.maskTexture) {
                // assuming map is grayscale it doesn't matter if you use r, g, or b.
                this.vShader.push('v_' + options.maskTexture[i] + '_amount = texture2D( mask_' + options.maskTexture[i] + ', vUV ).r;' ); //v_grass_amount = texture2D( mask_grass, vUV ).r;
            }

            this.vShader.push('gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );');
            this.vShader.push('}');

            this.vShader = this.vShader.join('\n');


            this.fShader = [];
            for(var i in options.tilesTexture) {
                this.fShader.push( 'uniform sampler2D ' + 'tile_' + options.tilesTexture[i] + ';'); //uniform sampler2D tile_grass;
                this.fShader.push( 'varying float ' + 'v_' + options.maskTexture[i] + '_amount;'); //varying float v_grass_amount;
            }

            this.fShader.push('varying vec2 vUV;');

            this.fShader.push('void main()');
            this.fShader.push('{');

            for(var i in options.tilesTexture) {
                //Calc how 'Strong' the texture should be
                this.fShader.push( 'float per_' + options.tilesTexture[i] + ' = 100.0 / 256.0 * v_' + options.maskTexture[i] + '_amount;'); //float per_grass = 100.0 / 256.0 * v_grass_amount;
                this.fShader.push('vec4 color_' + options.tilesTexture[i] + ' = per_' + options.tilesTexture[i] + ' * texture2D( tile_' + options.tilesTexture[i] + ', vUV * ' + options.tilesSegments.toFixed(1) + ' );'); //vec4 color_grass = per_grass * texture2D( tile_grass, vUV * 10.0);
            }

            this.fShader.push('vec4 color = vec4(0.0, 0.0, 0.0, 0.0)'); //vec4 color = vec4(0.0, 0.0, 0.0, 0.0)
            for(var i in options.tilesTexture) {

                this.fShader.push(' + color_' + options.tilesTexture[i]); // + color_grass
            }
            this.fShader.push(';'); // ;

            this.fShader.push('if ( color.a < 0.1 ) discard;'); //If empty, make it transparent
            this.fShader.push('gl_FragColor = color;');

            this.fShader.push('}');
            this.fShader = this.fShader.join('\n');
        },

        initUniform: function(options) {

            this._uniforms = {};

            //Add masks + tiles to uniform
            for(var i in options.maskTexture) {
                //Mask
                var tmpMaskTexture = engine.threeLoader.getTexture(options.maskTexture[i]);
                tmpMaskTexture.wrapS = tmpMaskTexture.wrapT = THREE.RepeatWrapping;
                this._uniforms['mask_' + options.maskTexture[i]] = { type: "t", value: tmpMaskTexture };


                //Tile
                var tmpTileTexture = engine.threeLoader.getTexture(options.tilesTexture[i]);
                tmpTileTexture.wrapS = tmpTileTexture.wrapT = THREE.RepeatWrapping;
                this._uniforms['tile_' + options.tilesTexture[i]] = { type: "t", value: tmpTileTexture }
            }
        },

        initPlaneMesh: function(options) {
            // create custom material from the shader code above
            //   that is within specially labelled script tags
            this._material = new THREE.ShaderMaterial(
                {
                    uniforms: this._uniforms,
                    vertexShader:   this.vShader,
                    fragmentShader: this.fShader
                    // side: THREE.DoubleSide
                }   );

            this._plane = new THREE.PlaneGeometry( options.width, options.height, options.tilesSegments, options.tilesSegments );
            this._mesh = new THREE.Mesh( this._plane, this._material );
            this._mesh.rotation.x = -Math.PI / 2;
            this._mesh.position.y = -100;
        }
    });

    return ThreeLayerMap;
});