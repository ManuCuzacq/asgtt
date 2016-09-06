$.widget("ser.serMonthWidget", {
	_create: function() {
		if (this.options.days == undefined) this.options.days = new Array("lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche");
		if (this.options.months == undefined) this.options.months = new Array("janvier","février","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","décembre");
		
		var header = (this.header = $('<div />'))
			.addClass('ui-widget-header ui-corner-all ui-multiselect-header ui-helper-clearfix')
			.appendTo( this.element );

		var tbYear = $('<table><tr><td style="text-align:left"><a class="ui-datepicker-prev ui-corner-all prev-year" data-handler="prev" data-event="click" title="Prev"><span class="ui-icon ui-icon-circle-triangle-w">Prev</span></a></td><td style="text-align:center"><div class="label-year">&nbsp;</div></td><td style="text-align:right"><a class="ui-datepicker-next ui-corner-all next-year" data-handler="next" data-event="click" title="Next"><span class="ui-icon ui-icon-circle-triangle-e">Next</span></a></td></tr></table>');
		tbYear.appendTo(this.header);
		
		var content = (this.content = $('<div class="months_container" />')).appendTo( this.element );
		
		this.bindEvents();
	},
	
	_init: function() {
	},
	
	refreshHead: function() {
		var headYear = $('.label-year', this.header);
		headYear.html(this.options.year);
	},
	
	refreshContainer : function()
	{
		var y = this.options.year;
		
		var selectedYear = 0;
		var selectedMonth = 0;
		
		if (this.options.val) {
			var splitted = explode('-', this.options.val);
			if (count(splitted) == 2) {
				selectedYear = intval(splitted[0]);
				selectedMonth = intval(splitted[1]);
			}
		}
		
		var currentYear = intval(date('Y'));
		var currentMonth = intval(date('m'));
		
		this.content.html("");
		for(var m=1;m<=12;m++)
		{
			var btnMois = $('<a class="mois elem_mois ui-state-default"></a>');
			if (currentYear == y && currentMonth == m) btnMois.addClass('ui-state-highlight');
			if (selectedYear == y && selectedMonth == m) btnMois.addClass('ui-state-active');
			var info = this.getInfosMois(y,m);
			btnMois.html(info.label);
			btnMois.attr('title',"Du "+info.firstDay_label+" au "+info.lastDay_label);
			btnMois.attr('mois',m);
			btnMois.attr('d1',info.firstDay);
			btnMois.attr('d2',info.lastDay);
			btnMois.appendTo(this.content);
		}
		
		this.content.find('.mois').bind('click',$.proxy(this.onSelectMonth,this));
	},
	
	refresh: function() {
		this.refreshHead();
		this.refreshContainer();
	},
	
	/**
	 * 
	 * @param y
	 * @param m	Numéro du mois (de 1 à 12)
	 * @returns {___anonymous1130_1145}
	 */
	
	getInfosMois : function(y,m)
	{
		var label = this.options.months[m-1];
		var tmDebut = mktime(0,0,0,m,1,y);
		var tmFin = mktime(0,0,0,m+1,0,y);
		var nbj = date('d',tmFin);
		var debut =  this.getLabelDay(tmDebut)+sprintf(" %02d/%02d/%04d",1,m,y);
		var fin = this.getLabelDay(tmFin)+sprintf(" %02d/%02d/%04d",nbj,m,y);
		
		return { 	label: label, 
					days: nbj, 
					firstDay: sprintf("%04d-%02d-%02d",y,m,1),
					firstDay_label: debut,
					lastDay: sprintf("%04d-%02d-%02d",y,m,nbj),
					lastDay_label:fin
				};
	},
	/**
	 * Retourne le nom du jour 
	 */
	getLabelDay : function(tm)
	{
		var N = date('N',tm);
		return this.options.days[N-1] ;
	},
	
	
	// binds events
	bindEvents: function(){
		this.header.find('.next-year').bind('click',$.proxy(this.nextYear,this));
		this.header.find('.prev-year').bind('click',$.proxy(this.prevYear,this));
		
	},
	
	inputFromWidget: function() {
		
	},
	
	nextYear: function()
	{
		this.selectYear(Number(this.options.year)+1);
	},
	prevYear : function()
	{
		this.selectYear(Number(this.options.year)-1);
	},
	selectYear : function(y)
	{
		this.options.year = y ;
		this.refresh();
	},
	selectMonth : function(m)
	{
		//$('.elem_mois', this.element).removeClass('ui-state-active');
		//$('.elem_mois[mois='+m+']', this.element).addClass('ui-state-active');

		var val = this.options.year+'-'+m;
		
		this.setVal(val);
		if (this.options.onSelect != null) {
			this.options.onSelect.call(this, val);
		}
	},
	
	onSelectMonth : function(event)
	{
		var it = $(event.currentTarget);
		var month = it.attr('mois');
		
		this.selectMonth(month);
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

