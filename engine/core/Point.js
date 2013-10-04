define([], function () {
    //https://github.com/GoodBoyDigital/pixi.js/blob/master/src/pixi/core/Point.js
    var Point = function(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    Point.prototype.clone = function()
    {
        return new Point(this.x, this.y, this.z);
    }

    return Point;
});