function initLists() {
	if ($('body').data('seriel-listActions')) {
        return;
    }
    $('body').listActions();
}

$.widget('seriel.listActions', {
	_create: function() {
		$(document).on('dblclick.list', 'tr.list_elem[type]', $.proxy(this.elemClicked, this));
	},
	addActionForType: function(type, action) {
		if (type && action) this.options.actionsByType[type] = action;
	},
	elemClicked: function(event) {
		var target = $(event.currentTarget);
		var type = target.attr('type');
		if (type) {
			var action = this.options.actionsByType[type];
			if (action) {
				action.call(this, target, event);
				unselect_all_text();
			}
		}
	},
	options: {
		actionsByType: {}
	}
}); 


$.widget('seriel.list_settings', $.seriel.modal_navigator, {
    _create: function () {
    	this._super();
    	
    	this.options.listFrom = $('.list_from', this.element);
    	this.options.listTo = $('.list_to', this.element);
    	
    	var listFromTitle = $(' > .title', this.options.listFrom);
    	var listFromTitleHeight = intval(listFromTitle.height() + intval(listFromTitle.css('padding-top')) + intval(listFromTitle.css('padding-bottom')));
    	
    	var listFromCnt = $(' > .cnt', this.options.listFrom);
    	listFromCnt.css('top', intval(listFromTitleHeight)+'px');
    	
    	var listToTitle = $(' > .title', this.options.listTo);
    	var listToTitleHeight = intval(listToTitle.height() + intval(listToTitle.css('padding-top')) + intval(listToTitle.css('padding-bottom')));
    	
    	var listToCnt = $(' > .cnt', this.options.listTo);
    	listToCnt.css('top', intval(listToTitleHeight)+'px');
    	
    	$('li', this.options.listFrom).bind('click', $.proxy(this.elemFromClicked, this));
    	$('li .remove', this.options.listTo).bind('click', $.proxy(this.elemToRemoveClicked, this));
    	
    	$('ul', this.options.listTo).sortable({ 'axis': 'y' });
        
        /*
		 * $(".list_from, .list_to", this.element).sortable({ connectWith:
		 * $(".sortable_list",this.element), revert: "invalid", zIndex: 200,
		 * opacity: 0.75, cursor: "move", stop: function (event, ui) {
		 * that.save(); } }).disableSelection();
		 */
    },
    elemFromClicked: function(event) {
    	var target = $(event.currentTarget);
    	var field_id = target.attr('field_id');
    	
    	if (!target.hasClass('selected')) {
    		// On ajoute.
    		this.addSelectedField(field_id);
    	} else {
    		// On retire.
    		this.removeSelectedField(field_id);
    	}
    },
    elemToRemoveClicked: function(event) {
    	var target = $(event.currentTarget);
    	var li = target.closest('li');
    	var field_id = li.attr('field_id');
    	
    	this.removeSelectedField(field_id);
    },
    addSelectedField: function(field_id) {
    	// On récupère l'élément dans la liste des from.
    	var fromElem = $('li[field_id=\''+field_id+'\']', this.options.listFrom);
    	var toElem = $('li[field_id=\''+field_id+'\']', this.options.listTo);
    	
    	if (toElem.size() >= 1) {
    		// This should not happen anyway.
    		fromElem.addClass('selected');
    		return;
    	}
    	
    	toElem = fromElem.clone();
    	$('.add', toElem).remove();
    	
    	$('.remove', toElem).bind('click', $.proxy(this.elemToRemoveClicked, this));
    	
    	var ul = $('ul', this.options.listTo);
    	
    	toElem.appendTo(ul);
    	fromElem.addClass('selected');
    	
    	$(' > .cnt', this.options.listTo).scrollTop(ul.height());
    },
    removeSelectedField: function(field_id) {
    	var fromElem = $('li[field_id=\''+field_id+'\']', this.options.listFrom);
    	var toElem = $('li[field_id=\''+field_id+'\']', this.options.listTo);
    	
    	toElem.remove();
    	fromElem.removeClass('selected');
    },
    gotResult: function (response, status, xhr) {
        // Do we have an error ?
        var inError = false;
        if (status == "error") {
            var code = xhr.status;
            var res = getBodyContent(response);
            this.options.destDiv.html('<div class="error_container"><div>' + res + '</div></div>');

            inError = true;
        }

        this.options.destDiv.removeClass('loading');
        if (inError) {
            this.options.destDiv.errorNav();
            return;
        }

    },
    koClicked: function () {
    	this.element.dialog('close');
    },
    okClicked: function() {
    	// On récupère tous les éléments dans le bon ordre et on sauvegarde.
    	var elems = $("li", this.options.listTo);
    	if (elems.size() == 0) {
    		var title = "Sélection";
            var content = "Veuillez sélectionner au minimum un champ.";
            this.showAlert(title, content);
            
    		return;
    	}
    	
    	var params = { 'type': $('.type_list', this.element).val() };
    	var context = $('.context', this.element).val();
    	if (context) params['context'] = context;
    	
    	var list_uid = $('.list_uid', this.element).val();
    	if (list_uid) {
    		params['list_uid'] = list_uid;
    	}
    	
    	var model_id = $('.list_model_id', this.element).val();
    	if (model_id) {
    		params['model_id'] = model_id;
    	}
    	
    	for (var i = 0; i < elems.size(); i++) {
    		var elem = $(elems.get(i));
    		var field_id = elem.attr('field_id');
    		params['fields['+i+']'] = field_id;
    	}
    	
    	this.setLoading();
    	
    	$.post(getUrlPrefix()+'/liste/save_settings', params, $.proxy(this.saved, this));
		return;
    	
    	/*
		 * for (var key in params) { alert(key+" => "+params[key]); }
		 */
    },
    saved: function(result) {
    	var list = this.getList();
    	if (list) {
    		var dataList = list.data('seriel-ser_list');
    		if (dataList) {
    			dataList.refresh();
    		}
    	}
    	
    	this.element.dialog('close');
    },
    getList: function() {
    	var list_uid = $('.list_uid', this.element).val();
    	var list = $('#'+list_uid);
    	
    	if (list.size() == 1) {
    		return list;
    	}
    	return null;
    },
    options: {
    	defaultLayout: false,
        destDiv: $("#ajax", this.element)
    }

});



$.widget('seriel.ser_list', {
    _create: function () {
    	this.element.addClass('ser_list');
    	
        this.options.type = $('.list_elem_type', this.element).html();
        
        if (!this.options.type) {
        	$('.list_settings', this.element).css('display', 'none');
        	$('.list_export', this.element).css('display', 'none');
        	$('.list_modif', this.element).css('display', 'none');
        }
        
        this.options.table = $('table.list', this.element);

        this.initTable();
        
        $('.list_settings', this.element).bind('click', $.proxy(this.configure, this));
        $('.list_export', this.element).bind('click', $.proxy(this.export_list, this));
        $('.list_modif', this.element).bind('click', $.proxy(this.modif_list, this));
        
        this.element.attr('created_at', time());
        listsMgr().register(this);
        
        // On place les filtres en en-tête.
        this.initFiltersFields();
        
        this.options.searchWidget = $('.list_search_widget', this.element);
        if (this.options.searchWidget.size() == 1) {
        	this.options.searchWidget.ser_listSearchWidget();
        	this.options.searchWidget.bind('filters', $.proxy(this.refreshWithFitlters, this));
        	var search_str_container = $('.search_str', this.element);
        	if (search_str_container.size() == 1) {
        		var serhash = parseHash('save_search['+search_str_container.html()+']');
        		var params = serhash[0].getParams();
        		this.options.searchWidget.ser_listSearchWidget('initValues', params);
        	}
        	
        }
        
        $('.list_head .right_modifs_actions_container .cancel_button', this.element).bind('click', $.proxy(this.cancelModifsClicked, this));
        $('.list_head .right_modifs_actions_container .valid_button', this.element).bind('click', $.proxy(this.validModifsClicked, this));
    },
    refreshWithFitlters: function() {
    	values = this.options.searchWidget.ser_listSearchWidget('getVal', true);
    	this.refresh(values);
    },
    checkBoutonModif: function() {
    	var modifButton = $('.list_modif', this.element);
    	
    	var editables = $('td.editable', this.options.table);
    	if (editables.size() == 0) {
    		modifButton.addClass('hidden');
    	} else {
    		modifButton.removeClass('hidden');
    	}
    },
    initFiltersFields: function() {
    	var filters_heads = $('span.head_title[filter]', this.options.table);
    	for (var i = 0; i < filters_heads.size(); i++) {
    		var head_span = $(filters_heads.get(i));
    		var th = head_span.closest('th');
    		var index = th.index();
    		
    		// On récupère le champ input et on le place dans les filtres.
    		var filter_td = $('tr.tablesorter-filter-row > td[data-column='+index+']', this.options.table);
    		
    		var inp = $(' > input', filter_td);
    		var clone = inp.clone();
    		clone.attr('placeholder', head_span.html());
    		clone.data('orig', inp);
    		clone.bind('keyup keydown keypress mouseup mousedown change click', $.proxy(this.filterCloneChanged, this));
    		
    		$('.list_head > .filters', this.element).append(clone);
    	}
    },
    filterCloneChanged: function(event) {
    	var target = $(event.currentTarget);
    	var orig = target.data('orig');
    	orig.val(target.val());
    	orig.trigger('keyup');
    },
    checkAllClicked: function(event) {
    	var target = $(event.currentTarget);
    	if (target.hasClass('uncheck')) {
    		this.uncheckAll();
    		target.removeClass('uncheck');
    	} else {
    		this.checkAll();
    		target.addClass('uncheck');
    	}
    },
    checkAll: function() {
    	var checkboxes = $('td > input[type=checkbox]', this.options.table);
    	for (var i = 0; i < checkboxes.size(); i++) {
    		var checkbox = $(checkboxes.get(i));
    		var checked = checkbox.prop('checked');
    		if (!checked) {
    			checkbox.prop('checked', true);
    			checkbox.trigger('change');
    		}
    	}
    	
    	// $('td > input[type=checkbox]', this.options.table).prop('checked',
		// true);
    },
    uncheckAll: function() {
    	var checkboxes = $('td > input[type=checkbox]', this.options.table);
    	for (var i = 0; i < checkboxes.size(); i++) {
    		var checkbox = $(checkboxes.get(i));
    		var checked = checkbox.prop('checked');
    		if (checked) {
    			checkbox.prop('checked', false);
    			checkbox.trigger('change');
    		}
    	}
    	
    	// $('td > input[type=checkbox]', this.options.table).prop('checked',
		// false);
    },
    getStickyHeader: function() {
    	var sticky = $(' > .tablesorter-sticky-wrapper > table', this.options.table.parent());
    	// alert(sticky.size());
    	if (sticky.size() == 1) return sticky;
    	return null;
    },
    initTable: function (complete) {
    	var list_elems = $('.list_elems', this.element);
    	var id = list_elems.attr('id');
    	
    	var widths = [];
    	var checkboxesTH = $('th.list_checkboxes', this.options.table);
    	if (checkboxesTH.size() == 1) {
    		this.options.hasCheckboxes = true;
    		
    		widths = [ '20px' ];
    	}
    	
    	var page = 0;
    	var pager = this.options.table.parent().next();
    	if (pager.size() == 1 && pager.hasClass('pager')) {
    		page = this.getCurrentPage() -1;
    		if (page <= 0) page = 0; 
    		pager.remove();
    	}

    	// var pageSizeSelect = $('<span class="page_size"><select
		// class="pagesize" title="Select page size"><option
		// value="50">50</option><option value="100">100</option><option
		// value="200">200</option></select> par page</span>');
    	var pageSizeSelect = $('<span class="page_size"><select class="pagesize" title="Select page size"><option value="50">50</option></select> par page</span>');
    	pager = $('<div class="pager"><span class="pages_selection"><span class="prev"></span> <span class="goto_page">page <select class="gotoPage"></select></span> <span class="next"></span></span> <span class="pagedisplay"></span></div>');
    	pageSizeSelect.prependTo(pager);
    	pager.insertAfter(this.options.table.parent());
    	
    	try {
        	this.options.table.tablesorter({
        		/* widthFixed: false, */
        		showProcessing: true,
                widgets: ['stickyHeaders', 'resizable', 'filter'],
                widgetOptions: {
                	resizable: false,
                	resizable_widths: widths,
                	resizable_addLastColumn: true,
                    stickyHeaders: 'tablesorter-stickyHeader',
                    /* stickyHeaders_attachTo: '.list_elems' */
                    stickyHeaders_attachTo: '#'+id
                }
            });
        	
        	pagerOptions = { 'container': pager
					, 'size': 50
					, 'output': '<span class="begin">{startRow}</span> &agrave; <span class="end">{endRow}</span> / <strong><span class="totalRows">{totalRows}</span></strong>' };
        	
        	this.options.isAjax = false;
        	
        	var search_params_container = $('.config > .search_params', this.element);
        	if (search_params_container.size() == 1 && (!this.element.hasClass('static'))) {
        		pagerOptions['ajaxUrl'] = getUrlPrefix()+'/liste/refresh/{page}?size={size}&{filterList:filter}&{sortList:column}';
        		pagerOptions['ajaxObject'] = { dataType: 'html' };
        		pagerOptions['customAjaxUrl'] = $.proxy(this.customAjaxUrl, this);
        		pagerOptions['processAjaxOnInit'] = false;
        		pagerOptions['ajaxProcessing'] = $.proxy(this.ajaxProcessing, this);
        		
        		this.options.isAjax = true;
        	}

    		var initSize = this.getInitListSize();
    		if (initSize >= 0) {
    			pagerOptions['totalRows'] = initSize;
    			pagerOptions['filteredRows'] = initSize;
        	}
        		
           	if (!complete) {
            	pagerOptions['page'] = page;        		
        	}
        	
        	this.options.table.tablesorterPager(pagerOptions);
        	
        	if (!complete) { this.options.table.data('update_params', { 'page': page }); }
        	this.options.table.bind('pagerComplete', $.proxy(this.tablePagerComplete, this));
        	
        	this.options.table.trigger('update');
        	
        	// Let's make sure our container is the right size.
        	setTimeout($.proxy(this.checkContainerHeight, this), 100);
        	setTimeout($.proxy(this.checkContainerHeight, this), 200);
        	setTimeout($.proxy(this.checkContainerHeight, this), 500);
        	setTimeout($.proxy(this.checkContainerHeight, this), 1000);
    	} catch (ex) {
    		console.log('********* LISTE ERROR TABLE : '+ex);
    	}
    	
    	this.options.table.bind('addClass toggleClass removeClass', $.proxy(this.tableClassChanged, this));
    	
    	if (checkboxesTH.size() == 1) {
    		checkboxesTH.css('width', '20px');
    		// On bind le changement sur les checkboxes.
    		$('td > input[type=checkbox]', this.options.table).bind('change', $.proxy(this.checkboxStateChanged, this));
    		
    		checkboxesTH.bind('click', $.proxy(this.checkAllClicked, this));
    		
    		// On récupère le sticky header s'il existe.
    		var stickyHeader = this.getStickyHeader();
    		if (stickyHeader) {
    			$('th.list_checkboxes', stickyHeader).bind('click', $.proxy(this.checkAllClicked, this));
    		}
    	}
    	
    	$('.tablesorter-resizable-container', this.element).css('height', '0');
    	
    	$('tbody > tr', this.options.table).bind('click contextmenu', $.proxy(this.lineClicked, this));
    	// $('tbody', this.options.table).selectable();//
    	
    	// Let's plug the contexte menu.
    	if (this.options.buildContextMenuCallback) {
        	$('tbody', this.options.table).contextMenu({
        		selector: 'tr',
        		build: this.options.buildContextMenuCallback
        	});
    	}
    	// this.options.table.css('min-width', 'none');
    	
    	this.checkBoutonModif();
    },
    tableClassChanged: function() {
    	if (this.options.table.hasClass('tablesorter-processing')) {
    		this.options.lastHadProcessingClass = true;
    		this.setLoading();
    	} else {
    		if (this.options.lastHadProcessingClass) {
    			this.options.lastHadProcessingClass = false;
    			this.hideLoading();
    			this.element.trigger('sorted');
    		}
    	}
    },
    customAjaxUrl: function(table, url) {
    	if (this.isModeEdit()) {
    		var qte_changed = this.getQteModifElemChanged();
        	
        	if (qte_changed > 0) {
        		var title = "Modifications en cours";
                var content = "Vous avez modifé "+qte_changed+" élément"+(qte_changed > 1 ? 's' : '')+".<br/>Vous devez annuler ou enregistrer "+(qte_changed > 1 ? 'les modifications' : 'la modification')+".";
                this.showAlert(title, content);
        		return '';
        	}
        	
        	this.removeModeEdit();
    	}
    	
        // manipulate the url string as you desire
        // url += '&currPage=' + window.location.pathname;
    	
    	// On split l'url.
    	var index = strpos(url, '?');
    	
    	var baseUrl = substr(url, 0, index); 
    	var get_params = substr(url, index+1);
    	var params = getQueryParameters(get_params);
    	
    	var head_spans = $('.list_elems > table > thead span.head_title', this.element);
    	
    	var real_params = {};
    	// on s'occupe de tous les filtres pour les retravailler.
    	for (var param in params) {
    		var indexFilter = strpos(param, 'filter[');
    		var indexColumn = strpos(param, 'column[');
    		
    		if (indexFilter === 0) {
    			var sub = substr(param, 7);
    			var colNum = intval(substr(sub, 0, strlen(sub) - 1));
    			
    			var head_span = $(head_spans.get(colNum));
    			
    			var filter = head_span.attr('filter');
    			var code = head_span.attr('code');
    			real_params['filter['+(filter ? filter : code)+']'] = params[param];
    		} else if (indexColumn === 0) {
    			var sub = substr(param, 7);
    			var colNum = intval(substr(sub, 0, strlen(sub) - 1));
    			
    			var head_span = $(head_spans.get(colNum));
    			var dbfield = head_span.attr('dbfield');
    			var dbfieldformat = head_span.attr('dbfieldformat');
    			var dbfieldsort = head_span.attr('dbfieldsort');
    			var code = head_span.attr('code');
    			// real_params['column['+(dbfield ? dbfield : code)+']'] =
				// params[param];
    			real_params['column['+(dbfieldsort ? dbfieldsort : (dbfieldformat ? dbfieldformat : (dbfield ? dbfield : '__none__')))+']'] = params[param];
    		} else {
    			if (param == 'filter') continue;
    			if (param == 'column') continue;
    			
    			real_params[param] = params[param];
    		}
    	}
    	
    	var params_str = "";
    	for (var key in real_params) {
    		if (params_str != '') params_str += "&";
    		params_str += key+"="+real_params[key];
    	}
    	// var params_str = $.param(real_params);
    	// alert(params_str);
    	
    	url = baseUrl + '?' + params_str;
    	
    	/*
		 * for (var key in real_params) { alert(key+' > '+real_params[key]); }
		 */
    	
    	var datas = this.getRefreshDatas();
    	
    	url += '&list_elem_type='+datas['type']+'&list_elem_refresh_infos='+datas['refresh_infos']+'&search_params='+datas['search_params']+'&search_options='+datas['search_options']+(datas && datas['context']?'&context='+datas['context']:'')+(datas && datas['columns']?'&columns='+datas['columns']:'')+(datas && datas['supp_renderers']?'&supp_renderers='+datas['supp_renderers']:'');

    	return url;

    	/*
		 * // trigger a custom event; if you want
		 * $(table).trigger('changingUrl', url); // send the server the current
		 * page return url;
		 */
    },
    ajaxProcessing: function(data) {
    	var total_span = $('.total', data);
    	var trs = $('tr', data);
    	var total = total_span.size() == 1 ? intval(total_span.html()) : 14;// trs.size();
    	
    	// alert(total);
    	
    	return [ total, trs ];
    	// alert('ajaxProcessing : '+data);
    },
    tablePagerComplete: function(table, test) {
    	// alert('pager complete !');
    	var trs = $('tbody > tr', this.options.table);
    	trs.unbind('click contextmenu');
    	trs.bind('click contextmenu', $.proxy(this.lineClicked, this));
    	
    	var checkboxesTH = $('th.list_checkboxes', this.options.table);
    	if (checkboxesTH.size() == 1) {
    		$('td > input[type=checkbox]', this.options.table).bind('change', $.proxy(this.checkboxStateChanged, this));
    	}
    },
    checkContainerHeight: function() {
    	var tableHeight = this.options.table.height();
    	$('.tablesorter-resizable-container > .tablesorter-resizable-handle', this.element).height(tableHeight - 1);
    	
    	// This seems to work fine.
    	return;
    	
    	var listElems = $('.list_elems', this.element);
    	var listElemsHeight = listElems.height();
    	var listElemsScrollHeight = listElems.get(0).scrollHeight;
    	var tableHeight = this.options.table.height();
    	
    	if (listElemsScrollHeight -10 <= listElemsHeight) return;
    	
    	console.log('HEIGHT : table['+tableHeight+'] / container['+listElemsHeight+'/'+listElemsScrollHeight+']');
    	
    	diff = listElemsScrollHeight - tableHeight;
    	if (diff > 10) {
    		// Let's work on it.
    		
    		$('.tablesorter-resizable-container > .tablesorter-resizable-handle', this.element).height(tableHeight - 1);
    		// this.options.table.detach();
    		// listElems.html('');
    		
    		// this.options.table.appendTo(listElems);
    		
    		/*
			 * var resizer = $('.resizer', this.element); if (resizer.size() >
			 * 0) { resizer.remove(); } else { var resizer = $('<div
			 * style="height: '+(diff+11)+'px; background: yellow"
			 * class="resizer"></div>');
			 * resizer.insertAfter(this.options.table);
			 * //setTimeout($.proxy(this.checkContainerHeight, this), 100);
			 * //setTimeout($.proxy(this.checkContainerHeight, this), 200); }
			 */
    		
    	}
    },
    checkboxStateChanged: function(event) {
    	var checkbox = $(event.currentTarget);
    	var tr = checkbox.closest('tr');
    	var uid = tr.attr('uid');
    	var checked = checkbox.is(':checked');
    	
    	this.checkCheckAllState();
    	
    	console.log('checkbox uid changed : '+uid+' : '+checked);
    	
    	this.element.trigger('check_state_change', [ uid, checked ]);
    },
    checkCheckAllState: function() {
    	var th = $('th.list_checkboxes', this.options.table);
    	var stickyHeader = this.getStickyHeader();
    	var thSticky = stickyHeader ? $('th.list_checkboxes', stickyHeader) : null;
    	
    	var checkboxes = $('td > input[type=checkbox]', this.options.table);
    	for (var i = 0; i < checkboxes.size(); i++) {
    		var checkbox = $(checkboxes.get(i));
    		var checked = checkbox.prop('checked');
    		
    		if (!checked) {
    			th.removeClass('uncheck');
    			if (thSticky) thSticky.removeClass('uncheck');
    			return;
    		}
    	}
    	
    	th.addClass('uncheck');
    	if (thSticky) thSticky.addClass('uncheck');
    },
    setBuildContextMenuCallback: function(callback) {
    	this.options.buildContextMenuCallback = callback;
    	if (this.options.buildContextMenuCallback) {
        	$('tbody', this.options.table).contextMenu({
        		selector: 'tr',
        		build: this.options.buildContextMenuCallback
        	});    		
    	}
    },
    /*
	 * _contextMenuBuild: function(trigger, e) { this.lineClicked(e); return
	 * this.options.buildContextMenuCallback.call(this, trigger, e); },
	 */
    clearBuildContextMenuCallback: function(callback) {
    	this.options.buildContextMenuCallback = null;
    },
    configure: function() {
    	var list_uid = this.element.attr('id');
    	// alert('configure : '+this.options.type);
    	var type = this.options.type;
    	var index = strrpos(type, "\\");
    	if (index) type = substr(type, index + 1);
    	
    	var datas = {};
    	
    	datas['type'] = this.options.type;
    	datas['list_uid'] = list_uid;
    	
    	// var url =
		// getUrlPrefix()+'/liste/settings?type='+this.options.type+'&list_uid='+list_uid;
    	var url = getUrlPrefix()+'/liste/settings';
    	
    	var context_container = $('.config > .list_context', this.element);
    	// if (context_container.size() == 1) url +=
		// '&context='+context_container.html();
    	if (context_container.size() == 1) datas['context'] = context_container.html();
    	
    	var supp_renderers = $('.config > .supp_renderers', this.element);
    	if (supp_renderers.size() == 1) datas['supp_renderers'] = supp_renderers.html();
    	
    	pnv(this.element).openModal('Paramètrage de liste : '+ucfirst(type), url, { 'post': datas });
    },
    showAlert: function (title, content) {
        this.options.alert = $('<div class="alert"><div class="alert_content">' + content + '</div><div class="alert_button"><span class="neutral_button"><span>OK</span></span></div></div>');
        this.options.alert.dialog({'modal': true, 'title': title, 'draggable': false, 'resizable': false, 'width': 350, 'appendTo': this.element, 'position': {my: "center", at: "center", of: this.element}});
        this.options.alert.parent().addClass('alert');
        $('.neutral_button', this.options.alert).bind('click', $.proxy(this.closeAlert, this));
        this.options.alert.dialog('open');
        
        // HACK !
		this.document.unbind( "focusin" );
    },
    closeAlert: function () {
        if (this.options.alert) {
        	var data = this.options.alert.data();
            if (this.options.alert.data('ui-dialog')) {
                this.options.alert.dialog('close');
                this.options.alert.remove();
                this.options.alert = null;
            }
        }
    },
    showConfirm: function(title, content, callback, ko_text, ok_text) {
    	if (!ko_text) ko_text = 'Non';
    	if (!ok_text) ok_text = 'Oui';
    	
    	this.options.alert = $('<div class="alert"><div class="alert_content">' + content + '</div><div class="alert_button"><span class="cancel_button"><span>'+ko_text+'</span></span><span class="valid_button"><span>'+ok_text+'</span></span></div></div>');
        this.options.alert.dialog({'modal': true, 'title': title, 'draggable': false, 'resizable': false, 'width': 450, 'appendTo': this.element, 'position': {my: "center", at: "center", of: this.element}});
        this.options.alert.parent().addClass('alert');
        $('.cancel_button', this.options.alert).bind('click', $.proxy(this.confirmNo, this));
        $('.valid_button', this.options.alert).bind('click', $.proxy(this.confirmYes, this));
        
        this.options.confirmCallback = callback;
        
        this.options.alert.dialog('open');
        
        // HACK !
		this.document.unbind( "focusin" );
    },
    confirmNo: function() {
    	if (this.options.confirmCallback) {
    		var callback = this.options.confirmCallback;
    		this.options.confirmCallback = null;
    		this.closeConfirm();
    		callback.call(this, false);
    	} else {
    		this.closeConfirm();
    	}
    },
    confirmYes: function() {
    	if (this.options.confirmCallback) {
    		var callback = this.options.confirmCallback;
    		this.options.confirmCallback = null;
    		this.closeConfirm();
    		callback.call(this, true);
    	} else {
    		this.closeConfirm();
    	}
    },
    closeConfirm: function () {
        if (this.options.alert) {
        	var data = this.options.alert.data();
            if (this.options.alert.data('ui-dialog')) {
                this.options.alert.dialog('close');
                this.options.alert.remove();
                this.options.alert = null;
            }
        }
    },
    getQteModifElemChanged: function() {
    	var editables = $('td.editable.edit', this.options.table);
    	
    	counterChanged = 0;
    	
    	for (var i = 0; i < editables.size(); i++) {
    		var editable = $(editables.get(i));

    		var span = $('.edit', editable);
    		var widget = span.attr('widget');
    		
    		var changed = false;
    		eval('changed = editable.'+widget+'(\'hasChanged\');');
    		
    		if (changed) {
    			counterChanged++;    			
    		}
    	}
    	
    	return counterChanged;
    },
    checkModifListHasChange: function() {
    	var qteChanged = this.getQteModifElemChanged();
    	if (qteChanged) {
    		this.showModifSave();
    	} else {
    		this.hideModifSave();
    	}
    },
    showModifSave: function() {
    	$('.list_head .right_modifs_actions_container .valid_button', this.element).removeClass('disabled');
    },
    hideModifSave: function() {
    	$('.list_head .right_modifs_actions_container .valid_button', this.element).addClass('disabled');
    },
    validModifsClicked: function() {
    	var button = $('.list_head .right_modifs_actions_container .valid_button', this.element);
    	if (button.hasClass('disabled')) return;
    	
    	var list_elem_type = $('.list_elem_type', this.element).html();
    	var list_elem_refresh_infos = $('.list_elem_refresh_infos', this.element).html();
    	
    	var datas = { 'list_elem_type': list_elem_type, 'list_elem_refresh_infos': list_elem_refresh_infos };
    	
    	var search_params_container = $('.config > .search_params', this.element);
    	var search_options_container = $('.config > .search_options', this.element);
    	
    	if (search_params_container.size() == 1) datas['search_params'] = search_params_container.html();
    	if (search_options_container.size() == 1) datas['search_options'] = search_options_container.html();

    	
    	
    	var thByIndex = {};

    	// On récupère les données modifiées.
    	var editables = $('td.editable.edit', this.options.table);
    	
    	for (var i = 0; i < editables.size(); i++) {
    		var editable = $(editables.get(i));

    		var span = $('.edit', editable);
    		var widget = span.attr('widget');
    		
    		var changed = false;
    		eval('changed = editable.'+widget+'(\'hasChanged\');');
    		
    		if (changed) {
    			var tr = editable.closest('tr');
    			var uid = tr.attr('uid');
    			
    			var index = editable.index();
    			var th = null;
    			if (thByIndex[index]) {
    				th = thByIndex[index];
    			} else {
    				th = this.getThForIndex(index);
    				thByIndex[index] = th;
    			}

    			var code = $('.head_title', th).attr('code');
    			var val = '';
    			eval('val = editable.'+widget+'(\'getVal\');');
    			
    			datas['modifs['+uid+']['+code+']'] = val;
    		}
    	}
    	
    	$.post(getUrlPrefix()+'/liste/live_modif', datas, $.proxy(this.modifSaved, this));
    	
    	this.setLoading();
    },
    modifSaved: function(result) {
    	var res = $(result);
    	if (res.hasClass('success')) {
    		this.refresh();
    		this.removeModeEdit();
    	} else {
    		this.hideLoading();
    		var title = "Echec de l'enregistrement";
            var content = "Echec de l'enregistrement des données.<br/>Veuillez réessayer.<br/><br/>Si le problème persiste, veuillez contacter l'administrateur du système.";
            this.showAlert(title, content);
    		return;
    	}
    },
    cancelModifsClicked: function() {
    	var qte_changed = this.getQteModifElemChanged();
    	
    	if (qte_changed == 0) {
    		this.cancelModifs();
    		return;
    	}
    	
    	var title = "Annuler ?"
    	var content = "Vous avez modifié "+qte_changed+" élément"+(qte_changed > 1 ? 's' : '')+'.<br/><br/>Si vous annulez, les données modifées seront perdues.'
    	this.showConfirm(title, content, $.proxy(this.cancelChoice, this), 'Continuer', 'Annuler et perdre les données');
    },
    cancelChoice: function(cancel) {
    	if (cancel) this.cancelModifs();
    },
    cancelModifs: function() {
    	this.hideModifSave();
    	this.modif_initBack();
    	var editables = $('td.editable.edit', this.options.table);
    	editables.removeClass('edit');
    	this.removeModeEdit();
    },
    modif_initBack: function() {
    	var editables = $('td.editable.edit', this.options.table);
    	
    	for (var i = 0; i < editables.size(); i++) {
    		var editable = $(editables.get(i));

    		var span = $('.edit', editable);
    		var widget = span.attr('widget');
    		
    		var changed = false;
    		eval('changed = editable.'+widget+'(\'hasChanged\');');
    		
    		if (changed) {
    			eval('editable.'+widget+'(\'setBackInitialValue\');');
    		}
    	}
    },
    getThForIndex: function(index) {
    	var head = $('thead > tr.tablesorter-headerRow:first-child', this.options.table);
    	return $('th:nth-child('+(intval(index)+1)+')', head);
    },
    modif_list: function() {
    	var indexes = {};
    	var editables = $('td.editable', this.options.table);
    	
    	// On récupère les colonnes.
    	for (var i = 0; i < editables.size(); i++) {
    		var editable = $(editables.get(i));
    		var index = editable.index();
    		indexes[index] = index;
    	}
    	
    	if (count(indexes) == 0) {
    		var title = "Aucune donnée modifiable";
            var content = "Cette page de donn&eacute;es ne contient aucune information modifiable.";
            this.showAlert(title, content);
    		return;
    	}
    	
    	// On fera mieux plus tard, pour l'instant, on édite tout ce qui peux
		// l'être.
    	
    	/*
		 * var content = $('<div><ul></ul></div>');
		 * 
		 * var columns = {}; var head = $('thead >
		 * tr.tablesorter-headerRow:first-child', this.options.table); // On
		 * récupère les colonnes à partir des index. for (var key in indexes) {
		 * var title = $('th:nth-child('+(intval(key)+1)+') .head_title',
		 * head).html();
		 * 
		 * alert(key+' : '+title); }
		 */
    	
    	for (var i = 0; i < editables.size(); i++) {
    		var editable = $(editables.get(i));
    		if (editable.hasClass('listeEditable')) continue;
    		var span = $('.edit', editable);
    		var widget = span.attr('widget');
    		
    		if (widget) {
    			editable.bind('change', $.proxy(this.checkModifListHasChange, this));
    			eval('editable.'+widget+'();');
    		}
    	}
    	
    	this.setModeEdit();
    	editables.addClass('edit');
    },
    getColumns: function() {
    	// On récupère les colonnes.
    	var head_spans = $('.list_elems > table > thead span.head_title', this.element);
    	var colonnes = [];
    	for (var i = 0; i < head_spans.size(); i++) {
    		var span = $(head_spans.get(i));
    		var code = span.attr('code');
    		colonnes.push(code);
    	}
    	return colonnes;
    },
    export_list: function() {
    	this.setLoading();
    	
    	var type = this.options.type;
    	
    	// On récupère les colonnes.
    	var head_spans = $('.list_elems > table > thead span.head_title', this.element);
    	var colonnes = [];
    	for (var i = 0; i < head_spans.size(); i++) {
    		var span = $(head_spans.get(i));
    		var code = span.attr('code');
    		colonnes.push(code);
    	}
    	var colonnes_str = implode(',', colonnes);
    	
    	var datas = { 'type': type, 'colonnes': colonnes_str };
    	
    	if (this.options.isAjax) {
    		var refresh_datas = this.getRefreshDatas();
    		
    		datas['list_elem_refresh_infos'] = refresh_datas['refresh_infos'];
    		datas['search_params'] = refresh_datas['search_params'];
    		datas['search_options'] = refresh_datas['search_options'];
    		datas['columns'] = refresh_datas['columns'];
    	} else {
    		if (this.hasCheckboxes()) {
    			var elems = this.getAllElemsCheckedUids();
    			var elems_str = implode(',', elems);
            	datas['uids'] = elems_str;
    		} else {
        		// On récupère tous les éléments.
            	var elems = this.getAllElemsUids();
            	var elems_str = implode(',', elems);
            	datas['uids'] = elems_str;
    		}
    	}
    	
    	var supp_renderers = $('.config > .supp_renderers', this.element);
    	if (supp_renderers.size() == 1) datas['supp_renderers'] = html_entity_decode(supp_renderers.html());
    	
    	$.post(getUrlPrefix()+'/liste/export', datas, $.proxy(this.exported, this));
    },
    hasCheckboxes: function() {
    	var th_check = $('th.list_checkboxes', this.element);
    	if (th_check.size() > 0) return true;
    },
    exported: function(result) {
    	var res = $(result);
    	if (res.hasClass('success')) {
    		var filename = $('.filename', res).html();
    		downloadURL(filename);
    	}
    	
    	this.hideLoading();
    },
    getRefreshDatas: function() {
    	var datas = {};
    	
    	datas['uid'] = this.element.attr('id');
    	
    	var type = $('.list_elem_type', this.element).html();
    	var refresh_infos = $('.list_elem_refresh_infos', this.element).html();
    	
    	datas['type'] = type;
    	datas['refresh_infos'] = refresh_infos;
    	
    	var search_params_container = $('.config > .search_params', this.element);
    	var search_options_container = $('.config > .search_options', this.element);
    	var context_container = $('.config > .list_context', this.element);
    	var columns_container = $('.config > .columns', this.element);
    	var supp_renderers_container = $('.config > .supp_renderers', this.element);
    	
    	if (search_params_container.size() == 1) datas['search_params'] = search_params_container.html();
    	if (search_options_container.size() == 1) datas['search_options'] = search_options_container.html();
    	if (context_container.size() == 1) datas['context'] = context_container.html();
    	if (columns_container.size() == 1) datas['columns'] = columns_container.html();
    	if (supp_renderers_container.size() == 1) datas['supp_renderers'] = supp_renderers_container.html();

    	return datas;
    },
    getInitListSize: function() {
    	var size_container = $('.config > .search_total', this.element);
    	if (size_container.size() == 1) {
    		return intval(size_container.html());
    	}
    	
    	return -1;
    },
    refresh: function(extra_filters) {
    	this.setLoading();
    	
    	/*var list_elem_type = $('.list_elem_type', this.element).html();
    	var list_elem_refresh_infos = $('.list_elem_refresh_infos', this.element).html();
    	
    	var datas = { 'list_elem_type': list_elem_type, 'list_elem_refresh_infos': list_elem_refresh_infos };
    	
    	var search_params_container = $('.config > .search_params', this.element);
    	var search_options_container = $('.config > .search_options', this.element);
    	
    	if (search_params_container.size() == 1) datas['search_params'] = search_params_container.html();
    	if (search_options_container.size() == 1) datas['search_options'] = search_options_container.html();*/
    	
    	var datas = this.getRefreshDatas();
    	
    	var pageSize = this.getPageSize();
        var page = this.getCurrentPage();
        
        datas['page'] = page;
        datas['size'] = pageSize;
        if (extra_filters) datas['extra_filters'] = extra_filters;
    	
    	$.post(getUrlPrefix()+'/liste/refresh', datas, $.proxy(this.refreshed, this));
    },
    refreshed: function(result) {
    	var res = $(result);
    	
    	if (res.hasClass('error')) {
    		toastr['error']('Erreur lors du rafraichissement de la liste.');
    		this.hideLoading();
    		return;
    	}
    	
    	var newTable = $('table.list', res);
    	
    	var sortList = this.options.table.get(0).config.sortList;
    	// this.options.table.trigger("destroy");
    	
    	var orig_search_params = $('.config > .search_params', this.element).html();
    	var new_search_params = $('.config > .search_params', res).html();
    	
    	var config_changed = false;
    	
    	if (new_search_params != orig_search_params) {
    		$('.config > .search_params', this.element).html(new_search_params);
    		var config_changed = true;
    	}
    	
    	var orig_search_total = intval($('.config > .search_total', this.element).html());
    	var new_search_total = intval($('.config > .search_total', res).html());
    	if (new_search_total != orig_search_total) {
    		$('.config > .search_total', this.element).html(new_search_total);
    		var config_changed = true;
    	}
    	
    	
    	
    	// Let's remove the sticky header.
    	$('.tablesorter-sticky-wrapper', this.element).remove();
    	
    	this.options.table.replaceWith(newTable);
    	this.options.table.remove();
    	this.options.table = newTable;
    	this.initTable(config_changed);
    	
    	this.options.table.trigger("update")
    	  	.trigger("sorton", [sortList])
    	  	.trigger("appendCache")
    	  	.trigger("applyWidgets");
    	
    	/*
		 * this.element.trigger('refreshed'); setTimeout($.proxy(function() {
		 * this.element.trigger('refreshed') }, this), 50);
		 */
    	setTimeout($.proxy(function() { this.element.trigger('refreshed') }, this), 100);
    	setTimeout($.proxy(function() { this.element.trigger('refreshed') }, this), 200);
    	
    	this.hideLoading();
    },
    getPageSize: function() {
    	var pageSizeSelect = $('.pager select.pagesize', this.element);
    	var pageSize = pageSizeSelect.val();
    	
    	return pageSize;
    },
    getCurrentPage: function() {
    	var pageSelect = $('.pager select.gotoPage', this.element);
    	var page = pageSelect.val();
    	
    	return page;
    },
    getAvailableSpaceBeforePaging: function() {
    	// Peut retourner une valeur négative.
    	var total = $('.pager .totalRows', this.element).html();
    	var pageSizeSelect = $('.pager select.pagesize', this.element);
    	var pageSize = pageSizeSelect.val();
    	
    	return intval(pageSize) - intval(total);
    	
    	// alert('pageSize : '+pageSize+' >> total : '+total);
    },
    getCurrentSortColumnAndOrder: function() {
    	var th = $('th.tablesorter-headerAsc, th.tablesorter-headerDesc', this.options.table);
    	
    	if (th.size() == 1) {
        	order = 'asc';
    		if (th.hasClass('tablesorter-headerDesc')) order = 'desc';
    			
    		var spanContainer = $(' > div > span', th);
    		var code = spanContainer.attr('code');
    		var sort_type = spanContainer.attr('sort_type');
    		
    		// On récupère l'index de la colonne.
    		var index = $(' > th', th.parent()).index(th);
    		
    		return { 'code': code, 'order': order, 'index': index, 'sort_type': sort_type };
    	}
    	
    	return null;
    },
    compare: function(method, val1, val2) {
    	if (method == 'digit') {
    		val1 = floatval(val1);
    		val2 = floatval(val2);
    	} else {
    		val1 = ''+val1;
    		val2 = ''+val2;
    	}
    	
    	if (val1 < val2) return -1;
    	if (val2 > val1) return 1;
    	return 0;
    },
    getPositionForSortRow: function(row) {
    	// Premièrement, on récupère le trie en cours.
    	var sortInfos = this.getCurrentSortColumnAndOrder();
    	if (!sortInfos) return -1;
    	
    	// On récupère l'index pour récupérer l'élément dans la "row".
    	var index = sortInfos['index'];
    	 
    	var td = $(' > td:nth-child('+(intval(index)+1)+')', row);
    	if (td.size() == 1) {
    		var sort_value = null;
    		var sort_attr = td.attr('seriel-sort-value');
    		if (typeof sort_attr !== typeof undefined && sort_attr !== false) {
    			sort_value = sort_attr;
    		} else {
    			sort_value = $(' > span', td).html();
    		}
    		
        	var sort_type = sortInfos['sort_type'];
        	var order = sortInfos['order'];
        	
        	// OK, on doit trouver la position de notre élément avec ces
			// informations.
        	// En premier lieu, on teste le premier et le dernier élément de la
			// liste.
        	var firstElem = $(' > tbody > tr:first-child', this.options.table);
        	var lastElem = $(' > tbody > tr:last-child', this.options.table);
        	
        	var firstElemTd = $(' > td:nth-child('+(intval(index)+1)+')', firstElem);
        	var lastElemTd = $(' > td:nth-child('+(intval(index)+1)+')', lastElem);
        	
        	if (firstElemTd.size() == 0) {
        		// La liste est vide.
        		return 1;
        	}
        	
        	var sort_first_value = null;
    		var sort_first_attr = firstElemTd.attr('seriel-sort-value');
    		if (typeof sort_first_attr !== typeof undefined && sort_first_attr !== false) {
    			sort_first_value = sort_first_attr;
    		} else {
    			sort_first_value = $(' > span', firstElemTd).html();
    		}
    		
    		var sort_last_value = null;
    		var sort_last_attr = lastElemTd.attr('seriel-sort-value');
    		if (typeof sort_last_attr !== typeof undefined && sort_last_attr !== false) {
    			sort_last_value = sort_last_attr;
    		} else {
    			sort_last_value = $(' > span', lastElemTd).html();
    		}
        	
        	// On fait un test en fonction du mode de trie.
        	if (order == 'desc') {
        		// On test si l'on se trouve avant le premier élément.
        		var cmp = this.compare(sort_type, sort_first_value, sort_value);
        		if (cmp < 1) { // sort_first_value < sort_value
        			return 0;
        		}
        		// On test si l'on se trouve après le premier élément.
        		cmp = this.compare(sort_type, sort_last_value, sort_value);
        		if (cmp > 1) { // sort_last_value > sort_value
        			return 10000;
        		}
        	} else { // order == 'asc
        		// On test si l'on se trouve avant le premier élément.
        		var cmp = this.compare(sort_type, sort_first_value, sort_value);
        		if (cmp > 1) { // sort_first_value > sort_value
        			return 0;
        		}
        		// On test si l'on se trouve après le premier élément.
        		cmp = this.compare(sort_type, sort_last_value, sort_value);
        		if (cmp < 1) { // sort_last_value < sort_value
        			return 10000;
        		}
        	}
        	
        	// Si l'on arrive ici, on doit avoir une valeur qui se trouve au
			// milieu.
        	return 10;
        	
        	
        	// alert('order['+order+'] / sort_type['+sort_type+'] /
			// sort_value['+sort_value+'] >>>> first['+sort_first_value+'] :
			// last['+sort_last_value+']');
    	}
    	
    	return -1;
    },
    elemsRefreshed: function(data) {
    	var newTotal = $('.count', data).html();
    	var elems_asked = explode('_', $('.elems_asked', data).html());
    	var elems = $('tr', data);
    	
    	// Let's build a hash of elems we hav in anwer.
    	elems_answered = {};
    	for (var i = 0; i < elems.size(); i++) {
    		var elem = $(elems.get(i));
    		
    		elems_answered[elem.attr('uid')] = elem;
    	}
    	
    	// Ou en est-on du nombre total de lignes par rapport à la pagination.
    	var availableRows = this.getAvailableSpaceBeforePaging();
    	
    	// On passe maintenant 1 à 1 les éléments demandé et on contrôle la
		// valeur de retour => On agit en conséquence.
    	for (var i = 0; i < count(elems_asked); i++) {
    		uid = elems_asked[i];
    		// A-t-on un élément en réponse ?
    		var elem = elems_answered[uid];
    		if (elem) {
    			var pos = this.getPositionForSortRow(elem);
    			
    			var orig_elem = this.getElemWithUid(uid);
    			if (orig_elem) {
    				// On le met à jour.
    				this.updateLine(elem);
    				if (pos != -1) {
    					if (pos >= 1) {
        					if (pos >= 10000) {
        						// On se situe en dehors de la liste, il va donc
								// falloir éliminer notre élément et en charger
								// un autre.
        						// this.removeLine(uid);
        						// alert('charger un élément en fin de liste.');
        					} else {
        						// Tout va bien, on doit éventuellement replacer
								// notre élément au meilleur endroit pour le
								// trie.
        					}
        				}
    				}
    			} else {
    				// On n'a pas l'element, il faut l'inserer.
    				if (pos != -1) {
    					if (pos >= 10000) {
        					// On ne l'insère pas.
    						if (availableRows > 0) {
    	    					this.addLine(elem);
    	    					availableRows--;
    						}
        				} else if (pos == 0) {
        					// On ne l'insère pas non plus en revanche, il faut
							// peut-être décaller les éléments !!!
        					// alert('Doit-on decaller ?');
        				} else {
        					// On l'insère à sa position et supprime le dernier
							// élément.
        					this.addLine(elem);
        					availableRows--;
        				}
    				} else if (availableRows > 0) {
    					this.addLine(elem);
    					availableRows--;
    				}
    			}
    		} else {
    			// L'element n'a pas ete trouve pour cette liste.
    			var orig_elem = this.getElemWithUid(uid);
    			if (orig_elem) {
    				// On a l'element... Il faut donc le supprimer.
    				this.removeLine(uid);
    				availableRows++;
    			}
    		}
    	}
    	
    	this.options.table.trigger('updateTotal', newTotal);
    	
    	this.element.trigger('refreshed');
    },
    lineClicked: function(event) {
    	
    	var line = $(event.currentTarget);
    	var hasShift = event.shiftKey;
    	var hasCtrl = event.ctrlKey;
    	
    	if( event.button == 2 ) {
    		if (!line.hasClass('selected')) {
    			$('tr.selected', this.options.table).removeClass('selected');
        		line.addClass('selected');
        		this.options.lastClicked = line;
    		}
    		
    		this.element.trigger('select_changed');
    		
    		if (!this.options.buildContextMenuCallback) return false;
    		
    		return;
    	}

    	if (hasShift) {
    		console.log('hasShift test 1');
    		if (this.options.lastClicked) {
    			console.log('hasShift test 2');
    			var indexLast = this.options.lastClicked.index();
    			console.log('hasShift test 3 > '+indexLast);
    			var lineIndex = line.index();
    			console.log('hasShift test 4 > '+lineIndex);
    			
    			var begin = 0;
    			var end = 0;
    			if (indexLast < lineIndex) {
    				begin = indexLast+1;
    				end = lineIndex+1;
    			} else {
    				begin = lineIndex+1;
    				end = indexLast+1;
    			}
    			console.log('hasShift test 5 > '+begin+' >> '+end);
    			
    			for (var i = begin; i <= end; i++) {
    				console.log('hasShift test 3');
    				var l = $('tbody > tr:nth-child('+i+')', this.options.table);
    				l.addClass('selected');
    			}
    		}
    	} else if (hasCtrl) {
    		line.toggleClass('selected');
    		if (line.hasClass('selected')) this.options.lastClicked = line;
    	} else {
    		$('tr.selected', this.options.table).removeClass('selected');
    		line.addClass('selected');
    		this.options.lastClicked = line;	
    	}
    	
    	this.element.trigger('select_changed');
    },
    unselectAllNoEvent: function() {
    	$('tr.selected', this.options.table).removeClass('selected');
    },
    selectElemsNoEvent: function(ids) {
    	this.unselectAllNoEvent();
    	if (ids) {
    		for (var i = 0; i < count(ids); i++) {
    			var id = ids[i];
    			$('tr[uid='+id+']', this.options.table).addClass('selected');
    		}
    	}
    },
    getElemsChecked: function() {
    	var checkboxes = $('input[type=checkbox]:checked', this.options.table);
    	return checkboxes.closest('tr');
    },
    getAllElemsCheckedUids: function() {
    	var elems = this.getElemsChecked();
    	var uids = [];
    	for (var i = 0; i < elems.size(); i++) {
    		var tr = $(elems.get(i));
    		var uid = tr.attr('uid');
    		uids.push(uid);
    	}
    	return uids;
    },
    getNumElems: function() {
    	// Si on est en ajax !
    	if (this.options.isAjax) {
    		var total = intval($('.pager .totalRows', this.element).html());
    		return total;
    	}
    	return $('tbody > tr.list_elem', this.options.table).size();
    },
    getNumElemsChecked: function() {
    	var checked = this.getElemsChecked();
    	return checked.size();
    },
    getElemsSelected: function() {
    	return $('tr.selected', this.options.table);
    },
    getNumElemsSelected: function() {
    	var selected = this.getElemsSelected();
    	return selected.size();
    },
    getElemWithUid: function(uid) {
    	var elem = $('tr[uid="'+addslashes(uid)+'"]', this.options.table);
    	if (elem.size() == 1) return elem;
    	
    	return null;
    },
    getAllElemsUids: function() {
    	var elems = $('tbody > tr', this.options.table);
    	var uids = [];
    	for (var i = 0; i < elems.size(); i++) {
    		var tr = $(elems.get(i));
    		var uid = tr.attr('uid');
    		uids.push(uid);
    	}
    	return uids;
    },
    forceTableWidgetActive: function() {
    	this.disableLoader();
    	this.options.table.trigger("update")
	  		.trigger("appendCache")
	  		.trigger("applyWidgets");
    	
    	setTimeout($.proxy(this.enableLoader, this), 500);
    },
    addLine: function(line) {
    	var total = intval(this.getNumElems());
    	
    	if (!line) return false;
    	line = $(line);
    	
    	var type = line.attr('type');
    	
    	if (type != this.options.type) {
    		console.log('Trying to add elem of wrong type : '+type+' > should be '+this.options.type);
    		return false;
    	}
    	
    	var tbody = $('tbody', this.options.table);
    	
    	var resort = true;
    	tbody.append(line).trigger('addRows', [line, resort]);
    	
    	
    	this.options.table.trigger('updateTotal', total+1);
    	
    	line.bind('click', $.proxy(this.lineClicked, this));
    	
    	this.element.trigger('refreshed');
    },
    updateLine: function(line) {
    	if (!line) return false;
    	line = $(line);
    	
    	var type = line.attr('type');
    	
    	if (type != this.options.type) {
    		console.log('Trying to update elem of wrong type : '+type+' > should be '+this.options.type);
    		return false;
    	}
    	
    	var uid = line.attr('uid');
    	
    	var oldLine = $('tr[uid="'+addslashes(uid)+'"]', this.options.table);
    	if (oldLine.size() == 1) {
    		if (oldLine.hasClass('selected')) line.addClass('selected');
        	oldLine.replaceWith(line);
        	this.forceTableWidgetActive();
    	} else {
    		console.log('Trying to update elem that doesnt exist : '+type+' > '+uid);
    	}
    	
    	line.bind('click', $.proxy(this.lineClicked, this));
    	
    	this.element.trigger('refreshed');
    },
    removeLine: function(uid, forceDecrementTotal) {
    	var elem = $('tr[uid="'+addslashes(uid)+'"]', this.options.table);
    	if (elem.size() == 1) {
    		elem.remove();
    		
    		if (forceDecrementTotal) {
        		var total = intval(this.getNumElems());
        		if (total > 0) total--;
        		this.options.table.trigger('updateTotal', total);
        	}
    	}
    	
    	this.forceTableWidgetActive();
    	
    	this.element.trigger('refreshed');
    },
    setLoading: function() {
    	var loader = $(' > .loading', this.element);
    	if (loader.size() == 0) {
    		loader = $('<div class="loading" style="z-index: 4"></div>');
    		loader.appendTo(this.element);
    	} else {
    		// loader.css('display', 'block');
    	}
    },
    hideLoading: function() {
    	/*
		 * var parent = this.element.parent(); alert('hide loading :
		 * '+parent.attr('class'));
		 */
    	var loader = $(' > .loading', this.element);
    	// loader.css('display', 'none');
    	loader.remove();
    },
    disableLoader: function() {
    	this.element.addClass('disable_loader');
    },
    enableLoader: function() {
    	this.element.removeClass('disable_loader');
    },
    getType: function() {
    	return this.options.type;
    },
    selfDestruct: function() {
    	listsMgr().removeList(this);
    	this.element.remove();
    },
    setModeEdit: function() {
    	this.element.addClass('edit')
    },
    removeModeEdit: function() {
    	this.element.removeClass('edit')
    },
    getCurrentMode: function() {
    	if (this.element.hasClass('edit')) return 'edit';
    	return 'consult';
    },
    isModeEdit: function() {
    	return this.getCurrentMode() == 'edit';
    },
    options: {
    	buildContextMenuCallback: null,
    	type: null,
    	table: null,
    	
    	isAjax: false,
    	hasCheckboxes: false,
    	
    	searchWidget: null,
    	
    	lastHadProcessingClass: false,
    	
    	lastClicked: null,
    	
    	confirmCallback: null,
    	alert: null
    }
});

$.widget('seriel.listsmanager', {
    _create: function () {
    	
    },
    register: function(list) {
    	var type = list.getType();
    	var uid = list.element.attr('id');
    	
    	if (!type) type = 'unknown';
    	this.options.listsById[uid] = list;
    	if (!this.options.listsByType[type]) this.options.listsByType[type] = {};
    	this.options.listsByType[type][uid] = list;
    	
    	this.debug();
    },
    getAllListsForType: function(type) {
    	if (this.options.listsByType[type]) return this.options.listsByType[type];
    	return null;
    },
    getListForUid: function(uid) {
    	if (this.options.listsById[uid]) return this.options.listsById[uid];
    	
    	return null;
    },
    removeList: function(list) {
    	var type = list.getType();
    	var uid = list.element.attr('id');
    	
    	if (!type) type = 'unknown';
    	
    	if (this.options.listsById[uid]) delete this.options.listsById[uid];
    	if (this.options.listsByType[type] && this.options.listsByType[type][uid]) delete this.options.listsByType[type][uid];
    	
    	this.debug();
    },
    debug: function() {
    	return;
    	var debugs = [];
    	for (var type in this.options.listsByType) {
    		debugs.push(type+' : '+count(this.options.listsByType[type]));
    	}
    	
    	console.log('listsMgr Debug : '+implode(' -- ', debugs));
    },
    options: {
    	listsById: {},
    	listsByType: {}
    }
});

var serListsMgr = null;

function initSerListsMgr() {
    if ($('body').data('seriel-listsmanager')) {
    	serListsMgr = $('body').data('seriel-listsmanager');
        return;
    }
    $('body').listsmanager();

    serListsMgr = $('body').data('seriel-listsmanager');
}

function listsMgr() {
    if (!serListsMgr) {
    	initSerListsMgr();
    }

    return serListsMgr;
}

$(document).ready(function() {
	try {
		$.tablesorter.addParser({
			  // use a unique id
			  id: 'seriel-sorter',
			  is: function(s, table, cell, $cell) {
				  return ($cell.attr('seriel-sort-value') ? true : false);
			  },
			  format: function(s, table, cell, cellIndex) {
				  return $(cell).attr('seriel-sort-value');
			  },
			  parsed: false
		});	
	} catch (e) {
		
	}
});