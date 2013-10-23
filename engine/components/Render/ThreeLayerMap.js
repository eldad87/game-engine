define(['ThreeBaseRenderable', 'THREE', 'engine/core/Exception', 'underscore'], function (ThreeBaseRenderable, THREE, Exception, _) {
    //http://stackoverflow.com/questions/13516990/render-tmx-map-on-threejs-plane
    //http://stemkoski.github.io/Three.js/Shader-Heightmap-Textures.html
    //http://www.chandlerprall.com/webgl/terrain/
    /**
     * Create a layer map
     * @type {*}
     */
    var ThreeLayerMap = ThreeBaseRenderable.extend({
        _classId: 'ThreeLayerMap',

        init: function(options)
        {
            this.initShaders();
            this.initUniform();
            this.initPlaneMesh(options);

            //Load mesh
            options.autoMeshCreation = false;
            ThreeBaseRenderable.prototype.init.call(this, options);

            //engine.threeLoader.getTexture(options.tileset);
        },

        initShaders: function() {
            this.vShader = [
            'uniform sampler2D bumpTexture;' +
            'uniform float bumpScale;' +

            'varying float vAmount;' +
            'varying vec2 vUV;' +

            'void main()' +
            '{' +
                'vUV = uv;' +
                'vec4 bumpData = texture2D( bumpTexture, uv );' +

                // assuming map is grayscale it doesn't matter if you use r, g, or b.
                'vAmount = bumpData.r;' +

                // move the position along the normal
                'vec3 newPosition = position + normal * bumpScale * vAmount;' +

                'gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );' +
            '}'].join('\n');

            this.fShader = [
            'uniform sampler2D oceanTexture;' +
            'uniform sampler2D sandyTexture;' +
            'uniform sampler2D grassTexture;' +
            'uniform sampler2D rockyTexture;' +
            'uniform sampler2D snowyTexture;' +

            'varying vec2 vUV;' +

            'varying float vAmount;' +

            'void main()' +
            '{' +
                'vec4 water = (smoothstep(0.01, 0.25, vAmount) - smoothstep(0.24, 0.26, vAmount)) * texture2D( oceanTexture, vUV * 10.0 );' +
                'vec4 sandy = (smoothstep(0.24, 0.27, vAmount) - smoothstep(0.28, 0.31, vAmount)) * texture2D( sandyTexture, vUV * 10.0 );' +
                'vec4 grass = (smoothstep(0.28, 0.32, vAmount) - smoothstep(0.35, 0.40, vAmount)) * texture2D( grassTexture, vUV * 20.0 );' +
                'vec4 rocky = (smoothstep(0.30, 0.50, vAmount) - smoothstep(0.40, 0.70, vAmount)) * texture2D( rockyTexture, vUV * 20.0 );' +
                'vec4 snowy = (smoothstep(0.50, 0.65, vAmount))                                   * texture2D( snowyTexture, vUV * 10.0 );' +
                'gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) + water + sandy + grass + rocky + snowy;' + //, 1.0);
            '}'].join('\n');
        },

        initUniform: function() {
            var bumpTexture = engine.threeLoader.getTexture('heightmap');
            bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;
            // magnitude of normal displacement
            var bumpScale   = 200.0;


            var oceanTexture = engine.threeLoader.getTexture('dirt');
            oceanTexture.wrapS = oceanTexture.wrapT = THREE.RepeatWrapping;

            var sandyTexture = engine.threeLoader.getTexture('sand');
            sandyTexture.wrapS = sandyTexture.wrapT = THREE.RepeatWrapping;

            var grassTexture = engine.threeLoader.getTexture('grass');
            grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;

            var rockyTexture = engine.threeLoader.getTexture('rock');
            rockyTexture.wrapS = rockyTexture.wrapT = THREE.RepeatWrapping;

            var snowyTexture = engine.threeLoader.getTexture('snow');
            snowyTexture.wrapS = snowyTexture.wrapT = THREE.RepeatWrapping;

            this._uniforms = window._uniforms = {
                bumpTexture:	{ type: "t", value: bumpTexture },
                bumpScale:	    { type: "f", value: bumpScale },
                oceanTexture:	{ type: "t", value: oceanTexture },
                sandyTexture:	{ type: "t", value: sandyTexture },
                grassTexture:	{ type: "t", value: grassTexture },
                rockyTexture:	{ type: "t", value: rockyTexture },
                snowyTexture:	{ type: "t", value: snowyTexture }
            };
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

            this._plane = new THREE.PlaneGeometry( 1000, 1000, 100, 100 );
            this._mesh = new THREE.Mesh(	this._plane, this._material );
            this._mesh.rotation.x = -Math.PI / 2;
            this._mesh.position.y = -100;
        }
    });

    return ThreeLayerMap;
});