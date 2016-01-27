(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['d3', 'jquery'], function (d3, jquery) {
            return (root.Rickshaw = factory(d3, jquery));
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(require('d3'), require('jquery'));
    } else {
        root.Rickshaw = factory(d3, jQuery);
    }
}(this, function (d3, jQuery) {
