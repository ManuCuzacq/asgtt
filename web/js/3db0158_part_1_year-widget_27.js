$.widget("ser.serYearWidget", {
	_create: function() {
		var header = (this.header = $('<div />'))
			.addClass('ui-widget-header ui-corner-all ui-multiselect-header ui-helper-clearfix')
			.appendTo( this.element );

		/*var tbYear = $('<table><tr><td style="text-align:left"><a class="ui-datepicker-prev ui-corner-all prev-year" data-handler="prev" data-event="click" title="Prev"><span class="ui-icon ui-icon-circle-triangle-w">Prev</span></a></td><td style="text-align:center"><div class="label-year">&nbsp;</div></td><td style="text-align:right"><a class="ui-datepicker-next ui-corner-all next-year" data-handler="next" data-event="click" title="Next"><span class="ui-icon ui-icon-circle-triangle-e">Next</span></a></td></tr></table>');
		tbYear.appendTo(this.header);*/
		
		var content = (this.content = $('<div class="years_container" />')).appendTo( this.element );
		this.refreshContainer();
		
		this.bindEvents();
	},
	
	_init: function() {
	},
	
	refreshHead: function() {
		//var headYear = $('.label-year', this.header);
		//headYear.html(this.options.year);
	},
	
	refreshContainer : function()
	{
		var selectedYear = 0;
		if (this.options.val) selectedYear = intval(this.options.val);
		
		var currentYear = intval(date('Y'));
		
		this.content.html("");
		for(var y=currentYear-15;y<=currentYear+4;y++)
		{
			var btnYear = $('<a class="year elem_year ui-state-default"></a>');
			if (currentYear == y) btnYear.addClass('ui-state-highlight');
			if (selectedYear == y) btnYear.addClass('ui-state-active');
			
			btnYear.html(y);
			btnYear.attr('title',"Ann&eacute;e "+y);
			btnYear.attr('year',y);
			btnYear.appendTo(this.content);
		}
		
		this.content.find('.year').bind('click',$.proxy(this.onSelectYear,this));
	},
	
	refresh: function() {
		this.refreshHead();
		this.refreshContainer();
	},
	
	// binds events
	bindEvents: function(){
		//this.header.find('.next-year').bind('click',$.proxy(this.nextYear,this));
		//this.header.find('.prev-year').bind('click',$.proxy(this.prevYear,this));
		
	},
	
	inputFromWidget: function() {
		
	},
	
	selectYear : function(y)
	{
		this.setVal(y);
		if (this.options.onSelect != null) {
			this.options.onSelect.call(this, y);
		}
	},
	onSelectYear : function(event)
	{
		var it = $(event.currentTarget);
		var year = it.attr('year');
		
		this.selectYear(year);
	},
	setVal: function(val) {
		this.options.val = val;
		this.refresh();
	},
	options: {
		year: null,
		onSelect: null,
		
		val: null
	}
	
});