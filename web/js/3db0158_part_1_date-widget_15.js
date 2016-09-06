
$.widget('seriel.ser_dateWidget', $.seriel.ser_widget, {
    _create: function () {
        this._super();

        // On récupère les options si elles sont présente.
        var options_container = $('.options', this.element);
        if (options_container.size() == 1) {
            var opts = $.parseJSON(options_container.html());
            if (opts) {
                for (var key in opts) {
                    this.options[key] = opts[key];
                }
            }
        }

        // test ********************************
        //this.options["show_special_values"]=true;


        // Let's add the header.
        //var head = $('<span class="date_widget_head"><ul><li class="day" tab="day"><span>Jour</span></li><li class="week" tab="week"><span>Semaine</span></li><li class="month" tab="month"><span>Mois</span></li><li class="year" tab="year"><span>Ann&eacute;e</span></li><li class="period" tab="period"><span>P&eacute;riode</span></li><li class="shortc" tab="shortc"><span>Raccourcis</span></li><li class="empty" tab="empty"><span>Vider</span></li></ul></span>');
        var head = $('<span class="date_widget_head"><ul><li class="empty" tab="empty"><span>Vider</span></li></ul></span>');
        var cont = $('<div class="date_widget_content"><div class="day"></div><div class="week"></div><div class="month"></div><div class="year year_sel"></div><div class="period"></div><div class="shortc"></div></div>');

        var hasDay = false;
        var hasWeek = false;
        var hasMonth = false;
        var hasYear = false;
        var hasPeriod = false;
        var hasShortcuts = false;

        var splitted = explode(',', this.options.tabs);
        if (count(splitted) == 0) splitted = [ 'day' ];

        for (var i = 0; i < count(splitted); i++) {
            var tab = trim(splitted[i]);
            if (tab == 'day') {
                hasDay = true;
            } else if (tab == 'week') {
                hasWeek = true;
                this.options.exportPeriod = true;
            } else if (tab == 'month') {
                hasMonth = true;
                this.options.exportPeriod = true;
            } else if (tab == 'year') {
                hasYear = true;
                this.options.exportPeriod = true;
            } else if (tab == 'periode') {
                $('.periode', this.header).css('display', 'inline-block');
                this.options.exportPeriod = true;
                hasPeriod=true;
            } else if (tab == 'shortcuts') {
                hasShortcuts = true;
            }
        }

        if (hasShortcuts) $(' > ul', head).prepend('<li class="shortc" tab="shortc"><span>Raccourcis</span></li>');
        if (hasPeriod) $(' > ul', head).prepend('<li class="period" tab="period"><span>P&eacute;riode</span></li>');
        if (hasYear) $(' > ul', head).prepend('<li class="year" tab="year"><span>Ann&eacute;e</span></li>');
        if (hasMonth) $(' > ul', head).prepend('<li class="month" tab="month"><span>Mois</span></li>');
        if (hasWeek) $(' > ul', head).prepend('<li class="week" tab="week"><span>Semaine</span></li>');
        if (hasDay) $(' > ul', head).prepend('<li class="day" tab="day"><span>Jour</span></li>');

        if (hasDay) {
            var dayContent = $('<div><div class="day_date_picker"></div><div class="day_shortcuts"><ul><li class="sh_c hier"><span>hier</span></li><li class="sh_c today"><span>aujourd\'hui</span></li><li class="sh_c demain"><span>demain</span></li></ul></div></div>');
            var dayDatePickerOptions = $.extend({}, datePickerOptions);
            dayDatePickerOptions['onSelect'] = $.proxy(this.daySelected, this);
            $('.day_date_picker', dayContent).datepicker(dayDatePickerOptions);
        }

        if (hasWeek) {
            var weekContent = $('<div><div class="week_selector"></div><div class="week_shortcuts"><ul><li class="sh_c lastweek"><span>semaine derni&egrave;re</span></li><li class="sh_c thisweek"><span>cette semaine</span></li><li class="sh_c nextweek"><span>semaine prochaine</span></li></ul></div></div>');
            $('.week_selector', weekContent).serWeekWidget({'onSelect': $.proxy(this.weekSelected, this)});
            $('.week_selector', weekContent).serWeekWidget('selectYear', date('Y'));
        }

        if (hasMonth) {
            var monthContent = $('<div><div class="month_selector"></div><div class="month_shortcuts"><ul><li class="sh_c lastmonth"><span>mois dernier</span></li><li class="sh_c thismonth"><span>ce mois-ci</span></li><li class="sh_c nextmonth"><span>mois prochain</span></li></ul></div></div>');
            $('.month_selector', monthContent).serMonthWidget({'onSelect': $.proxy(this.monthSelected, this)});
            $('.month_selector', monthContent).serMonthWidget('selectYear', date('Y'));
        }

        if (hasYear) {
            var yearContent = $('<div><div class="year_selector"></div><div class="year_shortcuts"><ul><li class="sh_c lastyear"><span>ann&eacute;e derni&egrave;re</span></li><li class="sh_c thisyear"><span>cette ann&eacute;e</span></li><li class="sh_c nextyear"><span>ann&eacute;e prochaine</span></li></ul></div></div>');
            $('.year_selector', yearContent).serYearWidget({'onSelect': $.proxy(this.yearSelected, this)});
        }

        if (hasPeriod) {
            var periodeDiv = $('<div class="tab tab-periode"><div class="from periode_from"><span class="sel_checkbox"><input type="checkbox" checked class="period_1" />&nbsp;Du<br/></span><div class="dp1"></div></div><div class="to periode_to"><span class="sel_checkbox"><input type="checkbox" checked class="period_2" />&nbsp;Jusqu\'au<br/></span><div class="dp2"></div></div></div>');

            this.options.periodeDiv = periodeDiv;

            $(' > div', periodeDiv).css({'display': 'inline-block', 'vertical-align': 'top'});
            var buttonValidPeriod = $('<div style="text-align: right; margin: 5px 5px 0 0"><button class="valider valid_button">Valider</button></div>');
            buttonValidPeriod.appendTo(periodeDiv);

            var periodPickerOptions = $.extend({}, datePickerOptions);
            periodPickerOptions['onSelect'] = $.proxy(this.periodSelected1, this);
            periodPickerOptions['defaultDate'] = null;
            periodPickerOptions['setDate'] = null;
            $('.dp1', periodeDiv).datepicker(periodPickerOptions);
            $( '.dp1', periodeDiv).datepicker( "setDate",null );
            $( '.dp1', periodeDiv).datepicker( "refresh" );
            $(".dp1",periodeDiv).find("a").removeClass("ui-state-highlight ui-state-active");



            periodPickerOptions['onSelect'] = $.proxy(this.periodSelected2, this);
            periodPickerOptions['defaultDate'] = null;
            periodPickerOptions['setDate'] = null;
            $('.dp2', periodeDiv).datepicker(periodPickerOptions);
            $( '.dp2', periodeDiv).datepicker( "setDate",null );
            $( '.dp2', periodeDiv).datepicker( "refresh" );
            $(".dp2",periodeDiv).find("a").removeClass("ui-state-highlight ui-state-active");

            //$(' > div > div', periodeDiv).datepicker(periodPickerOptions);
            $(".valider",periodeDiv).bind('click',$.proxy(this.onValidatePeriod, this));

            $(".sel_checkbox",periodeDiv).bind('click',$.proxy(this.onCheckPeriod, this));
            $(".sel_checkbox",periodeDiv).css("cursor","pointer");


        }

        if (hasShortcuts) {
            var raccourcisDiv = $('<div class="tab tab-raccourcis"></div>');
            var tableShortcuts = $('<table class="shortcuts_table" border="0" cellspacing="10"><thead><tr><td></td><th>pass&eacute;</th><th>pr&eacute;sent</th><th>futur</th></tr></thead><tbody><tr class="day"><th>jour</th><td class="sh_c hier"><span>hier</span></td><td class="sh_c today"><span>aujourd\'hui</span></td><td class="sh_c demain"><span>demain</span></td></tr><tr class="week"><th>semaine</th><td class="sh_c lastweek"><span>semaine derni&egrave;re</span></td><td class="sh_c thisweek"><span>cette semaine</span></td><td class="sh_c nextweek"><span>semaine prochaine</span></td></tr><tr class="month"><th>mois</th><td class="sh_c lastmonth"><span>mois dernier</span></td><td class="sh_c thismonth"><span>ce mois-ci</span></td><td class="sh_c nextmonth"><span>mois prochain</span></td></tr><tr class="year"><th>ann&eacute;e</th><td class="sh_c lastyear"><span>ann&eacute;e derni&egrave;re</span></td><td class="sh_c thisyear"><span>cette ann&eacute;e</span></td><td class="sh_c nextyear"><span>ann&eacute;e prochaine</span></td></tr></tbody></table>');
            tableShortcuts.appendTo(raccourcisDiv);
        }


        // -------------------
        var selectN = '<div class="special_values"><span class="special_title">Valeurs spéciales</span><ul><li class="sh_c n_1 less_button"><span>n-&nbsp;<input type="number" value="2" min="1" max="365"/></span></li><li class="sh_c blank "><span>&nbsp;</span></li><li class="sh_c n1 more_button"><span>n+&nbsp;<input type="number" value="2" min="1" max="365"/></span></li></ul></div>';

        if (hasDay) {
            $('.day', cont).append(dayContent);
            // valeurs spéciales
            if( this.options["show_special_values"] ){
                $('.day', cont).append(selectN);
            }
        }
        if (hasWeek){
            $('.week', cont).html(weekContent);
            // valeurs spéciales
            if( this.options["show_special_values"] ){
                $('.week', cont).append(selectN);
            }
        }
        if (hasMonth){
            $('.month', cont).html(monthContent);
            // valeurs spéciales
            if( this.options["show_special_values"] ){
                $('.month', cont).append(selectN);
            }
        }
        if (hasYear){
            $('.year', cont).html(yearContent);
            // valeurs spéciales
            if( this.options["show_special_values"] ){
                $('.year_sel', cont).append(selectN);
            }
        }
        if (hasPeriod) $('.period', cont).html(periodeDiv);
        if (hasShortcuts) $('.shortc', cont).html(raccourcisDiv);

        this.options.content.append(head);
        this.options.content.append(cont);

        var first = this.getFirstTab();
        if (first && first != 'empty') {
            this.selectTab(first);
        }

        var tabs = $('.date_widget_head > ul > li', this.options.content);
        tabs.bind('click', $.proxy(this.tabClicked, this));

        $('.sh_c.hier', cont).bind('click', $.proxy(this.hierClicked, this));
        $('.sh_c.today', cont).bind('click', $.proxy(this.todayClicked, this));
        $('.sh_c.demain', cont).bind('click', $.proxy(this.demainClicked, this));

        $('.sh_c.lastweek', cont).bind('click', $.proxy(this.lastWeekClicked, this));
        $('.sh_c.thisweek', cont).bind('click', $.proxy(this.thisWeekClicked, this));
        $('.sh_c.nextweek', cont).bind('click', $.proxy(this.nextWeekClicked, this));

        $('.sh_c.lastmonth', cont).bind('click', $.proxy(this.lastMonthClicked, this));
        $('.sh_c.thismonth', cont).bind('click', $.proxy(this.thisMonthClicked, this));
        $('.sh_c.nextmonth', cont).bind('click', $.proxy(this.nextMonthClicked, this));

        $('.sh_c.lastyear', cont).bind('click', $.proxy(this.lastYearClicked, this));
        $('.sh_c.thisyear', cont).bind('click', $.proxy(this.thisYearClicked, this));
        $('.sh_c.nextyear', cont).bind('click', $.proxy(this.nextYearClicked, this));


        $('.sh_c.n_1', cont).bind('click', $.proxy(this.n_1Clicked, this));
        $('.sh_c.n1', cont).bind('click', $.proxy(this.n1Clicked, this));
        $('.sh_c.n_1 input,.sh_c.n1 input', cont).bind('click', $.proxy(this.nInputClicked, this));


        $('.sh_c.n_1,.sh_c.n1', cont).hover(
            function() {
                if($("input", this).val()=="")
                    $("input", this).val("1");
                $("input", this ).focus();
                $("input", this ).addClass("selected");
            }, function() {
                $("input", this ).blur();
                $("input", this ).removeClass("selected");
            }
        );



        // Do we have a title here ?
        if (!this.options.title) {
            var titleSpan = $('.title', this.options.button);
            if (titleSpan.size() == 1) {
                this.options.title = titleSpan.html();
                if (titleSpan.hasClass('fixed')) this.options.fixed_title = true;
            }
        }

        this.options.widget.addClass('ser_date_widget');

        this.refreshButton();
        this.saveInputs();

        var val = this.element.attr('val');
        if (val) this.setVal(val);

        if (options_container.size() == 1) {
            options_container.remove();
        }
    },
    nInputClicked: function(){
        return false;
    },
    _buildYearWeeksHTML : function(y)
    {
        var html = "",m,w ;

        html+='<table class="ms-weekpicker" >' ;

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
            html+='<div ><b>'+monthNamesShort[m-1]+'</b></div>' ;

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
    getFirstTab: function () {
        var tabs = $('.date_widget_head > ul > li', this.options.content);
        if (tabs && tabs.size() > 0) {
            for (var i = 0; i < tabs.size(); i++) {
                var tab = $(tabs.get(i));
                if (tab.css('display') != 'none')
                    return tab.attr('tab');
            }
        }
        return null;
    },
    empty: function () {
        this.setVal('');
        this.refreshButton();
        this.saveInputs();
        this.close();
    },
    tabClicked: function (event) {
        var target = $(event.currentTarget);
        var tab = target.attr('tab');
        if (tab == 'empty') {
            this.empty();
            this.close();
            return false;
        }
        this.selectTab(tab);
    },
    selectTab: function (tab) {
        $('.date_widget_head > ul > li.selected:not(.' + tab + ')', this.options.content).removeClass('selected');
        $('.date_widget_head > ul > li.' + tab, this.options.content).addClass('selected');

        $('.date_widget_content > div.selected:not(.' + tab + ')', this.options.content).removeClass('selected');
        $('.date_widget_content > div.' + tab, this.options.content).addClass('selected');
    },
    displayButtonVal: function (val) {
        if (!val)
            val = "&nbsp;";
        this.options.button.html(val);
    },
    getTitle: function() {
    	return this.options.button.html();
    },
    daySelected: function (day) {
        this.setDay(day);
    },
    weekSelected: function(week) {
        this.setWeek(week);
    },
    monthSelected: function(month) {
        this.setMonth(month);
    },
    yearSelected: function(year) {
        this.setYear(year);
    },
    getSpecialValue: function() {
        if (this.options.val != null && strlen(this.options.val) > 2 && substr(this.options.val, 0, 1) == '{' && substr(this.options.val, strlen(this.options.val) - 1) == '}') {
            return substr(this.options.val, 1, strlen(this.options.val) - 2);
        }
        return null;
    },
    isSpecialValue: function() {
        if (this.options.val != null && strlen(this.options.val) > 2 && substr(this.options.val, 0, 1) == '{' && substr(this.options.val, strlen(this.options.val) - 1) == '}') {
            return true;
        }
        return false;
    },
    periodSelected1: function (day) {
        this.setPeriod1(day);
    },
    periodSelected2: function (day) {
        this.setPeriod2(day);
    },
    onCheckPeriod: function(event) {
        var target = $(event.currentTarget);
        //var checked = target.is(':checked');
        if(target.find(".period_1").length>0){
            if( $(target).hasClass("uncheck") ) {
                $(target).removeClass("uncheck");
                $(target).parent().removeClass("periode_uncheck");
                $(".dp1",this.options.periodeDiv).datepicker("enable");
            } else {
                $(target).addClass("uncheck");
                $(target).parent().addClass("periode_uncheck");
                this.setPeriod1("");
                $(".dp1",this.options.periodeDiv).find("a").removeClass("ui-state-highlight ui-state-active");
                $(".dp1",this.options.periodeDiv).datepicker("disable");
            }
        }

        if(target.find(".period_2").length>0){
            if( $(target).hasClass("uncheck") ) {
                $(target).removeClass("uncheck");
                $(target).parent().removeClass("periode_uncheck");
                $(".dp2",this.options.periodeDiv).datepicker("enable");
            } else {
                $(target).addClass("uncheck");
                $(target).parent().addClass("periode_uncheck");
                this.setPeriod2("");
                $(".dp2",this.options.periodeDiv).find("a").removeClass("ui-state-highlight ui-state-active");
                $(".dp2",this.options.periodeDiv).datepicker("disable");
            }
        }

    },
    refreshButton: function () {
        var title = '';
        if (this.options.title) title = this.options.title;

        if (this.options.fixed_title) {
            this.displayButtonVal(title);
            return;
        }

        //console.log('test val : ['+this.options.val+'] : '+this.options.valType);
        
        // On controle s'il s'agit d'une valeur speciale.
        var special_val = this.getSpecialValue();
        if (special_val) {
        	var special_val = substr(this.options.val, 1, strlen(this.options.val) - 2);
        	var pos_moins = strpos(special_val, '-');
        	if (pos_moins) {
        		var splitted = explode('-', special_val);
        		var type = splitted[0];
        		var qte = intval(splitted[1]);
        	} else {
        		var splitted = explode('+', special_val);
        		var type = splitted[0];
        		var qte = intval(splitted[1]);
        	}
        	
        	var str_type = '';
        	if (type == 'd') str_type = ' Jour';
        	if (type == 'w') str_type = ' Semaine';
        	if (type == 'm') str_type = ' Mois';
        	if (type == 'y') str_type = ' Année';
        	
        	title = str_type + ' '+(pos_moins ? '-' : '+')+' '+qte;
        	
        	this.displayButtonVal(title);
        	return;
        }

        if (this.options.val == '') {
            // Do nothing
        } else if (this.options.valType == 'day') {
            title = niceDayDate(this.options.val);
        } else if (this.options.valType == 'week') {
            var splitted = explode('+', this.options.val);
            var year = splitted[0];
            var week = splitted[1];

            var firstDay = this.getFrom();
            var lastDay = this.getTo();

            // var ewk = $('.btn-week[sem='+this.options.val+']');

            var title = "Sem " + week;

            if (date('Y') != year)
                title += " (" + year + ")";

            var splitted = explode('-', firstDay);
            var first = splitted[2] + '/' + splitted[1];

            splitted = explode('-', lastDay);
            var last = splitted[2] + '/' + splitted[1];

            // title += " <i style='font-size:6pt'>du
            // "+date('d/m',Number(ewk.attr('d1')))+" au
            // "+date('d/m',Number(ewk.attr('d2')))+"</i>";
            title += " <span class='details'>du " + first + " au " + last + "</span>";
        } else if (this.options.valType == 'month') {
            var splitted = explode('-', this.options.val);
            var year = splitted[0];
            var month = splitted[1];

            title = monthNames[intval(month)-1] + ' ' + year;
        } else if (this.options.valType == 'year') {
            title = 'Ann&eacute;e ' + this.options.val;
        } else if (this.options.valType == 'periode') {
            var splitted = explode('::', this.options.val);
            var day1 = splitted[0];
            var day2 = splitted[1];

            if (day1 == '') {
                title = "jusqu'au " + niceDayDate(day2);
            } else if (day2 == '') {
                title = "&agrave; partir du " + niceDayDate(day1);
            } else {
                var splitted = explode('-', day1);
                var year1 = intval(splitted[0]);
                var month1 = intval(splitted[1]);
                var jour1 = intval(splitted[2]);

                splitted = explode('-', day2);
                var year2 = intval(splitted[0]);
                var month2 = intval(splitted[1]);
                var jour2 = intval(splitted[2]);

                if (year1 == year2) {
                    if (month1 == month2) {
                        if (jour1 == jour2) {
                            title = niceDayDate(day1);
                        } else {
                            var month = monthNames[intval(month1)-1];
                            title = "Du " + jour1 + " au " + jour2 + " " + month + " " + year1;
                        }
                    } else {
                        var m1 = monthNames[intval(month1)-1];
                        var m2 = monthNames[intval(month2)-1];
                        title = "Du " + jour1 + " " + m1 + " au " + jour2 + " " + m2 + " " + year1;
                    }
                } else {
                    title = "Du " + niceDayDate(day1) + " au " + niceDayDate(day2);
                }
            }
        }

        //console.log('test title >>  ['+title+']');

        this.displayButtonVal(title);
    },
    getSelectedTab: function(){
        return $(".date_widget_head .selected").attr("tab");
    },
    _getVar: function(type){
        if(type=="day")
            return "d";
        else if(type=="week")
            return "w";
        else if(type=="month")
            return "m";
        else if(type=="year")
            return "y";
    },
    _getVarString: function(type){
        if(type=="day")
            return "Jour";
        else if(type=="week")
            return "Semaine";
        else if(type=="month")
            return "Mois";
        else if(type=="year")
            return "Ann&eacute;e";
    },
    setDay: function (day) {
        this.options.valType = 'day';
        this.options.val = day;
        this.refreshButton();
        this.saveInputs();
        this.close();
    },
    setWeek: function(week) {
        this.options.valType = 'week';
        this.options.val = week;
        this.refreshButton();
        this.saveInputs();
        this.close();
    },
    setMonth : function(month) {
        var splitted = explode('-', month);
        var y = splitted[0];
        var m = splitted[1];
        if (strlen(m) == 1) m = '0'+m;

        this.options.valType = 'month';
        this.options.val = y+'-'+m;
        this.refreshButton();
        this.saveInputs();
        this.close();
    },
    setYear : function(year) {
        this.options.valType = 'year';
        this.options.val = year;
        this.refreshButton();
        this.saveInputs();
        this.close();
    },
    n_1Clicked: function (event) {
        var target = $(event.currentTarget);
        var tab = this.getSelectedTab();
        var value = "{"+this._getVar(tab)+"-"+target.find("input").val()+"}";

        this.options.val = value;
        this.refreshButton();
        this.saveInputs();
        this.close();
        return;
        /*this.options.title =this._getVarString(tab)+" (n-"+target.find("input").val()+")";
         this.displayButtonVal(value);
         this.close();

         return;*/

        var currentDay = intval(date('d'));
        var currentMonth = intval(date('m'));
        var currentYear = intval(date('Y'));

        var n = parseFloat(target.find("input").val());
        if( tab == "day" ) {
            /*var jour = date('Y-m-d', mktime(0, 0, 0, currentMonth, currentDay - n, currentYear));
             this.setDay(jour);*/

            this.setDay(value);
        } else if( tab == "week" ) {
            //this.setWeek(SerielUtils.getWeekForDay(date('Y-m-d', mktime(0,0,0,currentMonth,currentDay-(7*n),currentYear))));
            this.setWeek(value);
        } else if( tab == "month" ) {
            /*var lastMonth = date('Y-m', mktime(0,0,0,currentMonth-n,currentDay,currentYear));
             this.setMonth(lastMonth);*/
            this.setMonth(value);
        } else if( tab == "year" ) {
            /*var lastYear = date('Y', mktime(0,0,0,currentMonth,currentDay,currentYear-n));
             this.setYear(lastYear);*/
            this.setYear(value);
        }

        this.close();
    },
    n1Clicked: function (event) {
        var target = $(event.currentTarget);
        var tab = this.getSelectedTab();//$(".date_widget_head .selected").attr("tab");
        var value = "{"+this._getVar(tab)+"+"+target.find("input").val()+"}";

        this.options.val = value;
        this.refreshButton();
        this.saveInputs();
        this.close();
        return;
        //this.options.title =this._getVarString(tab)+" (n+"+target.find("input").val()+")";
        //this.displayButtonVal(value);
        //this.close();
        var currentDay = intval(date('d'));
        var currentMonth = intval(date('m'));
        var currentYear = intval(date('Y'));

        var n = parseFloat(target.find("input").val());
        if( tab == "day" ) {
            /*var jour = date('Y-m-d', mktime(0, 0, 0, currentMonth, currentDay + n, currentYear));
             this.setDay(jour);*/
            this.setDay(value);
        } else if( tab == "week" ) {
            //this.setWeek(SerielUtils.getWeekForDay(date('Y-m-d', mktime(0,0,0,currentMonth,currentDay+(7*n),currentYear))));
            this.setWeek(value);
        } else if( tab == "month" ) {
            /*var lastMonth = date('Y-m', mktime(0,0,0,currentMonth+n,currentDay,currentYear));
             this.setMonth(lastMonth);*/
            this.setMonth(value);
        } else if( tab == "year" ) {
            /*var lastYear = date('Y', mktime(0,0,0,currentMonth,currentDay,currentYear+n));
             this.setYear(lastYear);*/
            this.setYear(value);
        }
    },
    setPeriod1: function (day) {

        //console.log("P1 ---> "+day)

        this.options.valType = 'periode';
        this.options.val1 = day;

        if( this.options.val2==null)
            this.options.val = day+"::";
        else
            this.options.val = day+"::"+this.options.val2;

        if( this.options.val == "::" ) {
            this.setVal("");
            //return;
        }
        //    this.options.val = date('Y-m-d')+"::"+date('Y-m-d');


        this.refreshButton();
        this.saveInputs();
        //this.close();


    },
    setPeriod2: function (day) {

        //console.log("P2 ---> "+day)

        this.options.valType = 'periode';
        this.options.val2 = day;

        if( this.options.val1==null)
            this.options.val = "::"+day;
        else
            this.options.val = this.options.val1+"::"+day;

        if( this.options.val == "::" ) {
            this.setVal("");
            //return;
        }
        //    this.options.val = date('Y-m-d')+"::"+date('Y-m-d');


        this.refreshButton();
        this.saveInputs();
        //this.close();


    },
    onValidatePeriod: function(){
        this.options.widget.trigger('change', this.options.val);

        setTimeout($.proxy(this.close, this), 500);
    },
    hierClicked: function () {
        var currentDay = intval(date('d'));
        var currentMonth = intval(date('m'));
        var currentYear = intval(date('Y'));

        var hier = date('Y-m-d', mktime(0, 0, 0, currentMonth, currentDay - 1, currentYear));

        this.setDay(hier);
        /*
         var value = this._getVar("day")+"-1";
         this.options.title =this.options.titles["d_1"];
         this.displayButtonVal(value);
         this.close();
         */
    },
    todayClicked: function () {
        this.setDay(date('Y-m-d'));
        /*var value = this._getVar("day");
         this.options.title =this.options.titles["d"];
         this.displayButtonVal(value);
         this.close(); */
    },
    demainClicked: function () {
        var currentDay = intval(date('d'));
        var currentMonth = intval(date('m'));
        var currentYear = intval(date('Y'));

        var hier = date('Y-m-d', mktime(0, 0, 0, currentMonth, currentDay + 1, currentYear));

        this.setDay(hier);
        /* var value = this._getVar("day")+"+1";
         this.options.title =this.options.titles["d1"];
         this.displayButtonVal(value);
         this.close(); */

    },
    lastWeekClicked: function() {
        var currentDay = intval(date('d'));
        var currentMonth = intval(date('m'));
        var currentYear = intval(date('Y'));

        //var lastWeek = date('Y+W', mktime(0,0,0,currentMonth,currentDay-7,currentYear));
        //this.setWeek(lastWeek);
        this.setWeek(SerielUtils.getWeekForDay(date('Y-m-d', mktime(0,0,0,currentMonth,currentDay-7,currentYear))));

        /*var value = this._getVar("week")+"-1";
         this.options.title =this.options.titles["w_1"];
         this.displayButtonVal(value);
         this.close(); */


    },
    thisWeekClicked: function() {
        this.setWeek(SerielUtils.getWeekForDay(date('Y-m-d')));
        //this.setWeek(date('Y+W'));

        /* var value = this._getVar("week");
         this.options.title =this.options.titles["w"];
         this.displayButtonVal(value);
         this.close(); */

    },
    nextWeekClicked: function() {
        var currentDay = intval(date('d'));
        var currentMonth = intval(date('m'));
        var currentYear = intval(date('Y'));

        //var nextWeek = date('Y+W', mktime(0,0,0,currentMonth,currentDay+7,currentYear));
        //this.setWeek(nextWeek);
        this.setWeek(SerielUtils.getWeekForDay(date('Y-m-d', mktime(0,0,0,currentMonth,currentDay+7,currentYear))));
        /*
         * var value = this._getVar("week")+"+1";
         this.options.title =this.options.titles["w1"];
         this.displayButtonVal(value);
         this.close(); */
    },

    lastMonthClicked: function() {
        var currentDay = intval(date('d'));
        var currentMonth = intval(date('m'));
        var currentYear = intval(date('Y'));

        var lastMonth = date('Y-m', mktime(0,0,0,currentMonth-1,currentDay,currentYear));
        this.setMonth(lastMonth);
        /*var value = this._getVar("month")+"-1";
         this.options.title =this.options.titles["w_1"];
         this.displayButtonVal(value);
         this.close(); */
    },
    thisMonthClicked: function() {
        this.setMonth(date('Y-m'));
        /* var value = this._getVar("month");
         this.options.title =this.options.titles["w"];
         this.displayButtonVal(value);
         this.close(); */
    },
    nextMonthClicked: function() {
        var currentDay = intval(date('d'));
        var currentMonth = intval(date('m'));
        var currentYear = intval(date('Y'));

        var nextMonth = date('Y-m', mktime(0,0,0,currentMonth+1,currentDay,currentYear));
        this.setMonth(nextMonth);
        /* var value = this._getVar("month")+"+1";
         this.options.title =this.options.titles["w1"];
         this.displayButtonVal(value);
         this.close(); */
    },
    lastYearClicked: function() {
        var currentDay = intval(date('d'));
        var currentMonth = intval(date('m'));
        var currentYear = intval(date('Y'));

        var lastYear = date('Y', mktime(0,0,0,currentMonth,currentDay,currentYear-1));
        this.setYear(lastYear);
        /* var value = this._getVar("year")+"-1";
         this.options.title =this.options.titles["y_1"];
         this.displayButtonVal(value);
         this.close(); */
    },
    thisYearClicked: function() {
        this.setYear(date('Y'));
        /* var value = this._getVar("year");
         this.options.title =this.options.titles["y"];
         this.displayButtonVal(value);
         this.close(); */
    },
    nextYearClicked: function() {
        var currentDay = intval(date('d'));
        var currentMonth = intval(date('m'));
        var currentYear = intval(date('Y'));

        var nextYear= date('Y', mktime(0,0,0,currentMonth,currentDay,currentYear+1));
        this.setYear(nextYear);
        /* var value = this._getVar("year")+"+1";
         this.options.title =this.options.titles["y1"];
         this.displayButtonVal(value);
         this.close(); */
    },
    initTitles:function(){
        this.options.titles = {
            "d_1" : "Hier",
            "d" : "Aujourd'hui",
            "d1" : "Demain",
            "w_1" : "La semaine derni&egrave;re",
            "w" : "Cette semaine",
            "w1" : "La semaine prochaine",
            "m_1" : "Le mois dernier",
            "m" : "Ce mois-ci",
            "m1" : "Le mois prochain",
            "y_1" : "L'ann&eacute;e derni&egrave;re",
            "y" : "Cette ann&eacute;e",
            "y1" : "L'ann&eacute;e prochaine",
        }
    },
    setValAndRefresh: function(val) {
    	this.setVal(val);
        this.refreshButton();
        this.saveInputs();
    },
    setVal: function (val) {
        if (val == null || trim(val) == '') {
            this.options.val = val;
            this.options.valType = null;
            return;
        }


        console.log("VAL "+val)

        var splitted = explode('+', val);
        if (count(splitted) == 2) {
            this.setWeek(val);
            this.selectTab('week');
            return;
        }
        splitted = explode('::', val);
        if (count(splitted) == 2) {
            this.setPeriode(splitted[0], splitted[1]);
            if (splitted[0] == '') {
                this.hidePeriod1();
                $('.from .period_1', this.menu).attr('checked', false);
            } else {
                this.showPeriod1();
                $('.from .period_1', this.menu).attr('checked', true);
                var splittedDate = explode('-', splitted[0]);
                $('.dp1', this.menu).datepicker('setDate', new Date(splittedDate[0], intval(splittedDate[1]) - 1, splittedDate[2]));
            }

            if (splitted[1] == '') {
                this.hidePeriod2();
                $('.to .period_2', this.menu).attr('checked', false);
            } else {
                this.showPeriod2();
                $('.to .period_2', this.menu).attr('checked', true);
                var splittedDate = explode('-', splitted[1]);
                $('.dp2', this.menu).datepicker('setDate', new Date(splittedDate[0], intval(splittedDate[1]) - 1, splittedDate[2]));
            }

            //this.menu.msCalendarMultiDivWidget('gotoDiv', 'periode');

            return;
        }

        splitted = explode('-', val);
        if (count(splitted) == 3) {
            this.setDay(val);
            this.selectTab('day');
            $('.tab-day .day', this.menu).datepicker('setDate', new Date(splitted[0], intval(splitted[1]) - 1, splitted[2]));
            return;
        }
        if (count(splitted) == 2) {
            this.setMonth(val);
            this.selectTab('month');
            return;
        }
        if (count(splitted) == 1) {
            // This is a year.
            this.setYear(val);
            this.selectTab('year');
            return;
        }
    },
    setPeriode: function(d1,d2){
    	this.options.valType = 'periode';
        this.options.val = d1+'::'+d2;
        this.refreshButton();
        this.saveInputs();
        this.close();
    },
    hidePeriod1: function(){
    },
    hidePeriod2: function(){
    },
    showPeriod1: function(){
    },
    showPeriod2: function(){
    },
    saveInputs: function () {
        $('.inputs_save', this.options.widget).remove();
        
        if (this.isSpecialValue()) {
        	// Il s'agit d'une valeur speciale.
        	var input = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '" />');
        	input.attr('value', this.options.val);
        	input.appendTo(this.options.widget);

            this.options.widget.trigger('change', this.options.val);
            
            return;
        }

        if ((this.options.valType == 'day' || this.options.val == '' || this.options.val == null) && this.options.exportPeriod == false) {
            var dateHash = this.getDateSplitted(this.options.val);

            var inputDay = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '[day]" />');
            var inputMonth = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '[month]" />');
            var inputYear = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '[year]" />');

            if (this.options.val) {
                inputDay.attr('value', intval(dateHash['day']));
                inputMonth.attr('value', intval(dateHash['month']));
                inputYear.attr('value', intval(dateHash['year']));
            } else {
                inputDay.attr('value', '');
                inputMonth.attr('value', '');
                inputYear.attr('value', '');
            }

            inputDay.appendTo(this.options.widget);
            inputMonth.appendTo(this.options.widget);
            inputYear.appendTo(this.options.widget);

            this.options.widget.trigger('change', this.options.val);
            // this.element.trigger('change', this.options.val);

            return;
        }

        // Tous les autres types constituent une periode.
        var from = this.getFrom();
        var to = this.getTo();

        var fromHash = this.getDateSplitted(from);
        var toHash = this.getDateSplitted(to);

        var inputFromDay = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '[from][day]" />');
        var inputFromMonth = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '[from][month]" />');
        var inputFromYear = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '[from][year]" />');

        var inputToDay = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '[to][day]" />');
        var inputToMonth = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '[to][month]" />');
        var inputToYear = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '[to][year]" />');

        if (from) {
            inputFromDay.attr('value', intval(fromHash['day']));
            inputFromMonth.attr('value', intval(fromHash['month']));
            inputFromYear.attr('value', intval(fromHash['year']));
        } else {
            inputFromDay.attr('value', '');
            inputFromMonth.attr('value', '');
            inputFromYear.attr('value', '');
        }

        if (to) {
            inputToDay.attr('value', intval(toHash['day']));
            inputToMonth.attr('value', intval(toHash['month']));
            inputToYear.attr('value', intval(toHash['year']));
        } else {
            inputToDay.attr('value', '');
            inputToMonth.attr('value', '');
            inputToYear.attr('value', '');
        }

        inputFromDay.appendTo(this.options.widget);
        inputFromMonth.appendTo(this.options.widget);
        inputFromYear.appendTo(this.options.widget);

        inputToDay.appendTo(this.options.widget);
        inputToMonth.appendTo(this.options.widget);
        inputToYear.appendTo(this.options.widget);
        if( this.options.valType != 'periode' )
            this.options.widget.trigger('change', this.options.val);
        // this.element.trigger('change', this.options.val);
    },
    setVal_0: function (val) {
        this.options.val=val;
        this.options.title = val;
        var tab="";
        if( val[0] == "d"){
            tab = "day";
            this.selectTab(tab);
            if( val == "d" )
                this.options.title = this.options.titles["d"];
            else if( val[1]=="+" ){
                if(val[2]=="1" )
                    this.options.title = this.options.titles["d1"];
                else {
                    this.options.title = this._getVarString(tab) + " (n+" + val[2] + ")";
                    this.options.widget.find("."+tab+" .more_button input").val(val[2]);
                }
            } else if( val[1]=="-" ){
                if(val[2]=="1" )
                    this.options.title = this.options.titles["d_1"];
                else {
                    this.options.title = this._getVarString(tab) + " (n-" + val[2] + ")";
                    this.options.widget.find("."+tab+" .less_button input").val(val[2]);
                }
            }
        } else if( val[0] == "w"){
            tab = "week";
            this.selectTab(tab);
            if( val == "w" )
                this.options.title = this.options.titles["w"];
            else if( val[1]=="+" ){
                if(val[2]=="1" )
                    this.options.title = this.options.titles["w1"];
                else {
                    this.options.title = this._getVarString(tab) + " (n+" + val[2] + ")";
                    this.options.widget.find("."+tab+" .more_button input").val(val[2]);
                }
            } else if( val[1]=="-" ){
                if(val[2]=="1" )
                    this.options.title = this.options.titles["w_1"];
                else {
                    this.options.title = this._getVarString(tab) + " (n-" + val[2] + ")";
                    this.options.widget.find("."+tab+" .less_button input").val(val[2]);
                }
            }
        } else if( val[0] == "m"){
            tab = "month";
            this.selectTab(tab);
            if( val == "m" )
                this.options.title = this.options.titles["m"];
            else if( val[1]=="+" ){
                if(val[2]=="1" )
                    this.options.title = this.options.titles["m1"];
                else {
                    this.options.title = this._getVarString(tab) + " (n+" + val[2] + ")";
                    this.options.widget.find("."+tab+" .more_button input").val(val[2]);
                    console.log("."+tab+" .more_button input")
                }
            } else if( val[1]=="-" ){
                if(val[2]=="1" )
                    this.options.title = this.options.titles["m_1"];
                else {
                    this.options.title = this._getVarString(tab) + " (n-" + val[2] + ")";
                    this.options.widget.find("."+tab+" .less_button input").val(val[2]);
                }
            }
        } else if( val[0] == "y"){
            tab = "year";
            this.selectTab(tab);
            if( val == "y" )
                this.options.title = this.options.titles["y"];
            else if( val[1]=="+" ){
                if(val[2]=="1" )
                    this.options.title = this.options.titles["y1"];
                else {
                    this.options.title = this._getVarString(tab) + " (n+" + val[2] + ")";
                    this.options.widget.find("."+tab+" .more_button input").val(val[2]);
                }
            } else if( val[1]=="-" ){
                if(val[2]=="1" )
                    this.options.title = this.options.titles["y_1"];
                else {
                    this.options.title = this._getVarString(tab) + " (n-" + val[2] + ")";
                    this.options.widget.find("."+tab+" .less_button input").val(val[2]);
                }
            }
        }

        this.displayButtonVal(val);
        this.saveInputs();

    },
    saveInputs_0: function () {

        if ($(".outValue", this.options.widget).length == 0){
            var outvalue = $('<input class="outValue" type="hidden" name="outvalue" />');
            outvalue.val(this.options.val);
            outvalue.appendTo(this.options.widget);
        } else
            $(".outValue", this.options.widget).val(this.options.val);

        this.options.widget.trigger('change', this.options.title);

        return;

    },
    getName: function () {
        return this.options.inputName;
    },
    getVal: function () {
        return this.options.val;
    },
    getFrom: function () {
        if (this.options.val == '') {
            return '';
        }
        if (this.options.valType == 'day') {
            return this.options.val;
        } else if (this.options.valType == 'week') {
            var splitted = explode('+', this.options.val);
            var year = intval(splitted[0]);
            var week = intval(splitted[1]);
            return SerielUtils.getFirstDayOfWeek(year, week);
        } else if (this.options.valType == 'month') {
            return this.options.val + '-01';
        } else if (this.options.valType == 'year') {
            return this.options.val + '-01-01';
        } else if (this.options.valType == 'periode') {
            var splitted = explode('::', this.options.val);
            return splitted[0];
        }
    },
    getTo: function () {
        if (this.options.val == '') {
            return '';
        }
        if (this.options.valType == 'day') {
            return this.options.val;
        } else if (this.options.valType == 'week') {
            var splitted = explode('+', this.options.val);
            var year = intval(splitted[0]);
            var week = intval(splitted[1]);
            return SerielUtils.getLastDayOfWeek(year, week);
        } else if (this.options.valType == 'month') {
            var splitted = explode('-', this.options.val);
            var year = intval(splitted[0]);
            var month = intval(splitted[1]);

            return date('Y-m-d', mktime(0, 0, 0, month + 1, 0, year));
        } else if (this.options.valType == 'year') {
            return this.options.val + '-12-31';
        } else if (this.options.valType == 'periode') {
            var splitted = explode('::', this.options.val);
            return splitted[1];
        }
    },
    getDateSplitted: function (date) {
        var splitted = explode('-', date);
        if (count(splitted) == 3) {
            var day = splitted[2], month = splitted[1], year = splitted[0];

            return {'day': day, 'month': month, 'year': year};
        }

        return {'day': '', 'month': '', 'year': ''};

    },
    whoAmI: function () {
        return 'ser_dateWidget';
    },
    options: {
        tabs: 'day',
        prefered_pos: 'bottom',
        title: null,
        fixed_title: false,
        // INTERNE
        exportPeriod: false,
        valType: null,
        val: null,
        val1:null,
        val2:null
    }
});