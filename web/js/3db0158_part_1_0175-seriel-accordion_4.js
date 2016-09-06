
$.widget('seriel.serielAccordion', {
	_create: function() {
		this.element.addClass('ui-accordion-seriel');
		
		if (!inDom(this.element)) return;
		if (this.element.css('display') == 'none') return;
		
		this.element.accordion(this.options);
		this.hideScrollbars();
		$(' > div', this.element).perfectScrollbar();
		this.options.initialized = true;
	},
	refresh: function() {
		if (!inDom(this.element)) return;
		
		if (!this.options.initialized) {
			this.element.accordion(this.options);
			this.hideScrollbars();
			$(' > div', this.element).perfectScrollbar();
			this.options.initialized = true;
		} else {
			this.element.accordion('refresh');
			this.hideScrollbars();
		}
	},
	hideScrollbars: function() {
		$(' > div', this.element).css('overflow', 'hidden');
	},
	options: {
		initialized: false
	}
});