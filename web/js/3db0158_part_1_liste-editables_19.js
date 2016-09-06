$.widget('seriel.ser_listeEditable', {
    _create: function () {
    	this.options.inital_value = this.getVal();
    	this.element.addClass('listeEditable');
    },
    triggerChange: function() {
    	this.element.trigger('change');
    },
    setBackInitialValue: function() {
    	this.setVal(this.options.inital_value);
    },
    hasChanged: function() {
    	var currVal = this.getVal();
    	//console.log('values : '+this.options.inital_value+' > '+currVal);
    	if (currVal == this.options.inital_value) return false;
    	
    	return true;
    },
    getVal: function() {
    	// To be overwritten
    },
    setVal: function(val) {
    	// To be overwritten
    },
    options: {
    	inital_value: null
    }
});

$.widget('seriel.ser_listeEditable_date', $.seriel.ser_listeEditable, {
    _create: function () {
    	this._super();
    	this.options.widget = $('.date_widget', this.element);
    	this.options.widget.bind('change', $.proxy(this.triggerChange, this));
    },
    getVal: function() {
    	return this.options.widget.ser_dateWidget('getVal');
    },
    setVal: function(val) {
    	this.options.widget.ser_dateWidget('setVal', val);
    },
    options: {
    	widget: null
    }
});

$.widget('seriel.ser_listeEditable_date_heure', $.seriel.ser_listeEditable, {
    _create: function () {
    	this.options.widget = $('.datetime_widget', this.element);
    	this.options.widget.bind('change', $.proxy(this.triggerChange, this));
    	this._super();
    },
    getVal: function() {
    	return this.options.widget.ser_datetimeWidget('getVal');
    },
    setVal: function(val) {
    	this.options.widget.ser_datetimeWidget('setVal', val);
    },
    options: {
    	widget: null
    }
});