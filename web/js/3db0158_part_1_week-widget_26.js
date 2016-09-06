$.widget("ser.serWeekWidget",  {
	_create: function() {
		this.months = new Array("janvier","février","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","décembre");
		this.curMonth = date('m') ;
		this.element2 = null ;
		this.curYear = date('Y') ;
		
		this._buildDOM();
		
		this.bindEvents();
	},
	
	_init: function() {
		if (this.options.name == null || this.options.name == undefined) {
			this._setOption('name', 'Date');
		}
	},
	
	
	bindEvents : function()
	{
		if (!this.element2) return ;
		
		// Choix d'une année
		this.header.find('.sel-year').change(jQuery.proxy(this._onYearChange, this));
		this.header.find('.next-year').bind('click',$.proxy(this.nextYear,this));
		this.header.find('.prev-year').bind('click',$.proxy(this.prevYear,this));
	},
	
	getSelectYearElement : function()
	{
		return this.header.find('.sel-year') ;
	},
	
	refreshHead: function() {
		var headYear = $('.sel-year', this.header);
		headYear.html(this.options.year);
	},
	

	_buildWeekDiv : function(w,ww,y,d1,d2)
	{
		var currentYear = intval(date('Y'));
		var currentWeek = intval(date('W'));
		
		var splitted = explode('-', ww);
		var year = intval(splitted[0]);
		var week = intval(splitted[1]);
		
		var selectedYear = 0;
		var selectedWeek = 0;
		
		if (this.options.val) {
			var splitted = explode('-', this.options.val);
			if (count(splitted) == 2) {
				selectedYear = intval(splitted[0]);
				selectedWeek = intval(splitted[1]);
			}
		}
		
		var classSup = "";
		if (year == currentYear && week == currentWeek) classSup = " ui-state-highlight";
		if (year == selectedYear && week == selectedWeek) classSup = " ui-state-active";
		
		return '<div d1="'+d1+'" d2="'+d2+'" class="ui-state-default ser-weekpicker btn-week'+classSup+'" sem="'+ww+'" title="du '+date("d/m/Y",d1)+' au '+date("d/m/Y",d2)+'">'+sprintf("%02d",w)+'</div>' ;
	},
	
	
	destroy: function()
	{
		this.element2.remove();
		
		$.Widget.prototype.destroy.call( this );
	},
	
	_buildYearWeeksHTML : function(y)
	{
		var html = "",m,w ;

		html+='<table class="ser-weekpicker" cellpadding="0" cellspacing="0">' ;
		
		html+='<tr valign="top">' ;
		for(var cm=1;cm<=12;cm++)
		{
				m = cm  ;
				var d1 = mktime(0,0,0,m,1,y);
				var d2 = mktime(0,0,0,m+1,0,y);
				var nbm = date('d',d2);
				
				var w1 = date('W',d1);
				var w2 = date('W',d2);
				html+='<td>' ;
				html+='<div ><span class="title">'+monthNamesShort[m-1]+'</span></div>' ;

				var weeks = SerielUtils.getWeeksByMonth(m,y);

				for(w in weeks)
				{
					html+=this._buildWeekDiv(weeks[w].w,weeks[w].ww,y,weeks[w].d1,weeks[w].d2);
				}
				
				html+='</td>' ;
			}
			html+="</tr>" ;

		html+='</table>' ;
		return html ;
	},
	
	// Construction des élements du widget
	_buildDOM : function()
	{
		
		header = (this.header = $('<div />'))
			.addClass('ui-widget-header ui-corner-all ui-multiselect-header ui-helper-clearfix')
			.appendTo( this.element );
		
		var thisYear = intval(date('Y'));
		
		
		var html = "" ;
						
		
		// Entête (choix année)
		html = "" ;
		html += '<div class="color3p">Année : '; 
		html += '<select class="sel-year">';
		for(var y = thisYear-15;y <= thisYear+5;y++)
		{
			html += '<option value="'+y+'">'+y+'</option>' ;
		}
		html += '</select>';
		html+='</div>';
		
		''
		
		var tbYear = $('<table style="width:100%"><tr><td style="text-align:left"><a class="ui-datepicker-prev ui-corner-all prev-year" data-handler="prev" data-event="click" title="Prev"><span class="ui-icon ui-icon-circle-triangle-w">Prev</span></a></td><td style="text-align:center">'+html+'</div></td><td style="text-align:right"><a class="ui-datepicker-next ui-corner-all next-year" data-handler="next" data-event="click" title="Next"><span class="ui-icon ui-icon-circle-triangle-e">Next</span></a></td></tr></table>');
		
		tbYear.appendTo(header);
		
		
		
		
		html = "" ;
		
		// Tableau où sera placé le tableau des semaines
		html += '<table style="width: 100%" class="ser-weekpicker" cellpadding="0" cellspacing="0">' ;
		html += '<tbody>' ;
		html += '<tr valign="top">' ;
		html += '<td class="ser-weekpicker-weeks" style="width:120px;">' ;
		html += '</td></tr>' ;
		html += '</tbody>' ;
		html += '</table>' ;

		this.element2 = $(html);
		this.element.append(this.element2);
	},


	

	yearClick :function(event,ui)
	{
		this.selectMonth(null,$(event.srcElement).attr('y'));
	},

	
	_onYearChange :function(event,ui)
	{
		this.selectYear(this.getSelectYearElement().val());
	},
	
	_onWeekClick :function(event,ui)
	{	
		this.selectWeek($(event.currentTarget).attr('sem'),null);
	},


	selectYear : function(y)
	{
		var curYear = this.element2.find('.sel-year').val();
		var html = "" ;
		
		var eltYear = this.getSelectYearElement();
		
		if (eltYear.find("option[value="+y+"]").length==0)
			{
			eltYear.append('<option value="'+y+'">'+y+"</option>");
			}
		
		this.getSelectYearElement().val(y);
		html+=this._buildYearWeeksHTML(y);
		this.element2.find('.ser-weekpicker-weeks').html(html);
		this.element2.find('.btn-week').click(jQuery.proxy(this._onWeekClick, this));
	},
	
	

	selectWeek : function(ww)
	{
		var inf = explode('-',ww);
		var y = inf[0] ;
		var w = inf[1] ;
		
		var curYear = this.getSelectYearElement().val();
		if (curYear!=y)
		{
			this.selectYear(y);
			this.selectWeek(ww);
			return ;
		}
		
		//$('.btn-week', this.element).removeClass('ui-state-active');
		//$('.btn-week[sem='+ww+']', this.element).addClass('ui-state-active');
		
		this.setVal(ww);
		
		if (this.options.onSelect != null) {
			var val = y+'+'+w;
			this.options.onSelect.call(this, val);
		}
		
		/*var ewk = this.element2.find('.btn-week[sem='+ww+']');
		
		var label = "Sem "+w ;
		
		if (date('Y')!=y) label += "("+y+")";
		
		label += " <i style='font-size:6pt'>du "+date('d/m',Number(ewk.attr('d1')))+" au "+date('d/m',Number(ewk.attr('d2')))+"</i>";
		this
		this.buttonlabel.html(label);
		
		this.element2.find('.btn-week').removeClass('selected');
		this.element2.find('.btn-week[sem='+ww+']').addClass('selected');
		
		this.element2.find('.btn-week').removeClass('ui-state-active');
		this.element2.find('.btn-week[sem='+ww+']').addClass('ui-state-active');
			
		this.element.val(ww);
		
		if (this.options.select) this.options.select(ww,this);
		
		this.close();*/
	},
	
	nextYear: function()
	{
		this.selectYear(Number(this.getSelectYearElement().val())+1);
	},
	prevYear : function()
	{
		this.selectYear(Number(this.getSelectYearElement().val())-1);
	},
	setVal: function(val) {
		this.options.val = val;
		
		var curYear = Number(this.getSelectYearElement().val());
		this.selectYear(curYear);
	},
	options: {
		onSelect: null,
		
		val: null
	}
});