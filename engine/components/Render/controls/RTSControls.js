define(['engine/core/Base', 'engine/core/Point', 'THREE', 'underscore', 'engine/core/Exception'],
    function(Base, Point, THREE, _, Exception) {

    var RTSControls = Base.extend({

        init: function(camera, domElement) {
            Base.prototype.init.call(this);

            this.camera = camera;
            this.domElement = domElement;
            this.enabled = true;
            this.noZoom = false;

            this.target = new THREE.Vector3();

            this.moveRadiusBoarderPercentage = 0.03;
            this.movmentPecentage = 0.03;

            this.domElement.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
            this.domElement.addEventListener( 'mousewheel', this.onMouseWheel.bind(this), false );
            this.domElement.addEventListener( 'DOMMouseScroll', this.onMouseWheel.bind(this), false ); // firefox
        },

        onMouseWheel: function( event ) {
            if ( this.enabled === false  ) return;

            var delta = 0;
            if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
                delta = event.wheelDelta;
            } else if ( event.detail ) { // Firefox
                delta = - event.detail;
            }

            this.zoom(delta);
        },

        onMouseMove: function( event ) {
            if ( this.enabled === false ) { return; }
            event.preventDefault();

            var viewWidth = engine.threeRenderer._renderer.domElement.width,
                viewHeight = engine.threeRenderer._renderer.domElement.height;

            //Top
            if( event.clientY < viewHeight*this.moveRadiusBoarderPercentage) {
                this.moveTop( - (this.movmentPecentage*viewHeight) );
            }
            //Bottom
            if( event.clientY > viewHeight-(viewHeight*this.moveRadiusBoarderPercentage)) {
                this.moveTop(this.movmentPecentage*viewHeight);
            }

            //Right
            if( event.clientX > viewWidth-(viewWidth*this.moveRadiusBoarderPercentage)) {
                this.moveLeft(- (this.movmentPecentage*viewHeight));
            }
            //Left
            if( event.clientX < viewWidth*this.moveRadiusBoarderPercentage) {
                this.moveLeft((this.movmentPecentage*viewHeight));
            }
        },

        zoom: function(distance) {
            var panOffset = new THREE.Vector3();
            panOffset.setY(distance);
            this.target.add(panOffset);
        },
        moveTop: function(distance) {
            var panOffset = new THREE.Vector3();
            panOffset.setX(distance);
            this.target.add(panOffset);
        },
        moveLeft: function(distance) {
            var panOffset = new THREE.Vector3();
            panOffset.setZ(distance);
            this.target.add(panOffset);
        },

        process: function() {
            Base.prototype.process.call(this);

            //Move camera to target
            this.camera.position.add(this.target);

            //Reset target and current
            this.target = new THREE.Vector3();
        }

    });

    return RTSControls;
});