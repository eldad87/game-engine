define(['ThreeBaseRenderable'],
    function(ThreeBaseRenderable) {
        var ThreeSeaBaseRenderable = ThreeBaseRenderable.extend({
            _classId: 'ThreeSeaBaseRenderable',

            playAnimation: function(name) {
                if(undefined === name) {
                    return this._currentAnimation;
                }
                this._currentAnimation = name;
                this._mesh.play(name);

                return this;
            },

            _playAnimation: function(name) {
                //We're using SEA file format, there is now need to handle animation
            }
        });

        return ThreeSeaBaseRenderable;
});