/**
 * Make property non-enumerable.
 */
Object.defineProperty(Object.prototype, 'theSameAs', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Augments all objects with the theSameAs() method. Checks if the
 * property values of this object are equal to the property values
 * of the passed object. If they are the same then this method will
 * return true. Objects must not contain circular references!
 * @param {Object} obj The object to compare this one to.
 * @return {Boolean}
 */
Object.prototype.theSameAs = function (obj) {
	return JSON.stringify(this) === JSON.stringify(obj);
};

/**
 * Iterates through an array's items and calls the callback method
 * passing each item one by one.
 * @param {Function} callback
 */
Object.defineProperty(Array.prototype, 'each', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Iterates through an array's items and calls the callback method
 * passing each item one by one.
 * @param {Function} callback
 */
Array.prototype.each = function (callback) {
	var len = this.length,
		i;

	for (i = 0; i < len; i++) {
		callback(this[i]);
	}
};

/**
 * Iterates through an array's items and calls the callback method
 * passing each item one by one in reverse order.
 * @param {Function} callback
 */
Array.prototype.eachReverse = function (callback) {
	var arrCount = this.length,
		i;

	for (i = arrCount - 1; i >= 0; i--) {
		callback(this[i]);
	}
};

/**
 * Make property non-enumerable.
 */
Object.defineProperty(Array.prototype, 'destroyAll', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Iterates through an array's items and calls each item's
 * destroy() method if it exists.
 */
Array.prototype.destroyAll = function () {
	var arrCount = this.length,
		i;

	for (i = arrCount - 1; i >= 0; i--) {
		if (typeof(this[i].destroy) === 'function') {
			this[i].destroy();
		}
	}
};

/**
 * Make property non-enumerable.
 */
Object.defineProperty(Array.prototype, 'eachIsolated', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Iterates through an array's items and calls the callback method
 * passing each item one by one. Altering the array's structure
 * during the callback method will not affect the iteration of the
 * items.
 *
 * @param {Function} callback
 */
Array.prototype.eachIsolated = function (callback) {
	var arr = [],
		arrCount = arr.length,
		i;

	// Create a copy of the array
	for (i = 0; i < arrCount; i++) {
		arr[i] = this[i];
	}

	// Now iterate the array, passing the copied
	// array value at the index(i). Any changes to
	// "this" will not affect the index(i) values.
	for (i = 0; i < arrCount; i++) {
		callback(arr[i]);
	}
};

/**
 * Make property non-enumerable.
 */
Object.defineProperty(Math, 'PI180', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Stores a pre-calculated PI / 180 value.
 * @type {Number}
 */
Math.PI180 = Math.PI / 180;

/**
 * Make property non-enumerable.
 */
Object.defineProperty(Math, 'PI180R', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Stores a pre-calculated 180 / PI value.
 * @type {Number}
 */
Math.PI180R = 180 / Math.PI;

/**
 * Make property non-enumerable.
 */
Object.defineProperty(Math, 'radians', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Converts degrees to radians.
 * @param {Number} degrees
 * @return {Number} radians
 */
Math.radians = function (degrees) {
	return degrees * Math.PI180;
};

/**
 * Make property non-enumerable.
 */
Object.defineProperty(Math, 'degrees', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Converts radians to degrees.
 * @param {Number} radians
 * @return {Number} degrees
 */
Math.degrees = function (radians) {
	return radians * Math.PI180R;
};

/**
 * Make property non-enumerable.
 */
Object.defineProperty(Math, 'distance', {
	enumerable:false,
	writable:true,
	configurable:true
});

/**
 * Calculates the distance from the first point to the second point.
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @return {Number}
 */
Math.distance = function (x1, y1, x2, y2) {
	return Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
};


/**
 * Adds the indexOf method to all array objects if it does not already exist which
 * would you believe can still happen even in 2012!
 */
if(!Array.prototype.indexOf){
	/**
	 * Make property non-enumerable.
	 */
	Object.defineProperty(Array.prototype, 'indexOf', {
		enumerable:false,
		writable:true,
		configurable:true
	});

	/**
	 * Get the index of the passed item.
	 * @param {*} obj The item to find the index for.
	 * @return {Number} The index of the passed item or -1 if not found.
	 */
	Array.prototype.indexOf = function(obj) {
		var i, l = this.length;
		for (i = 0; i < l; i++) {
			if(this[i] === obj){
				return i;
			}
		}
		return -1;
	};
}
