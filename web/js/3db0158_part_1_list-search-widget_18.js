

$.widget('seriel.ser_listSearchWidget', $.seriel.ser_widget, {
    _create: function () {
        this._super();
        
        this.options.container.addClass('ser_list_search_widget_container');
        
        $('.search_button', this.options.container).bind('click', $.proxy(this.actuClicked, this));
    },
    initValues: function(values) {
    	loadFieldsSearchFromParams(values, this.element);
    },
    actuClicked: function() {
    	this.element.trigger('filters');
    	this.close();
    },
    options: {
    	prefered_pos: 'bottom'
    }
});