define(['engine/core/Base'], function (Base) {
    var Point = Base.extend({
        _classId: 'Point',

        x: 0,
        y: 0,
        z: 0,

        init: function (x, y, z) {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;

            return this;
        },

        compare: function (point) {
            return point && this.x === point.x && this.y === point.y && this.z === point.z;
        },

        clone: function () {
            return new IgePoint(this.x, this.y, this.z);
        },

        interpolate: function (endPoint, startTime, currentTime, endTime) {
            var totalX = endPoint.x - this.x,
                totalY = endPoint.y - this.y,
                totalZ = endPoint.z - this.z,
                totalTime = endTime - startTime,
                deltaTime = totalTime - (currentTime - startTime),
                timeRatio = deltaTime / totalTime;

            return new Point(endPoint.x - (totalX * timeRatio), endPoint.y - (totalY * timeRatio), endPoint.z - (totalZ * timeRatio));
        }
    });

    return Point;
});