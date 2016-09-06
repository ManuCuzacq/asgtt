
$.widget('seriel.multiChoiceWidget', $.seriel.ser_widget, {
    _create: function () {
        this._super();
        
        this.options.multi = this.element.hasClass('widget_multi');
        
        if (this.element.attr('show_special_values')) this.options.showSpecialValues = true;
        if (!this.options.showSpecialValues) {
        	$('ul.special_values', this.options.content).css('display', 'none');
        } else {
        	// ON insère des titres.
        	var titleNormal = $("<span class='title'>Valeurs normales</span>");
        	titleNormal.insertBefore($('ul:not(.special_values)', this.options.content));
        	
        	var titleSpecial = $("<span class='title'>Valeurs sp&eacute;ciales</span>");
        	titleSpecial.insertBefore($('ul.special_values', this.options.content));
        }
        
        this.options.widget.addClass('ser_multichoice_widget');
        this.options.content.addClass('ser_multichoice_widget_content');
        
        if (this.element.attr('ajax_url')) {
        	this.options.ajax_url = this.element.attr('ajax_url');
        	this.buildAjaxExtraParams();
        }
        
        this.useHeader(true);
        var head = this.getHeader();
        
        this.element.bind('before_open', $.proxy(this.opening, this));
        this.element.bind('after_open', $.proxy(this.opened, this));
        
        var ul = '<ul><li class="empty" tab="empty"><span>Vider</span></li></ul>';
        $(' > .head_content', head).append(ul);
		$('.empty', head).bind('click', $.proxy(this.emptyButtonClicked, this));
		
		// On crée le champ de recherche.
		var search = '<div class="search"><input type="text" name="search_widget" /></div>'
		$(' > .head_content', head).append(search);
		
		this.options.searchInput = $(' > .head_content > .search input', head);
		this.options.lastSearchVal = this.options.searchInput.val();
		this.options.searchInput.bind('keydown keyup keypressed mousedown mouseup click', $.proxy(this.checkSearchInput, this));
        
        //$(' > .head_content', head).html('M&Eacute;TIER');
        this.checkHeight();
        
        this.initElems();
        
        var numElems = this.options.elements.size();
        var dizaine = intval(numElems / 10);
        if (dizaine < 10) this.options.content.addClass('multichoice_'+(dizaine*10)+'a'+((dizaine*10)+9));
        else this.options.content.addClass('multichoice_100_et_plus');
        
        // Do we have a title here ?
        if (!this.options.title) {
        	var titleSpan = $('.title', this.options.button);
        	if (titleSpan.size() == 1) {
        		this.options.title = titleSpan.html();
        		if (titleSpan.hasClass('fixed')) this.options.fixed_title = true;
        	}
        }
        
        if (numElems >= this.options.minSearchItems || this.options.ajax_url) {
        	//$(' > .head_content > .search input', head).focus().select();
        } else {
        	$(' > .head_content > .search', head).css('display', 'none');
        }
        
        this.initValue();
    },
    buildAjaxExtraParams: function() {
    	this.options.ajax_extra_params = {};
    	
    	var container = $('.extra_params', this.element);
    	if (container.size() == 1) {
    		var spans = $(' > span', container);
    		for (var i = 0; i < spans.size(); i++) {
    			var span = $(spans.get(i));
    			var param_name = $('.param_name', span).html();
    			var param_value = $('.param_value', span).html();
    			
    			if (param_name) {
    				this.options.ajax_extra_params[param_name] = param_value;
    			}
    		}
    	}
    },
    initElems: function() {
    	this.options.elements = $(' > ul > li', this.options.content);
        
        if (this.options.multi) {
        	$(' > ul', this.options.content).selectable({ 'start': $.proxy(this.start, this), 'stop': $.proxy(this.stop, this), 'selected': $.proxy(this.selected, this), 'selecting': $.proxy(this.selecting, this), 'unselected': $.proxy(this.unselected, this), 'unselecting': $.proxy(this.unselecting, this) });
        	this.options.elements.bind('dblclick', $.proxy(this.elemDblClicked, this));
        } else {
        	this.options.elements.bind('click', $.proxy(this.elemClicked, this));
        }
    },
    initValue: function() {
    	var value = this.options.widget.attr('val');
    	this.options.elements.removeClass('ui-selected');
    	
    	if (value) {
    		if (this.options.multi) {
    			var splitted = explode('-', value);
    			
    			for (var i = 0; i < count(splitted); i++) {
    				var val = splitted[i];
    				val = str_replace('.', '\\.', val);
    				this.options.elements.filter('[val="'+val+'"]').addClass('ui-selected');
    			}
    		} else {
    			val = str_replace('.', '\\.', value);
    			this.options.elements.filter('[val="'+val+'"]').addClass('ui-selected');
    		}
    	}
    	
    	this.checkCurrentSel();
    },
    opening: function() {
    	if (this.options.ajax_url) return;
    	
    	// On vide le champ de recherche.
    	this.options.searchInput.val('');
    	this.checkSearchInput();
    },
    opened: function() {
    	var head = this.getHeader();
    	var search_div = this.options.searchInput.parent();
    	if (search_div.css('display') != 'none') this.options.searchInput.focus().select();
    },
    checkSearchInput: function() {
    	var val = this.options.searchInput.val();
    	if (val != this.options.lastSearchVal) {
    		this.options.lastSearchVal = val;
    		this.search(val);
    	}
    },
    search: function(val) {
    	if (this.options.ajax_url) {
    		if (this.options.ajaxTimeout) clearTimeout(this.options.ajaxTimeout);
    		this.options.ajaxTimeout = setTimeout($.proxy(this.ajaxRequest, this), 300);
    		this.setLoading();
    		return;
    	}
    	
    	if (trim(val) == '') {
    		this.options.elements.removeClass('search_hidden');
    		return;
    	}
    	
    	val = stripAccents(val);
    	var splitted = explode(' ', val);
    	var matchers = [];
    	for (var i = 0; i < count(splitted); i++) {
    		if (trim(splitted[i]) == '') continue;
    		matchers.push(new RegExp(splitted[i], 'i'));
    	}
    	
    	if (count(matchers) == 0) {
    		this.options.elements.removeClass('search_hidden');
    		return;
    	}
    	
    	for (var i = 0; i < this.options.elements.size(); i++) {
    		var elem = $(this.options.elements.get(i));
    		var txt = elem.html();
    		txt = stripAccents(txt);
    		
    		var match = true;
    		for (var j = 0; j < count(matchers); j++) {
    			matcher = matchers[j];
    			if (!txt.match(matcher)) {
    				match = false;
    				break;
    			}
    		}
    		
    		if (match) {
    			elem.removeClass('search_hidden');
    		} else {
    			elem.addClass('search_hidden');	
    		}
    		
    	}
    	console.log('search : '+val);
    },
    ajaxRequest: function() {
    	var val = this.options.lastSearchVal;
    	if (val != this.options.lastSearchAjax) {
    		this.options.lastSearchAjax = val;
    		
    		if (this.options.ajaxResquest) {
    			try {
    				this.options.ajaxResquest.abort();
    			} catch (ex) {
    				console.log('EXCEPTION STOPING AJAX REQUEST');
    			}
    		}
    		
    		if (trim(val) == '') {
    			$(' > ul', this.options.content).replaceWith($('<ul></ul>'));
    	    	this.initElems();
    	    	
    	    	this.hideLoading();
    	    	return;
    		}
    		
    		this.setLoading();
    		
    		var datas = { 'search': val };
    		if (this.options.ajax_extra_params) {
    			for (var name in this.options.ajax_extra_params) {
    				datas[name] = this.options.ajax_extra_params[name];
    			}
    		}
    		
    		this.options.ajaxResquest = $.ajax({type: 'POST', url: getUrlPrefix() + this.options.ajax_url, data: datas, success: $.proxy(this.ajaxReponse, this)});
    	}
    },
    ajaxReponse: function(res) {
    	var ul = $('<ul>'+res+'</ul>');
    	$(' > ul', this.options.content).replaceWith(ul);
    	
    	this.initElems();
    	
    	this.hideLoading();
    	//console.log("AJAX REPONSE");
    },
    displayButtonVal: function (val) {
    	if (this.options.title) {
	    	if (this.options.fixed_title || (!val)) {
	    		this.options.button.html('<span class="title">'+this.options.title+'</span>');
	    		return;
	    	}
    	}
        if (!val)
            val = "&nbsp;";
        this.options.button.html(val);
    },
    empty: function() {
    	this.options.elements.removeClass('ui-selected');
    	this.checkCurrentSel();
    },
    emptyButtonClicked: function() {
    	this.empty();
    	if (!this.options.multi) this.close();
    },
    elemClicked: function(event) {
    	// This should only be called on non multi select.
    	var target = $(event.currentTarget);
    	
    	this.options.elements.removeClass('ui-selected');
    	target.addClass('ui-selected');
    	
    	this.checkCurrentSel();
    	
    	this.close();
    },
    elemDblClicked: function() {
    	if (this.options.closeOnDblClick) this.close();
    },
    start: function(event) {
    	//console.log('multichoice: start');
    },
    stop: function(event) {
    	//console.log('multichoice: stop');
    	this.checkCurrentSel();
    },
    selected: function(event) {
    	//console.log('multichoice: selected');
    	//this.checkCurrentSel();
    },
    selecting: function(event) {
    	//console.log('multichoice: selecting');
    },
    unselected: function(event) {
    	//console.log('multichoice: unselected');
    	//this.checkCurrentSel();
    },
    unselecting: function(event) {
    	//console.log('multichoice: unselecting');
    },
    checkCurrentSel: function() {
    	var elems = $(' > ul > li.ui-selected', this.options.content);
    	var qte = elems.size();
    	
    	if (qte == 0) this.displayButtonVal(null);
    	
    	var newValues = {};
    	
    	var title = '';
    	var resume = '';
    	for (var i = 0; i < qte; i++) {
    		var elem = $(elems.get(i));
    		var name = elem.html();
    		
    		var value = elem.attr('val');
    		
    		newValues[value] = name;
    		console.log(value+': '+name);
    		
    		if (title != '') title += ' ; ';
    		title += name;
    		
    		resume += '<li>'+name+'</li>';
    	}
    	
    	this.options.values = newValues;
    	
    	var helper = this.getHelper();
    	this.options.widget.trigger('change', helper);
    	
    	if (qte > 1 && strlen(title) > this.options.maxTitleLength) {
    		this.displayButtonVal(qte+' &eacute;l&eacute;ment'+(qte>1?'s':''));
    	} else {
    		// Attention, s'il n'y a qu'un element selectionné, on controle les eventuelles classes supp.
        	if (qte == 1) {
        		var supp_classes = [];
        		
        		var elem = $(elems.get(0));
        		var classes = elem.attr("class").split(' ');
        		
        		for (var i = 0; i < count(classes); i++) {
        			var cl = classes[i];
        			if (cl != 'ui-widget-content') supp_classes.push(cl);
        		}
        		
        		if (count(supp_classes) > 0) {
        			title = "<span class='"+implode(' ', supp_classes)+"'>"+title+"</span>";
        		}
        	}
    		
    		this.displayButtonVal(title);
    	}
    	
        if (this.options.has_resume) {
        	if (resume) resume = '<ul>'+resume+'</ul>';

        	if (resume) {
        		this.setResume(0, '', resume);
        		$('span.res[res_pos=0] > label', this.options.resume_block).css('display', 'none');
        		//this.options.resume_block.css('display', 'block');
        	} else {
        		this.removeResume(0);
        		//$('span.res[res_pos=0] > label', this.options.resume_block).css('display', 'none');
        		//this.options.resume_block.css('display', 'none');
        	}
        }
    },
    getHelper: function() {
    	return { 'value': this.getVal(), 'hashValue': this.options.values };
    },
    setVal: function(val) {
    	this.empty();
    	if (!val) return;
    	var splitted = explode('-', val);
    	
    	var not_found = [];
    	
    	for (var i = 0; i < count(splitted); i++) {
    		var val = splitted[i];
    		val = str_replace('.', '\\.', val);
    		var elem = this.options.elements.filter('[val="'+val+'"]');
    		if (elem.size() == 0) {
    			not_found.push(val);
    		} else {
    			elem.addClass('ui-selected');
    		}
    	}
    	this.checkCurrentSel();
    	
    	if (count(not_found) > 0) {
    		// Est-on en mode ajax ?
    		if (this.options.ajax_url) {
        		this.setLoading();
        		var ids = implode('-', not_found);
        		$.ajax({type: 'POST', url: getUrlPrefix() + this.options.ajax_url, data: {'ids': ids}, success: $.proxy(this.ajaxIdsReponse, this)});
    		}
    	}
    },
    ajaxIdsReponse: function(res) {
    	var ul = $('<ul>'+res+'</ul>');
    	var lis = $(' > li', ul);
    	
    	lis.addClass('ui-selected');
    	
    	$(' > ul', this.options.content).replaceWith(ul);
    	
    	this.initElems();
    	
    	this.hideLoading();
    	
    	this.checkCurrentSel();
    },
    getVal: function() {
    	var res = '';
    	for (var id in this.options.values) {
    		if (res != '') res += '-';
    		res+= id;
    	}
    	return res;
    },
    getValuesHash: function() {
    	return this.options.values;
    },
    setLoading: function() {
    	var loading_div = $(' > .loading', this.options.content);
    	if (loading_div.size() == 0) {
    		loading_div = $('<div class="loading"></div>');
    		loading_div.appendTo(this.options.content);
    	}
		var head = this.getHeader();
		var height = head.height();
		
		loading_div.css('top', height+'px');
		loading_div.removeClass('hidden');
    },
    hideLoading: function() {
    	$(' > .loading', this.options.content).addClass('hidden');
    },
    whoAmI: function () {
        return 'multiChoiceWidget';
    },
    options: {
    	multi: false,
    	closeOnDblClick: true,
    	maxTitleLength: 30,
    	title: null,
    	fixed_title: false,
    	minSearchItems: 30,
    	ajax_url: null,
    	ajax_extra_params: {},
    	
    	// INSIDE
    	values: {},
    	elements: null,
    	lastSearchVal: '',
    	lastSearchAjax: '',
    	ajaxTimeout: null,
    	ajaxResquest: null,
    	
    	showSpecialValues: false
    }
});


function multiChoiceWidgetArrayResToFormData(datas, name, val) {
	if (val) {
		var splitted = explode('-', val);
		for (var i = 0; i < count(splitted); i++) {
			datas[name+'['+i+']'] = splitted[i];
		}
	}	
}
