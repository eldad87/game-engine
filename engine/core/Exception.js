/**
 * Exception
 */
define([], function() {
    var Exception = function Exception(message) {
       this.message = message;
       this.name = "Exception";
    }

//    if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Exception; }
    return Exception;
});