
$.widget('seriel.contextMenuWidget', $.seriel.ser_widget, {
    _create: function () {
        this._super();
        this.options.container.addClass('context_menu_widget_container');
        
        $('li', this.options.container).bind('click', $.proxy(this.elemClicked, this));
    },
    elemClicked: function(event) {
    	var target = $(event.currentTarget);
    	var action = target.attr('action');
    	
    	this.element.trigger('action', action);
    	this.close();
    },
    options: {
    	
    }
});