define(['engine/core/Base', 'engine/core/Point', 'THREE'],
    function(Base, Point, THREE) {

        var RTSCommand = Base.extend({

            init: function(options) {
                Base.prototype.init.call(this, options);
                engine.threeRenderer._renderer.domElement.addEventListener( 'mousedown', this.onMouseDown.bind(this) );
                engine.threeRenderer._renderer.domElement.addEventListener( 'mouseup', this.onMouseUp.bind(this) );
                engine.threeRenderer._renderer.domElement.addEventListener( 'mousemove', this.onMouseMove.bind(this) );

                this.onMouseDownPoint = false;
            },

            onMouseDown: function(event)
            {
                this.onMouseDownPoint = new Point(event.clientX, event.clientY);
            },

            onMouseUp: function(event)
            {
                var onMouseDownPoint = this.onMouseDownPoint.clone();
                this.onMouseDownPoint = false;

                if( onMouseDownPoint.x == event.clientX &&
                    onMouseDownPoint.y == event.clientY ) {
                    this.handleClick(onMouseDownPoint);

                } else {
                    this.handleSelection(onMouseDownPoint, new Point(event.clientX, event.clientY) );
                }
            },

            onMouseMove: function(event)
            {
                //engine.threeRenderer.getEntitiesInSelection(event.clientX, event.clientY, 1, 1, 'army');
                /**
                 * if false === this.onMouseDownPoint
                 *  if holding a building for construction
                 *  if targeting a super-weapon
                 *  if own army is selected and pointing at enemy
                 */
            },

            handleMouseOverEntities: function(entities)
            {

            },

            handleClick: function(point)
            {
                console.log('handleClick: ' + point.x + ', ' + point.y);
                var ids = engine.threeRenderer.getEntitiesAtPoint(point.x, point.y, 'army');
                console.log(ids);
                /**
                 * if targeting a super-weapon
                 * holding a building for construction
                 * If own army is selected
                 *  Clicked on enemy
                 *  Clicked on ground
                 *
                 * if clicked on army entity
                 *  own
                 *  enemy
                 */
            },

            handleSelection: function(startPoint, endPoint)
            {
                console.log('handleSelection');
                var topLeftPointX = startPoint.x < endPoint.x ? startPoint.x : endPoint.x,
                    topLeftPointY = startPoint.y < endPoint.y ? startPoint.y : endPoint.y;
                var ids = engine.threeRenderer.getEntitiesInSelection(topLeftPointX, topLeftPointY, Math.abs(startPoint.x-endPoint.x), Math.abs(startPoint.y-endPoint.y), 'army');
                console.log(ids);
                /**
                 * cancel current selected army
                 * cancel super-weapon holding
                 * cancel building for construction
                 */
            }
        });

        return RTSCommand;
    });