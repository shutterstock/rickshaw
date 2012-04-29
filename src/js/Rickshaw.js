Rickshaw = {

	namespace: function(namespace, obj) {

		var parts = namespace.split('.');

		// for rudimentary compatibility w/ node
		var root = typeof global != 'undefined' ? global : window;

		var parent = root.Rickshaw;

		for(var i = 1, length = parts.length; i < length; i++) {
			currentPart = parts[i];
			parent[currentPart] = parent[currentPart] || {};
			parent = parent[currentPart];
		}
		return parent;
	},

	keys: function(obj) {
		var keys = [];
		for (var key in obj) keys.push(key);
		return keys;
	},

	extend: function(destination, source) {

		for (var property in source) {
			destination[property] = source[property];
		}
		return destination;
	}
};

