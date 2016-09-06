
$.widget('seriel.ser_datetimeWidget', $.seriel.ser_widget, {
    _create: function () {
    	this._super();
    	
    	this.options.date_widget = $('.ser_date_widget', this.element);
    	this.options.time_widget = $('.ser_time_widget', this.element);
    	
    	this.options.date_widget.bind('change', $.proxy(this.changed, this));
    	this.options.time_widget.bind('change', $.proxy(this.changed, this));
    },
    changed: function() {
    	this.element.trigger('change');
    },
    setVal: function(val) {
    	if (!val) {
    		this.options.date_widget.ser_dateWidget('setVal', '');
    		this.options.date_widget.ser_dateWidget('refreshButton');
			this.options.date_widget.ser_dateWidget('saveInputs');
			
    		this.options.time_widget.ser_timeWidget('setVal', '');
    		this.options.time_widget.ser_timeWidget('refreshButton');
			this.options.time_widget.ser_timeWidget('saveInputs');
    	} else {
    		var splitted = explode(' ', trim(val));
    		if (count(splitted) == 2) {
    			this.options.date_widget.ser_dateWidget('setVal', splitted[0]);
    			this.options.date_widget.ser_dateWidget('refreshButton');
    			this.options.date_widget.ser_dateWidget('saveInputs');
    			
        		this.options.time_widget.ser_timeWidget('setVal', splitted[1]);
        		this.options.time_widget.ser_timeWidget('refreshButton');
    			this.options.time_widget.ser_timeWidget('saveInputs');
    		}
    	}
    },
    getVal: function() {
    	var date_val = this.options.date_widget.ser_dateWidget('getVal');
    	var time_val = this.options.time_widget.ser_timeWidget('getVal');
    	
    	if (!date_val) return '';
    	
    	var res = date_val;
    	if (time_val) res += ' '+time_val;
    	
    	return res;
    },
    options: {
    	date_widget: null,
    	time_widget: null
    }
});