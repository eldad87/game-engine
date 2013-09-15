/************************/
/*   Basic extensions   */
/************************/
engine = null;
ClassRegister = {};

/**
 * http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 * TODO: http://gafferongames.com/game-physics/fix-your-timestep/
 */
(function() {
	if(typeof(window) != 'undefined') {
		var vendors =[ 'ms', 'moz', 'webkit', 'o' ];
		for(var x = 0; x < vendors.length && !requestAnimationFrame; ++x) {
			requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			cancelAnimationFrame =
				window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
		}
	}

	if (typeof(requestAnimationFrame) == 'undefined') {
		var lastTime = 0;
		requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, (1000 / 60) - (currTime - lastTime));
			var id = setTimeout(function() { callback(currTime + timeToCall); },
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if (typeof(cancelAnimationFrame) == 'undefined') {
		cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
}());

/**
 * Make property non-enumerable.
 */
Object.defineProperty(Object.prototype, 'clone', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * 
 * Clone object
 * http://stackoverflow.com/questions/7486085/copying-array-by-value-in-javascript
 * http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
 * http://stackoverflow.com/questions/11299284/javascript-deep-copying-object
 */
Object.prototype.clone = function () {
	var i,
		newObj = (this instanceof Array) ? [] : {};

	for(i in this) {
		if (!this.hasOwnProperty(i)) {
			continue;
		}

		if(typeof this[i] == "object") {
			newObj[i] = this[i].clone();
		} else {
			newObj[i] = this[i]
		}

		return newObj;
	}
};

/**
 * Make property non-enumerable.
 */
Object.defineProperty(Array.prototype, 'pull', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Remove the given item from this
 * https://github.com/angular/angular.js/blob/master/src/Angular.js arrayRemove()
 * work on both objects and arrays
 */
Array.prototype.pull = function (item) {
	var index = this.indexOf(item);
	if (index >= 0) {
		this.splice(index, 1);
		return index;
	} else {
		return -1;
	}
};

function isFunction(value){return typeof value == 'function';}

/**
 * Make property non-enumerable.
 */
Object.defineProperty(Array.prototype, 'eachMethod', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Iterates through an array's items and execute a method on each item
 * @param method
 */
Array.prototype.eachMethod = function (method) {
	var len = this.length,
		i;

	for (i = 0; i < len; i++) {
		this[i][method]();
	}
};

/**
 * Make property non-enumerable.
 */
Object.defineProperty(Number.prototype, 'fixed', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * (4.22208334636).fixed(n) will return fixed point value to n places, default n = 3
 */
Number.prototype.fixed = function (n) {
	n = n || 3; 
	return parseFloat(this.toFixed(n));
};