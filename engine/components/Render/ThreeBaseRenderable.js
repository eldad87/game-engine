define(['engine/core/Base', 'engine/core/Exception', 'underscore'],
    function(Base, Exception, _) {
        var ThreeBaseRenderable = Base.extend({
            _classId: 'ThreeBaseRenderable',
            _forceComponentAccessor: 'threeRenderable',
            _defaultOptions: {material: 'Lambert', textureName: null, inverse: false},
            _mesh: null,

            init: function(options) {
                Base.prototype.init.apply(this, options);

                if(undefined === options) {
                    throw new Exception('No options provided');
                }
                if(undefined === options.geometryName) {
                    throw new Exception('geometryName option is missing in settings')
                }

                options = _.extend(this._defaultOptions, options);

                //Set mesh
                this.mesh(
                    engine.threeLoader.createMesh(options.geometryName, options.material, options.textureName, options.inverse)
                );
            },

            mesh: function(mesh) {
                if(undefined === mesh) {
                    return this._mesh;
                }

                //Check if mesh already exists
                if(this._mesh) {
                    //Remove mesh from renderer
                    engine.threeRenderer.removeFromScene( this._mesh );
                }

                mesh.scale.set(2,2,2);

                if(engine.threeRenderer.shadow()) {
                    mesh.castShadow = true;
                    mesh.receiveShadow  = false;
                }

                this._mesh = mesh;
                //Add mesh to threeRenderer
                engine.threeRenderer.addToScene( this._mesh );

                return this;
            },

            process: function() {
                var point = this._parent.geometry();
                this.mesh().position.set(point.x, point.y, point.z);
                return true;
            },

            destroy: function() {
                engine.threeRenderer.removeFromScene( this.mesh() );
                return this;
            }
        });

        return ThreeBaseRenderable;
});