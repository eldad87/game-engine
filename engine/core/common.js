/************************/
/*   Basic extensions   */
/************************/
engine = null;
ClassRegister = {};

(function() {
	if(typeof(window) != 'undefined') {
		var vendors =[ 'ms', 'moz', 'webkit', 'o' ];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
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
 * Exception
 */
function Exception(message) {
   this.message = message;
   this.name = "Exception";
}

/**
 * Make property non-enumerable.
 */
Object.defineProperty(Array.prototype, 'clone', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Clones the array and returns a new non-referenced
 * array.
 * @return {*}
 */
Array.prototype.clone = function () {
	var i, newArray = [];
	for (i in this) {
		if (this.hasOwnProperty(i)) {
			if (this[i] instanceof Array) {
				newArray[i] = this[i].clone();
			} else {
				newArray[i] = this[i];
			}
		}
	}

	return newArray;
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
 * Removes the passed item from an array, the opposite of push().
 * @param item
 * @return {*}
 */
Array.prototype.pull = function (item) {
	var index = this.indexOf(item);
	if (index > -1) {
		this.splice(index, 1);
		return index;
	} else {
		return -1;
	}
};



/**
 * Make property non-enumerable.
 */
Object.defineProperty(Array.prototype, 'eachMethod', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Iterates through an array's items and execure a method on each item
 * @param {Function} callback
 */
Array.prototype.eachMethod = function (eachMethod) {
	var len = this.length,
		i;

	for (i = 0; i < len; i++) {
		this[i][eachMethod]();
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