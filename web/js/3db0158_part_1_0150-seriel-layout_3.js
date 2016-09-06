
$.widget('seriel.serielLayout', {
	_create: function() {
		this.element.addClass('ui-layout-container-seriel');
		
		if (!inDom(this.element)) return;
		if (this.element.css('display') == 'none') return;
		
		this.options.resizable = false;
		this.options.closable = false;
		
		this.element.layout(this.options);
		this.options.initialized = true;
	},
	refresh: function() {
		if (!inDom(this.element)) return;
		
		if (!this.options.initialized) {
			this.element.layout(this.options);
			this.options.initialized = true;
		} else {
			this.element.layout('resizeAll');
		}
	},
	options: {
		initialized: false,
		resizable: false,
		closable: false
	}
});