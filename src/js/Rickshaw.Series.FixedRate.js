Rickshaw.namespace('Rickshaw.Series.FixedRate');

Rickshaw.Series.FixedRate = Rickshaw.Class.create(Rickshaw.Series, {

    initialize: function (data, palette, options) {

        options = options || {};

        // rate in seconds. 1 hour by default.
        this.rate = options.rate || 3600;

        this.palette = new Rickshaw.Color.Palette(palette);

        this.timeBase = typeof(options.timeBase) === 'undefined' ? 
            Math.floor(new Date().getTime() / 1000) : 
            options.timeBase;

        var timeInterval = typeof(options.timeInterval) == 'undefined' ?
            1000 :
            options.timeInterval;

        this.setTimeInterval(timeInterval);
        this.zeroFill(data);
        if (data && (typeof(data) == "object") && Array.isArray(data)) {
            data.forEach( function(item) { this.addItem(item) }, this );
        }
    },

    zeroFill: function(series) {
        this.fill(series, 0);
    },

    fill: function(series, fill) {
        for(var s = 0; s < series.length; s++) {
            var data = series[s].data;
            var i = 0;
            while(i < data.length - 1) {
                if((data[i].x + this.rate) < data[i + 1].x) {
                    data.splice(i + 1, 0, { x: data[i].x + this.rate, y: fill });
                }
                i++;
            }
        }
    }
});
