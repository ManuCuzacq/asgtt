

var dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
var dayNamesMin = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
var dayNamesShort = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
var monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
var monthNamesShort = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

var datePickerOptions = {firstDay: 1, dayNames: dayNames, dayNamesMin: dayNamesMin, dayNamesShort: dayNamesShort, monthNames: monthNames, monthNamesShort: monthNamesShort, dateFormat: 'yy-mm-dd'};

var force_not_blocking_unload = false;

var SerielNumberUtils = {
	cleanFloat : function(val) {
		if (!val) return "";
		if (strpos(val, ',') !== false && strpos(val, '.') !== false) {
			// Il semble qu'on a une virgule en séparateur de milliers.
			val = str_replace(',', '', val);
		}
		return str_replace('&nbsp;', '', str_replace(' ', '', str_replace(',', '.', val)));
	}	
};

var SerielUtils = {
	getFirstDayOfFirstWeek: function(y) {
		return this.getFirstDayOfWeek(y, 1);
		/*var d1 = mktime(0,0,0,1,1,y),fd,cpt=0;
		var w = Number(date('W',d1));
		var dow = date('w',d1);

		if (w==1) // on recule pour trouver le premier jour de la semaine
		{
			fd = d1 ;
			while (Number(date('W',d1))==1)
			{
				fd = d1 ;
				cpt++;
				d1 = mktime(0,0,0,1,1-cpt,y);
			}
		}
		else // on avance jusqu'à trouver le premier jour qui est en semaine
				// 1
		{
			while (date('W',d1)!=1)
			{
				fd = d1 ;
				cpt++;
				d1 = mktime(0,0,0,1,1+cpt,y);
			}
			fd = d1 ;
		}
		
		return { d: Number(date('d',fd)), m: Number(date('m',fd)), y: Number(date('Y',fd)) };
		
		return fd ;*/
	},
	getWeeksArray: function(y) {
		if (document.body.seriel_weeks && document.body.seriel_weeks[y] )
			return document.body.seriel_weeks[y];
		
		var firstDay = SerielUtils.getFirstDayOfFirstWeek(y);
		var splitted = explode('-', firstDay);
		
		var inf1 = { 'd': intval(splitted[2]), 'm': intval(splitted[1]), 'y': intval(splitted[0]) };
		
		var w = 1;
		var inc = 0,d1,d2,yp=y;
		var res = new Array();
		
		if (inf1.d!=1 && inf1.m==1) 
		{ 
			inc = -7;
			w = date('W',mktime(0,0,0,inf1.m,inf1.d+inc,inf1.y)); 
			yp = y -1;
		}
		
		do
			{
				d1 = mktime(0,0,0,inf1.m,inf1.d+inc,inf1.y);
				d2 = mktime(0,0,0,inf1.m,inf1.d+inc+7,inf1.y);
				
				var sem = {ww: sprintf("%04d-%02d",yp,w),w: w,d1: d1, d2: d2 };
				
				if (yp!=y) { yp=y; w = 0 ; }

				res.push(sem);
				
				d2 = mktime(0,0,0,inf1.m,inf1.d+inc+7,inf1.y);
				
				inc+=7 ;
				
				w = w+1 ;
				// if (w==53) w=1 ;
			}
		
		while (date('Y',d2)==y);
		
		if (document.body.seriel_weeks==null)
			document.body.seriel_weeks = new Array();
		
		document.body.seriel_weeks[y] = res;
		
		return res ;
	},
	getWeeksByMonth: function(m,y) {
		var weeks = SerielUtils.getWeeksArray(y);
		var res = new Array();
		
		for(var w in weeks)
		{
			var m1 = Number(date('m',weeks[w].d1)); 
			var y1 = Number(date('Y',weeks[w].d1));
			var m2 =  Number(date('m',weeks[w].d2));
			var y2 =  Number(date('Y',weeks[w].d2));
			
			if (( m1==m && y1==y) || (m2==m && y2==y))
				res.push(weeks[w]);
		}
		
		return res ;
	},
	getFirstDayOfWeek: function(year, week) {
		week = intval(week);
		
		var offset = date('w', mktime(0,0,0,1,1,year));
		offset = (offset < 5) ? 1-offset : 8-offset;
		var monday = mktime(0,0,0,1,1+offset,year);
		var time = strtotime('+' + (week - 1) + ' weeks', monday);
		return date('Y-m-d',time);
	},
	getLastDayOfWeek: function(year, week) {
		week = intval(week);
		
		var offset = date('w', mktime(0,0,0,1,1,year));
		offset = (offset < 5) ? 1-offset : 8-offset;
		var monday = mktime(0,0,0,1,1+offset,year);
		var time = strtotime('+' + (week - 1) + ' weeks', monday);
		return date('Y-m-d',time + (6 * 24 * 60 * 60) + 1);
	},
	getWeekForDay: function(day) {
		var splitted = explode('-', day);
		var y = intval(splitted[0]);
		var m = intval(splitted[1]);
		var d = intval(splitted[2]);
		
		var week = date('Y+W', mktime(12,0,0,m,d,y));
		
		// On vérifie (cas de figure des année demarrant le 28 dec).
		var lastDayOfWeek = this.getLastDayOfWeek();
		if (lastDayOfWeek < day) {
			week = date('Y+W', mktime(12,0,0,m,d+7,y));
		}
		
		return week;
	},
	getCurrentWeek: function() {
		return this.getWeekForDay(date('Y-m-d'));
	},
	calcMinutesDiff: function(min1, min2) {
		if ((!min1) || (!min2)) return null;
		
		var splitted = explode(':', min1);
		if (count(splitted) == 1) {
			splitted = explode('h', min1);
			if (count(splitted) != 2) return null;
		}
		
		var hour = intval(splitted[0]);
		var minutes = intval(splitted[1]);
		
		var time1 = (hour*60) + minutes;
		
		var splitted = explode(':', min2);
		if (count(splitted) == 1) {
			splitted = explode('h', min2);
			if (count(splitted) != 2) return null;
		}
		
		var hour = intval(splitted[0]);
		var minutes = intval(splitted[1]);
		
		var time2 = (hour*60) + minutes;
		
		return time2 - time1;
	}
};


var is_dev = false;
var devInit = false;
function isDev() {
	if (devInit == false) {
		if (strpos(document.location.href, 'app_dev.php') > 0) {
			is_dev = true;
		}
		devInit = true;
	}
	return is_dev;
}

function getUrlPrefix() {
	return (isDev() ? '/app_dev.php' : '');
}

function getMonthStrForNum(numMonth) {
    return monthNames[numMonth - 1];
}

function niceDayDate(date) {
    var splitted = explode('-', date);
    var year = splitted[0];
    var month = splitted[1];
    var day = splitted[2];

    var strDay = intval(day);
    if (strDay == 1)
        strDay = strDay + 'er';

    return strDay + ' ' + strtolower(getMonthStrForNum(intval(month))) + ' ' + year;
}





function getBodyContent(data) {
    var debut = strpos(data, '<body');
    if (debut) {
        var tmp = substr(data, debut);
        var bodyClose = strpos(tmp, '>');
        tmp = substr(tmp, bodyClose + 1);

        var fin = strpos(tmp, '</body>');
        if (fin) {
            var res = substr(tmp, 0, fin);
            return res;
            /*
			 * var obj = $(res); alert(res);alert(obj); return obj.html();
			 */
        }
    }
    return data;
}



function transformAncres(ancres) {
    if (!ancres)
        return;
    for (var i = 0; i < ancres.size(); i++) {
        var ancre = $(ancres.get(i));
        if (!inDom(ancre)) continue;
        if (!ancre.hasClass('rotation_done')) {
            var span = $(' > span', ancre);
            var width = span.width();
            var height = span.height();

            if (width && height) {
                span.width(width + 1);
                span.height(height + 1);
                span.css('top', (width + 12) + 'px');
                span.css('left', '9px');
                ancre.height(width + 24);
                ancre.addClass('rotation_done');
            }
        }
    }
}

function blockDeleteKey() {
    $(document).unbind('keydown.blockback');
    $(document).bind('keydown.blockback', function (event) {
        if (event.which == 8) {
            var target = $(event.target);
            // console.log('back '+target.get(0)+' ['+target.attr('type')+']');
            if (target.is('input:not([type=button], [type=image], [type=submit]), textarea'))
                return;
            // console.log('back blocked');
            return false;
        }
    });
}


function inDom(elem) {
    if (!elem)
        return false;
    var body = $(elem).closest('body');
    if (body && body.size() == 1)
        return true;
    return false;
}

function editorTextEmpty(text) {
	if (!text) return true;
	if (trim(text) == '') return true;
	
	var tmpText = str_replace(' ', '', str_replace('&nbsp;', '', text));
	if (tmpText == '') return true;
	if (tmpText == '<p></p>') return true;
	tmpText = str_replace('<p>', '', str_replace('</p>', '', tmpText));
	if (trim(tmpText) == '') return true;
	
	return false;
}

function buildKeyFromUrl(url) {
	if (!url) return null;
	
	if (substr(url, 0, 13) == '/app_dev.php/') return substr(url, 12);
	if (substr(url, 0, 9) == '/app_dev/') return substr(url, 8);
	if (substr(url, 0, 9) == '/app.php/') return substr(url, 8);
	if (substr(url, 0, 5) == '/app/') return substr(url, 4);
	
	if (substr(url, 0, 12) == 'app_dev.php/') return substr(url, 11);
	if (substr(url, 0, 8) == 'app_dev/') return substr(url, 7);
	if (substr(url, 0, 8) == 'app.php/') return substr(url, 7);
	if (substr(url, 0, 4) == 'app/') return substr(url, 3);
	
	return url;
}

function explodeDOI(doi) {
	if (!doi) return null;
	var splitted = explode(' ', doi);
	var doi = splitted[count(splitted)-1];
	
	splitted = explode('-', doi);
	if (count(splitted) == 2) {
		return splitted;
	}
	
	return null;
}

function downloadURL(url) {
    /*
	 * var hiddenIFrameID = 'hiddenDownloader', iframe =
	 * document.getElementById(hiddenIFrameID); if (iframe === null) { iframe =
	 * document.createElement('iframe'); iframe.id = hiddenIFrameID;
	 * iframe.style.display = 'none'; document.body.appendChild(iframe); }
	 * iframe.src = url;
	 */
	
	var anchor = document.createElement('a');
	    anchor.setAttribute('href', url);
	    anchor.setAttribute('download', '');

	/*
	 * Click the anchor
	 */

	// Chrome can do anchor.click(), but let's do something that Firefox can
	// handle too

	// Create event
	var ev = document.createEvent("MouseEvents");
	    ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

	// Fire event
	anchor.dispatchEvent(ev);
}















/**
 * Retourne le premier jour de la premiére semaine de l'année
 * @param y
 * @returns { d , m, y  }
 */
function seriel_get_firstDayOfFirstWeek(y)
{
	var d1 = mktime(0,0,0,1,1,y),fd,cpt=0;
	var w = Number(date('W',d1));
	var dow = date('w',d1);

	if (w==1) // on recule pour trouver le premier jour de la semaine
	{
		fd = d1 ;
		while (Number(date('W',d1))==1)
		{
			fd = d1 ;
			cpt++;
			d1 = mktime(0,0,0,1,1-cpt,y);
		}
	}
	else // on avance jusqu'à trouver le premier jour qui est en semaine 1
	{
		while (date('W',d1)!=1)
		{
			fd = d1 ;
			cpt++;
			d1 = mktime(0,0,0,1,1+cpt,y);
		}
		fd = d1 ;
	}
	
	return { d: Number(date('d',fd)), m: Number(date('m',fd)), y: Number(date('Y',fd)) };
	
	return fd ;
}

// Retourne le tableau des semaines de l'année
function seriel_get_weeks_array(y)
{
	if (document.body.seriel_weeks && document.body.seriel_weeks[y] )
		return document.body.seriel_weeks[y] ;
	
	var inf1 = seriel_get_firstDayOfFirstWeek(y);
	var w = 1 ;
	var inc = 0,d1,d2,yp=y ;
	var res = new Array();
	
	if (inf1.d!=1 && inf1.m==1) 
	{ 
		inc = -7; 
		w = date('W',mktime(0,0,0,inf1.m,inf1.d+inc,inf1.y)) ; 
		yp = y -1 ;
	}
	
	do
		{
			
			d1 = mktime(0,0,0,inf1.m,inf1.d+inc,inf1.y);
			d2 = mktime(0,0,0,inf1.m,inf1.d+inc+7,inf1.y);
			
			var sem = {ww: sprintf("%04d-%02d",yp,w),w: w,d1: d1, d2: d2 } ;
			
			if (yp!=y) { yp=y; w = 0 ; }

			res.push(sem);
			
			d2 = mktime(0,0,0,inf1.m,inf1.d+inc+7,inf1.y);
			
			inc+=7 ;
			
			w = w+1 ;
			//if (w==53) w=1 ;
		}
	
	while (date('Y',d2)==y);
	
	if (document.body.seriel_weeks==null)
		document.body.seriel_weeks = new Array();
	
	document.body.seriel_weeks[y] = res ;
	
	return res ;
}

// Retourne les semaines d'un mois
function seriel_get_weeks_by_month(m,y)
{
	var weeks = seriel_get_weeks_array(y);
	var res = new Array();
	
	for(var w in weeks)
	{
		var m1 = Number(date('m',weeks[w].d1)); 
		var y1 = Number(date('Y',weeks[w].d1));
		var m2 =  Number(date('m',weeks[w].d2));
		var y2 =  Number(date('Y',weeks[w].d2));
		
		if (( m1==m && y1==y) || (m2==m && y2==y))
			res.push(weeks[w]);
	}
	
	return res ;
}

function seriel_get_first_day_of_week(year, week) {
	week = intval(week);
	
	var offset = date('w', mktime(0,0,0,1,1,year));
	offset = (offset < 5) ? 1-offset : 8-offset;
	var monday = mktime(0,0,0,1,1+offset,year);
	var time = strtotime('+' + (week - 1) + ' weeks', monday);
	return date('Y-m-d',time);
}

$.widget('seriel.fast_filter', {
	_create: function() {
		this.element.bind('keyup', $.proxy(this.filter, this));
	},
	filter: function() {
		var filt = this.element.val();
		
		for (var i = 0; i < this.options.elems.size(); i++) {
			var elem = $(this.options.elems.get(i));
			
			if (elem.text().search(new RegExp(filt, "i")) < 0) {
                elem.css('display', 'none');
            } else {
            	elem.css('display', this.options.display);
                //count++;
            }
		}
	},
	options: {
		elems: null,
		display: 'inline-block'
	}
});

stripAccents = (function() {
    var translate_re = /[¹²³áàâãäåaaaÀÁÂÃÄÅAAAÆccç©CCÇÐÐèéê?ëeeeeeÈÊË?EEEEE€gGiìíîïìiiiÌÍÎÏ?ÌIIIlLnnñNNÑòóôõöoooøÒÓÔÕÖOOOØŒr®Ršs?ßŠS?ùúûüuuuuÙÚÛÜUUUUýÿÝŸžzzŽZZ]/g;
    var translate = {
"¹":"1","²":"2","³":"3","á":"a","à":"a","â":"a","ã":"a","ä":"a","å":"a","a":"a","a":"a","a":"a","À":"a","Á":"a","Â":"a","Ã":"a","Ä":"a","Å":"a","A":"a","A":"a",
"A":"a","Æ":"a","c":"c","c":"c","ç":"c","©":"c","C":"c","C":"c","Ç":"c","Ð":"d","Ð":"d","è":"e","é":"e","ê":"e","?":"e","ë":"e","e":"e","e":"e","e":"e","e":"e",
"e":"e","È":"e","Ê":"e","Ë":"e","?":"e","E":"e","E":"e","E":"e","E":"e","E":"e","€":"e","g":"g","G":"g","i":"i","ì":"i","í":"i","î":"i","ï":"i","ì":"i","i":"i",
"i":"i","i":"i","Ì":"i","Í":"i","Î":"i","Ï":"i","?":"i","Ì":"i","I":"i","I":"i","I":"i","l":"l","L":"l","n":"n","n":"n","ñ":"n","N":"n","N":"n","Ñ":"n","ò":"o",
"ó":"o","ô":"o","õ":"o","ö":"o","o":"o","o":"o","o":"o","ø":"o","Ò":"o","Ó":"o","Ô":"o","Õ":"o","Ö":"o","O":"o","O":"o","O":"o","Ø":"o","Œ":"o","r":"r","®":"r",
"R":"r","š":"s","s":"s","?":"s","ß":"s","Š":"s","S":"s","?":"s","ù":"u","ú":"u","û":"u","ü":"u","u":"u","u":"u","u":"u","u":"u","Ù":"u","Ú":"u","Û":"u","Ü":"u",
"U":"u","U":"u","U":"u","U":"u","ý":"y","ÿ":"y","Ý":"y","Ÿ":"y","ž":"z","z":"z","z":"z","Ž":"z","Z":"z","Z":"z"
    };
    return function(s) {
        return(s.replace(translate_re, function(match){return translate[match];}) );
    }
})();

function getTimeInMillis() {
	return time()+''+(new Date().getMilliseconds())
}


//TODO : make it cleaner than these two global functions.
function loadFieldsSearchFromParams(params, container) {
	var type = null;
	if (params === null) params = {};
	type = params['t'];
	
	//var container = $('.search_button[rel='+type+']', this.element).parent();
	var widgets = $('ul > li > .widget', container);
	if (widgets.size() == 0) {
		if (container.hasClass('widget')) widgets = container;
	}
	
	var paramsFound = {};
	for (var i = 0; i < widgets.size(); i++) {
		var widget = $(widgets.get(i));
		var variables = null;
		var widgetName = null;

		if (widget.data('ser_widget_object')) {
			var obj = widget.data('ser_widget_object');
			
			obj.emptyOtherParams(array_keys(params));
			
			for (var param in params) {
				if (paramsFound[param]) {
					//console.log('already found '+param);
					continue;
				}
				
				// On essaie de passer la valeur.
				// Si le widget n'y parvient pas, il nous renvoie false.
				var got_it = obj.setParamVal(param, params[param]);
				if (got_it) {
					paramsFound[param] = true;
					//break;
				}
			}
		}
	}
}

function getParamsFromSearchStr(search_str) {
	var splitted = explode(',', search_str);
    params = {};
    for (var i = 0; i < count(splitted); i++) {
        var pm = splitted[i];
        var splitted2 = explode('=', pm);
        if (count(splitted2) == 2) {
            var key = splitted2[0];
            var val = splitted2[1];

            if (key) {
                params[key] = val;
            }
        }
    }
    
    return params;
}

function buildSearchStr(container) {
	var widgets = $('ul > li > .widget', container);

	var args = {};
	for (var i = 0; i < widgets.size(); i++) {
		var widget = $(widgets.get(i));
		var variables = null;
		var widgetName = null;

		if (widget.data('ser_widget_object')) {
			obj = widget.data('ser_widget_object');

			variables = obj.getVal();
			widgetName = obj.getName();
		}
		// var variables = widget.ser_widget('getVal');

		// console.log(i+'. '+variables+' : '+(typeof variables));

		if (variables) {
			if (typeof variables == 'string')
				args[widgetName] = variables;
			else
				args = array_merge(args, variables);
		}
	}

	var realArgs = {};
	for ( var key in args) {
		var val = args[key];
		if (!val)
			continue;

		realArgs[key] = val;
	}

	args = realArgs;

	var search_str = "";
	for (var key in args) {
		if (search_str != "")
			search_str += ',';
		search_str += key + "=" + args[key];
	}
	
	return search_str;
}

function unselect_all_text() {
	if (window.getSelection) {
		if (window.getSelection().empty) {  // Chrome
			window.getSelection().empty();
		} else if (window.getSelection().removeAllRanges) {  // Firefox
			window.getSelection().removeAllRanges();
		}
	} else if (document.selection) {  // IE?
		document.selection.empty();
	}
}

function controlUncheckableRadioMouseDown(event) {
	var target = $(event.currentTarget);
	var checked = target.prop('checked');
	if (checked) target.attr('ser_checked', '1');
	else target.attr('ser_checked', '0');
	
	return true;
}

function controlUncheckableRadio(event) {
	var target = $(event.currentTarget);
	var ser_checked = intval(target.attr('ser_checked'));
	
	target.removeAttr('ser_checked');
	
	if (ser_checked) {
		target.prop('checked', false);
		target.trigger('change');
	}
	
	return true;
}

function initUncheckableRadio(content) {
	$('.uncheckable_radio input[type=radio]', content).on('mousedown', controlUncheckableRadioMouseDown);
	$('.uncheckable_radio input[type=radio]', content).on('click', controlUncheckableRadio);	
}

$(document).ready(function() {
	// On interdit le drop de fichier.
	$(document).on('dragover', function(e) { e.preventDefault(); e.stopPropagation(); /*console.log('dragover');*/ return false; });
	$(document).on('drop', function(e) { e.preventDefault(); e.stopPropagation(); /*console.log('drop');*/ return false; });
	
	// On bloque le context menu.
	$(document).on('contextmenu', function(e) { e.preventDefault(); e.stopPropagation();  return false; });
	
	initUncheckableRadio($('body'));
});

function getQueryParameters(str) {
	  return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
}

// TRIGGER EVENTS ON CLASS CHANGING
(function ($) {
  var methods = ['addClass', 'toggleClass', 'removeClass'];

  $.each(methods, function (index, method) {
    var originalMethod = $.fn[method];

    $.fn[method] = function () {
      if (!this[0]) {
    	  result = originalMethod.apply(this, arguments);
    	  this.trigger(method);
    	  return result;
      }
      var oldClass = this[0].className;
      var result = originalMethod.apply(this, arguments);
      var newClass = this[0].className;

      this.trigger(method, [oldClass, newClass]);

      return result;
    };
  });
}(window.jQuery || window.Zepto));

function reformatFormSerializedArray(datas) {
	var tmp_datas = {};
	
	for (var i = 0; i < count(datas); i++) {
		var elem = datas[i];
		tmp_datas[elem['name']] = elem['value'];
	}
	
	return tmp_datas;
} 