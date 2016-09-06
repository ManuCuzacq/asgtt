
function getNavigatorObjectFromDomElem(elem) {
    var data = $(elem).data();
    for (var key in data) {
        var obj = data[key];
        try {
            var res = obj.isNavigator();
            if (res == true)
                return obj;
        } catch (ex) {

        }
    }

    return null;
}

function cleanBlockBeforeDisappear(block) {
	var lists = $('.ser_list', block);
	for (var i = 0; i < lists.size(); i++) {
		var list = $(lists.get(i));
		list.ser_list('selfDestruct');
	}
	
	// On ferme tous les widgets.
	var widgets = $('.widget.active', block);
	for (var i = 0; i < widgets.size(); i++) {
		var widg = $(widgets.get(i));
		widgObj = widg.data('ser_widget_object');
		if (widgObj) {
			widgObj.close();
		}
	}
}

$.widget('seriel.navigator', {
	_create: function() {
		this.element.addClass('seriel_navigator');
		this.element.attr('navigator', this.getNavClassName());
	},
	goTo: function(to) {
		hc().setHash(to);
	},
	load: function(dest) {
		alert('La méthode load doit être implémentée');
	},
	loadContent: function(url, key, serhash) {
		var destDiv = this.getDestDiv();
		if (destDiv && destDiv.size() == 1) {
			this.initHasDestDivContainer(destDiv);
			// destDiv.load(url, $.proxy(this._cntLoaded(), this));
			if (!key) key = buildKeyFromUrl(url);
			destDiv.navDestContainer('loadUrl', url, key, serhash);
		}
	},
	loadContentBackward: function(url, key, serhash) {
		var destDiv = this.getDestDiv();
		if (destDiv && destDiv.size() == 1) {
			this.initHasDestDivContainer(destDiv);
			// destDiv.load(url, $.proxy(this._cntLoaded(), this));
			if (!key) key = buildKeyFromUrl(url);
			destDiv.navDestContainer('loadUrlBackward', url, key, serhash);
		}
	},
	backInDom: function() {
		// Must be overwritted.
	},
	checkContent: function(url, key, serhash) {
		// Must be overwritted.
		//alert('check content '+url+' / '+key+" . "+serhash);
	},
	beforeClose: function() {
		var destDiv = this.getDestDiv();
		if (destDiv && destDiv.size() == 1) {
			this.initHasDestDivContainer(destDiv);
			
			return destDiv.navDestContainer('beforeCloseAll');
		}
		return null;
	},
	removeContent: function(key, force) {
		if (!key) return false;
		
		var destDiv = this.getDestDiv();
		if (destDiv && destDiv.size() == 1) {
			this.initHasDestDivContainer(destDiv);
			
			if (!force) {
				// On contrôle.
				var before_close = destDiv.navDestContainer('beforeClose', key);
				if (before_close) {
					//alert('GOT SOMETHING !!!');
					var url = before_close['url'];
					var navigator = before_close['navigator'];
					var method = before_close['method'];
					
					//alert('blocked by : '+navigator.getNavClassName());
					
					if (url) {
						hc().setHash(url);
					}
					if (method) {
						setTimeout(method, 20);
					}
					
					return navigator;
				}
			}
			
			return destDiv.navDestContainer('removeSubDiv', key);
		}
		
		return false;
	},
	checkRefreshElems: function(elems) {
		if (!elems) return false;
		
		var destDiv = this.getDestDiv();
		if (destDiv && destDiv.size() == 1) {
			this.initHasDestDivContainer(destDiv);
			return destDiv.navDestContainer('checkAllRefreshElems', elems);
		}
		
		return false;
    },
	removeAllContents: function() {
		var destDiv = this.getDestDiv();
		if (destDiv && destDiv.size() == 1) {
			//alert('removeAllContents test : '+this.getNavClassName());
			this.initHasDestDivContainer(destDiv);
			return destDiv.navDestContainer('removeAllSubDivs');
		}
		
		return false;
	},
	initHasDestDivContainer: function(div) {
		if (!div) return;
		if (!div.data('seriel-navDestContainer')) {
			div.navDestContainer({navigator: this});
		}
	},
	_cntLoaded: function(res) {
		this.contentLoaded(res);
	},
	getDestDiv: function() {
		return null;
	},
	contentLoaded: function(res) {
		// DO nothing. To be extended
	},
	onAction: function(action) {
		console.log('NAV_ACTION['+action+']');
	},
	keyPressed: function(event) {
		var key = event.which;
		var target = $(event.target);
		// console.log('back '+target.get(0)+' ['+target.attr('type')+']');
		if (target.is('input:not([type=button], [type=image], [type=submit]), textarea')) return;
		
		// Avant tout traitement, on propose aux children de traiter.
		var res = true;
		var child = this.getActiveChild();
		if (child) {
			/*
			 * for (var key in child) { console.log("CHILD : "+key); }
			 */
			res = child.keyPressed(event);
		}
		
		if (res == false) return false; // Le traitement a été effecuté, on
										// retourne false.
		
		return this.dealWithKeyPressed(event);
	},
	dealWithKeyPressed: function(event) {
		var key = event.which;
		var ctrlPressed = event.ctrlKey;
		var navClass = this.getNavClassName();
		// console.log("KEYPRESSED not catched "+navClass+" ["+key+"]");
		return true;
	},
	getNavClassName: function() {
		var data = this.element.data();
		for (var key in data) {
			if (key == 'parentNavigator') continue;
			var obj = data[key];
			try {
				var res = obj.isNavigator();
				if (res == true) return key;
			} catch (ex) {
				
			}
		}
		
		return null;
	},
	getActiveChild: function() {
		var destDiv = this.getDestDiv();
		if (destDiv && destDiv.size() == 1) {
			this.initHasDestDivContainer(destDiv);
			var child = destDiv.navDestContainer('getActiveChild');
			var data = child.data();
			if (child) {
				return getNavigatorObjectFromDomElem(child);
			}
		}
		
		return null;
	},
	isNavigator: function() {
		return true;
	},
	getParentNavigator: function () {
		if (this.options.parentNav) return this.options.parentNav;
		
        var parentNav = this.element.parent().closest('.seriel_navigator');
        if (parentNav && parentNav.attr('navigator')) {
            return parentNav.data(parentNav.attr('navigator'));
        }
    },
	openModalInside: function(title, url, dest, options) {
		if (!dest) dest = this.element;
		
		if (!title) title = '';
		
		var width = 900;
		var height = 450;
		var post = null;
		
		if (options) {
			if (options['width']) width = intval(options['width']);
			if (options['height']) height = intval(options['height']);
			if (options['post']) post = options['post'];
		}
		
		var availableWidth = dest.width() - 20;
		if (width > availableWidth) width = availableWidth;
		
		var availableHeight = dest.height() - 10;
		//alert(height+' / '+availableHeight);
		if (height > availableHeight) height = availableHeight;
		
		
		this.options.dialog = $('<div class="seriel_dialog"></div>');
		this.options.dialog.data('parentNavigator', this);
		this.options.dialog.dialog({'modal': true, 'title': title, 'draggable': true, 'resizable': false, 'width': width, 'height': height, 'appendTo': dest, 'position': { my: "center", at: "center", of: dest }, 'beforeClose': $.proxy(this.beforeCloseModal, this)});
		this.options.dialog.html('<div class="loading"></div>');
		this.options.dialog.css('position', 'relative');
		
		
		if ('post') this.options.dialog.load(url, post, $.proxy(this.dialogLoaded, this));
		else this.options.dialog.load(url, $.proxy(this.dialogLoaded, this));
		
		
		this.options.dialog.bind('dialogclose', $.proxy(this.modalClosed, this));
		this.options.dialog.dialog('open');
		
		// HACK !
		this.document.unbind( "focusin" );
	},
	beforeCloseModal: function() {
		cleanBlockBeforeDisappear(this.options.dialog)
	},
	modalClosed: function(event) {
		if (event) event.stopPropagation();
		var target = $(event.currentTarget);
		target.addClass('toRemove');
		
		this.options.modalsToRemove.push(target);
		
		setTimeout($.proxy(this.checkModalsToRemove, this), 400);
		
		this.element.trigger('modalclosed');
		
		return false;
	},
	checkModalsToRemove: function() {
		console.log('checkModalsToRemove : '+count(this.options.modalsToRemove));
		var counter = 0;
		var limit = 10;
		while (count(this.options.modalsToRemove) > 0) {
			console.log('checkModalsToRemove : '+counter);
			var elem = this.options.modalsToRemove.pop();
			try {
				var ui_data = elem.data('ui-dialog');
				if (ui_data) {
					if (elem.dialog('isOpen')) {
						elem.removeClass('toRemove');
						continue;
					}
				}
				elem.dialog('destroy');
				elem.remove();				
			} catch (e) {
				
			}
			
			counter ++;
			if (counter >= limit) break;
		}
	},
	openModal: function(title, url, options) {
		this.openModalInside(title, url, this.element, options);
	},
	openModalInsideParentNavigator: function(title, url, options) {
		var dest = this.element;
		var parent = this.getParentNavigator();
		if (parent) dest = parent.element;
		
		this.openModalInside(title, url, dest, options);
	},
	openModalInsideGrandParentNavigator: function(title, url, options) {
		var dest = this.element;
		var parent = this.getParentNavigator();
		if (parent) {
			dest = parent.element;
			grandPa = parent.getParentNavigator();
			if (grandPa) {
				dest = grandPa.element;
			}
		}
		
		this.openModalInside(title, url, dest, options);
	},
	dialogLoaded: function(response, status, xhr) {
		// Let's deal with navigator :
        var navSpan = $(' > .nav_widget', this.options.dialog);
        if (navSpan && navSpan.size() == 1) {
            var navClass = navSpan.html();
            navSpan.remove();
            eval('this.options.dialog.' + navClass + '();');
        }
	},
	openModalWithContentInside: function(title, content, dest, options) {
		if (!dest) dest = this.element;
		
		var width = 900;
		var height = 450;
		
		if (options) {
			if (options['width']) width = intval(options['width']);
			if (options['height']) height = intval(options['height']);
		}
		
		if (!title) title = '';
		this.options.dialog = $('<div class="seriel_dialog"></div>');
		this.options.dialog.data('parentNavigator', this);
		this.options.dialog.dialog({'modal': true, 'title': title, 'draggable': false, 'resizable': false, 'width': width, 'height': height, 'appendTo': dest, 'position': { my: "center", at: "center", of: dest }});
		this.options.dialog.html(content);
		this.options.dialog.dialog('open');
		this.options.dialog.css('position', 'relative');
		
		// HACK !
		this.document.unbind( "focusin" );
		
		var navSpan = $(' > .nav_widget', this.options.dialog);
        if (navSpan && navSpan.size() == 1) {
            var navClass = navSpan.html();
            navSpan.remove();
            eval('this.options.dialog.' + navClass + '();');
        }
	},
	openModalWithContent: function(title, content, options) {
		this.openModalWithContentInside(title, content, this.element, options);
	},
	openModalWithContentInsideParentNavigator: function(title, content, options) {
		var dest = this.element;
		var parent = this.getParentNavigator();
		if (parent) dest = parent.element;
		
		this.openModalWithContentInside(title, content, dest, options);
	},
	refreshElementWithContent: function(key, content) {
		var destDiv = this.getDestDiv();
		if (destDiv && destDiv.size() == 1) {
			this.initHasDestDivContainer(destDiv);
			destDiv.navDestContainer('refreshWithContent', key, content);
		}
	},
	getElementWithKey: function(key) {
		var destDiv = this.getDestDiv();
		if (destDiv && destDiv.size() == 1) {
			this.initHasDestDivContainer(destDiv);
			return destDiv.navDestContainer('getElementWithKey', key);
		}
		return null;
	},
	getAllSubElemsKeys: function() {
		var destDiv = this.getDestDiv();
		if (destDiv && destDiv.size() == 1) {
			this.initHasDestDivContainer(destDiv);
			return destDiv.navDestContainer('getAllSubElemsKeys');
		}
	},
	setHasModif: function(hasModif) {
		if (hasModif) {
			this.options.hasModif = true;
			this.element.addClass('has_modif');
		} else {
			this.options.hasModif = false;
			this.element.removeClass('has_modif');
		}
	},
	hasModif: function() {
		return this.options.hasModif;
	},
	showLoading: function() {
		var loaderDiv = $(' > .nav-loader', this.element);
		if (loaderDiv.size() == 0) {
			loaderDiv = $('<div class="nav-loader"></div>');
			loaderDiv.appendTo(this.element);
		}
		loaderDiv.addClass('visible');
	},
	hideLoading: function() {
		$(' > .nav-loader', this.element).removeClass('visible');
	},
	forceClearCache: function() {
		this.element.addClass('clear_cache');
	},
	forceClearAllCaches: function() {
		var destDiv = this.getDestDiv();
		if (destDiv && destDiv.size() == 1) {
			this.initHasDestDivContainer(destDiv);
			return destDiv.navDestContainer('forceClearAllCaches');
		}
	},
	showAlertInsideParent: function(title, content) {
		var dest = this.element;
		var parent = this.getParentNavigator();
		if (parent) dest = parent.element;
		
		this.showAlert(title, content, dest);
	},
	showAlert: function (title, content, dest) {
		this.closeAlert();
		if (!dest) dest = this.element;
        this.options.alert = $('<div class="alert"><div class="alert_content">' + content + '</div><div class="alert_button"><span class="neutral_button"><span>OK</span></span></div></div>');
        this.options.alert.dialog({'modal': true, 'title': title, 'draggable': false, 'resizable': false, 'width': 350, 'appendTo': dest, 'position': {my: "center", at: "center", of: dest}});
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
    showConfirmInsideParent: function(title, content, callback, ko_text, ok_text) {
		var dest = this.element;
		var parent = this.getParentNavigator();
		if (parent) dest = parent.element;
		
		this.showConfirm(title, content, callback, ko_text, ok_text, dest);
	},
    showConfirm: function(title, content, callback, ko_text, ok_text, dest) {
    	if (!dest) dest = this.element;
    	
    	if (!ko_text) ko_text = 'Non';
    	if (!ok_text) ok_text = 'Oui';
    	
    	this.options.alert = $('<div class="alert"><div class="alert_content">' + content + '</div><div class="alert_button"><span class="cancel_button"><span>'+ko_text+'</span></span><span class="valid_button"><span>'+ok_text+'</span></span></div></div>');
        this.options.alert.dialog({'modal': true, 'title': title, 'draggable': false, 'resizable': false, 'width': 450, 'appendTo': dest, 'position': {my: "center", at: "center", of: dest}});
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
	options: {
		alert: null,
		parentNav: null,
		hasModif: false,
		modalsToRemove: []
	}
});

$.widget('seriel.navDestContainer', {
	_create: function() {
		this.element.addClass('seriel_navigator_container');
	},
	getNavigator: function() {
		return this.options.navigator;
	},
	loadUrl: function(url, key, serhash) {
		//console.log("NavDestContainer::loadUrl : "+url);
		if (!key) key = buildKeyFromUrl(url);
		var subDiv = this.getSubDivByKey(key);
		
		//console.log('navDestContainer::loadUrl key : '+key);
		
		if (subDiv) {
			var parent = subDiv.parent();
			var alreadyVisible = false;
			if (parent && parent.size() == 1) {
				if (parent.get(0) == this.element.get(0)) alreadyVisible = true;
			}
			if (!alreadyVisible) subDiv.appendTo(this.element);
			if (subDiv.navDestSubContainer('useCache')) {
				this.detachAllExcept(subDiv);
				var data = subDiv.data('layout');
				if (data) data.resizeAll();
				
				var layoutContainers = $('.ui-layout-container', subDiv);
				
				if (layoutContainers.size() > 0) {
					//alert('layout-containers-size : '+layoutContainers.size());
					layoutContainers.layout('resizeAll');					
				}
				
				var layoutSerielContainers = $('.ui-layout-container-seriel', subDiv);
				if (layoutSerielContainers.size() > 0) {
					//alert('layout-containers-size : '+layoutContainers.size());
					layoutSerielContainers.serielLayout('refresh');					
				}
				
				// On récupère tous les navigateur et leur signifions le retour dans le DOM
				var navigators = $('.seriel_navigator', subDiv);
				//if (subDiv.hasClass('seriel_navigator')) navigators = navigators.add(subDiv);
					
				for (var i = 0; i < navigators.size(); i++) {
					var nav = $(navigators.get(i));
					
					var navClass = nav.attr('navigator');
					if (navClass) {
						var navObj = subDiv.data(navClass);
						if (!navObj) continue;
						if (!alreadyVisible) navObj.backInDom.call(navObj);
						navObj.checkContent.call(navObj, url, key, serhash);
					}
				}					
				if (subDiv.hasClass('seriel_navigator')) {
					var navClass = subDiv.attr('navigator');
					if (navClass) {
						var navObj = subDiv.data(navClass);
						navObj.backInDom.call(navObj);
					}
				}
				
				transformAncres($('.ancre', this.subDiv));
				
				// On s'occupe des widgets date.
				var dates_widget_not_initialized = $('.date_widget:not(.ser_date_widget)', this.subDiv);
				if (dates_widget_not_initialized && dates_widget_not_initialized.size() > 0) {
					dates_widget_not_initialized.ser_dateWidget();
				}
				
				
				// Let's deal with scrollable.
				if (!alreadyVisible) {
					var scrollables = $('.scrollable', subDiv);
					if (subDiv.hasClass('scrollable')) scrollables = scrollables.add(subDiv);
					
					for (var i = 0; i < scrollables.size(); i++) {
						var scrollable = $(scrollables.get(i));
						var top = scrollable.attr('scrollTop');
						var left = scrollable.attr('scrollLeft');
						
						scrollable.scrollTop(top);
						scrollable.scrollLeft(left);
						
						console.log('SCROLLABLE FOUND : top['+top+'] left['+left+']');
					}
				}
				
				// Let's deal with lists.
				$('.ser_list', subDiv).ser_list('forceTableWidgetActive');
				
				checkScreen();
				
				var navClass = subDiv.attr('navigator');
				if (navClass) {
					var navObj = subDiv.data(navClass);
					navObj.checkContent.call(navObj, url, key, serhash);
					//alert(navObj.checkContent);
					//$.proxy(function() { this.checkContent(url, key, serhash) }, navObj);
				}
				
				return;
			} else {
				subDiv.remove();
				subDiv = null;
			}
		}
		
		subDiv = $('<div class="seriel_nav_cont_subdiv" key="'+key+'"></div>');
		this.storeSubDiv(subDiv, key);
		
		subDiv.appendTo(this.element);
		subDiv.navDestSubContainer();
		subDiv.navDestSubContainer('loadUrl', url);
		
		this.detachAllExcept(subDiv);
	},
	loadUrlBackward: function(url, key, serhash) {
		console.log("NavDestContainer::loadUrl : "+url);
		if (!key) key = buildKeyFromUrl(url);
		var subDiv = this.getSubDivByKey(key);
		
		console.log('navDestContainer::loadUrl key : '+key);
		
		if (subDiv) {
			if (subDiv.navDestSubContainer('useCache')) {
				return;
			} else {
				subDiv.remove();
				subDiv = null;
			}
		}
		
		subDiv = $('<div class="seriel_nav_cont_subdiv" key="'+key+'"></div>');
		this.storeSubDiv(subDiv, key);
		
		subDiv.navDestSubContainer();
		subDiv.navDestSubContainer('loadUrl', url);
	},
	loaded: function(subcontainer, url, res) {
		// Let's check all the page just in case.
		checkScreen();
		//console.log("LOADED : url:"+url);
		
		this.options.navigator.contentLoaded(res);
	},
	refreshWithContent: function(key, content) {
		var subDiv = this.getSubDivByKey(key);
		
		var attach = false;
		if (subDiv) {
			// Il est présent, on en crée un nouveau et on le remplace.
			if (inDom(subDiv)) attach = true;
			subDiv.remove();
		}
		subDiv = $('<div class="seriel_nav_cont_subdiv" key="'+key+'"></div>');
		this.storeSubDiv(subDiv, key);
		
		subDiv.appendTo(this.element);
		subDiv.navDestSubContainer();
		subDiv.navDestSubContainer('refreshWithContent', content);
		
		if (!attach) {
			var scrollables = $('.scrollable', subDiv);
			if (subDiv.hasClass('scrollable')) scrollables = scrollables.add(subDiv);
			
			for (var i = 0; i < scrollables.size(); i++) {
				var scrollable = $(scrollables.get(i));
				var top = scrollable.scrollTop();
				var left = scrollable.scrollLeft();
				
				scrollable.attr('scrollTop', top);
				scrollable.attr('scrollLeft', left);
				
				//console.log('SCROLLABLE : top['+top+'] left['+left+']');
			}
			
			subDiv.detach();
		}
	},
	getElementWithKey: function(key) {
		var subDiv = this.getSubDivByKey(key);
		if (subDiv) {
			return subDiv;
		}
	},
	detachAllExcept: function(exception) {
		var subs = $(' > div', this.element);
		for (var i = 0; i < subs.size(); i++) {
			var elem = $(subs.get(i));
			if (elem.get(0) == exception.get(0)) continue;
			
			var scrollables = $('.scrollable', elem);
			if (elem.hasClass('scrollable')) scrollables = scrollables.add(elem);
			
			for (var i = 0; i < scrollables.size(); i++) {
				var scrollable = $(scrollables.get(i));
				var top = scrollable.scrollTop();
				var left = scrollable.scrollLeft();
				
				scrollable.attr('scrollTop', top);
				scrollable.attr('scrollLeft', left);
				
				//console.log('SCROLLABLE : top['+top+'] left['+left+']');
			}
			
			elem.detach();
		}
	} ,
	getSubDivByKey: function(key) {
		if (this.options.contByKey[key]) return this.options.contByKey[key];
		return null;
	},
	storeSubDiv: function(div, key) {
		this.options.contByKey[key] = div;
	},
	removeSubDiv: function (key) {
		var subDiv = this.getSubDivByKey(key);
		
		if (subDiv) {
			var navClass = subDiv.attr('navigator');
			if (navClass) {
				var navigator = subDiv.data(navClass);
				navigator.removeAllContents();
			}
			
			cleanBlockBeforeDisappear(subDiv);
			
			/*var lists = $('.ser_list', subDiv);
			for (var i = 0; i < lists.size(); i++) {
				var list = $(lists.get(i));
				list.ser_list('selfDestruct');
			}
			
			// On ferme tous les widgets.
			var widgets = $('.widget.active', subDiv);
			for (var i = 0; i < widgets.size(); i++) {
				var widg = $(widgets.get(i));
				widgObj = widg.data('ser_widget_object');
				if (widgObj) {
					widgObj.close();
				}
			}*/
			
			var parent = subDiv.parent();
			var isVisible = false;
			if (parent && parent.size() == 1) {
				if (parent.get(0) == this.element.get(0)) isVisible = true;
			}
			
			// On supprimer l'élément.
			subDiv.remove();
			delete this.options.contByKey[key];
			
			//
			if (isVisible) {
				return true;
			}
		}
		
		return false;
	},
	checkRefreshElems: function(key, elems) {
		var subDiv = this.getSubDivByKey(key);
		
		if (subDiv) {
			var navClass = subDiv.attr('navigator');
			if (navClass) {
				var navigator = subDiv.data(navClass);
				navigator.checkRefreshElems(elems);
			}
		}
	},
	checkAllRefreshElems: function(elems) {
		for (var key in this.options.contByKey) {
			this.checkRefreshElems(key, elems);
		}
	},
	removeAllSubDivs: function() {
		for (var key in this.options.contByKey) {
			this.removeSubDiv(key);
		}
	},
	beforeClose: function(key) {
		var subDiv = this.getSubDivByKey(key);
		
		if (subDiv) {
			var navClass = subDiv.attr('navigator');
			if (navClass) {
				var navigator = subDiv.data(navClass);
				var before_close = navigator.beforeClose();
				if (before_close !== null) {
					if (!before_close['navigator']) before_close['navigator'] = navigator;
					
					return before_close;
				}
			}
		}
		
		return null;
	},
	beforeCloseAll: function() {
		for (var key in this.options.contByKey) {
			var before_close = this.beforeClose(key);
			if (before_close) {
				return before_close;
			}
		}
		
		return null;
	},
	forceClearAllCaches: function() {
		if (this.options.contByKey) {
			for (var key in this.options.contByKey) {
				var subdiv = this.options.contByKey[key];
				if (subdiv) subdiv.addClass('clear_cache');
			}
		}
	},
	getActiveChild: function() {
		// Un seul élément est présent.
		var child = $(' > div', this.element);
		if (child.size() == 1) {
			return $(child.get(0));
		}
	},
	getAllSubElemsKeys: function() {
		var res = [];
		if (this.options.contByKey) {
			for (var key in this.options.contByKey) {
				res.push(key);
			}
		}
		return res;
	},
	options: {
		navigator: null,
		contByKey: {}
	}
});

$.widget('seriel.navDestSubContainer', {
    _create: function () {

    },
    loadUrl: function (url) {
        this.options.url = url;
        this.element.addClass('loading');
        this.element.html('');
        this.element.load(url, $.proxy(this.loaded, this));
    },
    loaded: function (response, status, xhr) {
        // Do we have an error ?
        var inError = false;
        if (status == "error") {
            var code = xhr.status;
            var res = getBodyContent(response);
            this.element.html('<div class="error_container"><div>' + res + '</div></div>');

            inError = true;
        }

        this.initContent();

        this.element.parent().navDestContainer('loaded', this, this.options.url, response);
        this.element.removeClass('loading');
    },
    initContent: function() {
    	var inError = false;
    	
		// Let's deal with dock block
		var dockDiv = $(' > .dock_block_content', this.element);
		if (dockDiv && dockDiv.size() == 1) {
			dockNav().updateBlock(dockDiv);
		}
    	
    	// Let's deal with navigator :
        var navSpan = $(' > .nav_widget', this.element);
        if (navSpan && navSpan.size() == 1) {
            var navClass = navSpan.html();
            navSpan.remove();
            
            var parentNav = this.element.parent().navDestContainer('getNavigator');
            
            eval('this.element.' + navClass + '( { \'parentNav\': parentNav } );');
        } else if (inError) {
            this.element.errorNav();
        }    	
    },
    refreshWithContent: function(content) {
    	this.element.html(content);
    	this.initContent();
    },
    useCache: function () {
    	// Il est possible que l'on force la suppression du cache.
    	if (this.element.hasClass('clear_cache')) {
    		return false;
    	}
        return this.options.cache;
    },
    options: {
        url: null,
        cache: true,
        cache_duration: 0
    }
});

$.widget('seriel.errorNav', $.seriel.navigator, {
    _create: function () {
        this._super();
        $('#content', this.element).css({'box-shadow': 'none', 'height': 'auto'});
    }
});


$.widget('seriel.modal_navigator', $.seriel.navigator, {
    _create: function () {
        this._super();

        
        if (this.options.defaultLayout) {
        	var helper = $(' > .modal-helper', this.element);
        	
        	var panelLeft = null;
        	if (helper.size() == 1) panelLeft = helper;
        	else panelLeft = $(' > .modal-left', this.element);
        	
        	if (panelLeft.size() == 0) panelLeft = $(' > .modal-west', this.element);
        	
	        var panelLeftWidth = panelLeft.attr('layout-size');
	        var panelSouthHeight = $(' > .modal-center > .modal-buttons', this.element).attr('layout-size');
	        
	        this.element.serielLayout({
	            defaults: {
	                spacing_open: 0,
	                spacing_closed: 0
	            },
	            west: {
	                size: panelLeftWidth ? panelLeftWidth : 'auto'
	            }
	        });

	        if (helper.size() == 1) {
		        helper.serielLayout({
		            defaults: {
		                spacing_open: 0,
		                spacing_closed: 0
		            },
		            south: {
		                size: panelSouthHeight ? panelSouthHeight : 'auto'
		            }
		        });	        	
	        }
	
	        $(' > .modal-center', this.element).serielLayout({
	            defaults: {
	                spacing_open: 0,
	                spacing_closed: 0
	            },
	            south: {
	                size: panelSouthHeight ? panelSouthHeight : 'auto'
	            }
	        });
        }

        $('.cancel_button', this.element).bind('click', $.proxy(this.koClicked, this));
        $('.valid_button', this.element).bind('click', $.proxy(this.realOkClicked, this));
    },
    disableOkButton: function() {
    	$('.valid_button', this.element).addClass('disabled');
    },
    enableOkButton: function() {
    	$('.valid_button', this.element).removeClass('disabled');
    },
    realOkClicked: function(event) {
    	//if ($('.valid_button', this.element).hasClass('disabled')) return false;
    	if ($(event.currentTarget).hasClass('disabled')) return false;
    	
    	return this.okClicked(event);
    },
    okClicked: function () {
        // A etendre
    },
    koClicked: function () {
        // A etendre
    },
    getParentNavigator: function () {
    	if (this.element.data('parentNavigator')) return this.element.data('parentNavigator');
    	if (this.options.parentNav) return this.options.parentNav;
    	
    	// On essaie de trouver un élément de même niveau que le parent.
    	var grand_father = this.element.parent().parent();
    	var elem = $(' > .seriel_navigator', grand_father);
    	
    	if (elem.size() == 1 && elem.attr('navigator')) {
    		// Ok, on a trouvé.
    		return elem.data(elem.attr('navigator'));
    	}
    	
    	return this._super();
    	
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
    setLoading: function() {
    	var loader = $('.loading', this.element);
    	if (loader.size() == 0) {
    		loader = $('<span class="loading"></span>');
    		loader.appendTo(this.element);
    	}
    	loader.css('display', 'block');
    },
    hideLoading: function() {
    	$(' > .loading', this.element).css('display', 'none');
    },
    showUnknownError: function(code) {
    	var suppStr = '';
    	if (code) {
    		suppStr = ' <br/><br/>Code erreur : '+code;
    	}
    	
    	var title = "Erreur";
        var content = "Une erreur inconnue est survenu.<br/>Veuillez pr&eacute;venir l'administrateur du syst&egrave;me."+suppStr;
        this.showAlert(title, content);
    },
    close: function() {
    	this.element.dialog('close');
    },
    openModal: function(title, url, options) {
    	var parent = this.element.parent();
    	var height = parent.height();
    	parent.css('height', height+'px');
    	
		this.openModalInside(title, url, parent, options);
	},
	openModalWithContent: function(title, content, options) {
		var parent = this.element.parent();
    	var height = parent.height();
    	parent.css('height', height+'px');
    	
		this.openModalWithContentInside(title, content, parent, options);
	},
	modalClosed: function(event) {
		this.element.parent().css('height', 'auto');
		return this._super();
	},
    options: {
    	defaultLayout: true,
    	confirmCallback: null
    }
});


$.widget('seriel.tools', {
    _create: function () {

    },
    openModal: function (title, url) {
        if (!title)
            title = '';
        //alert('test');
        this.options.dialog = $('<div></div>');
        //dialog.appendTo('body');
        this.options.dialog.dialog({'modal': true, 'title': title, 'draggable': false, 'resizable': false, 'width': 900, 'height': 450, 'appendTo': this.element, 'position': {my: "center", at: "center", of: this.element}});
        this.options.dialog.html('<div class="loading"></div>');
        this.options.dialog.load(url, $.proxy(this.dialogLoaded, this));
        this.options.dialog.dialog('open');
        
        // HACK !
		this.document.unbind( "focusin" );
    },
    dialogLoaded: function (response, status, xhr) {
        var inError = false;
        if (status == "error") {
            var code = xhr.status;
            var res = getBodyContent(response);
            this.options.dialog.html('<div class="error_container"><div>' + res + '</div></div>');

            inError = true;
        }

        // Let's deal with navigator :
        var navSpan = $(' > .nav_widget', this.options.dialog);
        if (navSpan && navSpan.size() == 1) {
            var navClass = navSpan.html();
            navSpan.remove();
            eval('this.options.dialog.' + navClass + '();');
        } else if (inError) {
            this.element.errorNav();
        }
    }

});

function pnv(elem) {
    if (!elem)
        return nav();
    
    // Est-on dans une fenetre modale ???
    var dialogContainer = $(elem).closest('.ui-dialog');
    if (dialogContainer.size() == 1) {
        //alert('on est dans une modale');
        // Du coup on récupère juste le navigateur.
        var navi = $(elem).closest('.seriel_navigator');
        
        var navClass = navi.attr('navigator');
		if (navClass) {
			return navi.data(navClass);
		}
    }
    
    var containerElem = $(elem).closest('.seriel_navigator_container');
    if (!containerElem)
        return nav();
    
    var data = containerElem.data();
    if (containerElem.data('seriel-navDestContainer')) {
    	var activeChild = containerElem.data('seriel-navDestContainer').getActiveChild();
    	if (activeChild.size() == 1 && activeChild.hasClass('seriel_navigator')) {
    		// Let's deal with this.
    		var navClass = activeChild.attr('navigator');
			if (navClass) {
				return activeChild.data(navClass);
			} 
    	}
        return containerElem.data('seriel-navDestContainer').options.navigator;
    }
    
    return nav();
}



function openTicket(num_ticket) {
    hc().setHash('ticket[' + num_ticket + ']');
}
function openClient(id_client) {
    hc().setHash('compte[' + id_client + ']');
}
function openPresta(id_presta) {
    hc().setHash('prestataire[' + id_presta + ']');
}
function openDI(num_ticket, di_id) {
	hc().setHash('ticket[' + num_ticket + ']/di['+di_id+']');
}



function gotoLogin() {
	console.log('GOTOLOGIN 1');
	force_not_blocking_unload = true;
	console.log('GOTOLOGIN 2');
	
    var hash = getCleanHash();
    console.log('GOTOLOGIN 3 '+hash);
    
    var url = hash ? getUrlPrefix()+'/login#' + hash : getUrlPrefix()+'/login';
    
    console.log('GOTOLOGIN 4 '+url);
    
    document.location.href = url;
}

