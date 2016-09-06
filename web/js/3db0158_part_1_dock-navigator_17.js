
var serDockNav = null;

$.widget('seriel.dockNavigator', $.seriel.navigator, {
	_create: function() {
		this._super();
		
		this.options.mainBlock = $('#main_block');
		this.options.destDiv = $('#dock_block');
		
		this.options.dockDiv = $('#dock_div');
		this.options.dockUl = $('#dock_ul');
		this.options.buttonLeft = $('#dock_left_button');
		this.options.buttonRight = $('#dock_right_button');
		
		this.options.buttonLeft.bind('click', $.proxy(this.buttonLeftClicked, this));
		this.options.buttonRight.bind('click', $.proxy(this.buttonRightClicked, this));
	},
	addElemDockable: function(elem) {
		this.options.elemsDockable[elem] = elem;
		
		nav().declareSubNavigator(elem, this);
	},
	load: function(dest) {
		try {
			var lastLoc = hc().getLastLocation();
			var lastLocHash = parseHash(lastLoc);
			if (count(lastLocHash) > 0) {
				var lastLocKey = lastLocHash[0].getLabel();
				
				if ( lastLocKey && (!this.options.elemsDockable[lastLocKey])) {
					this.options.outsideLastLocation = lastLoc;
				}
			}
		} catch (ex) {
			
		}
		
		var hash = getCleanHash();
		
		this.options.mainBlock.css('z-index', 1);
		this.options.destDiv.css('z-index', 2);
		
		MMnav().element.removeClass('active');
		this.element.addClass('active');
		
		if ($.type(dest) === 'string') dest = parseHash(dest);
		
		var key = null;
		var params = null;
		if (dest && count(dest) > 0) { // Should always be true anyway
			key = dest[0].getLabel();
			params = dest[0].getParams();
		}
		
		for (var elem in this.options.elemsDockable) {
			if (key == elem) {
				if (params && count(params) == 1) {
					var elemId = params[0];
					
					var url = getUrlPrefix()+'/'+elem+'/'+elemId;
					var key = buildKeyFromUrl(url);
					
					var oldLi = $('ul#dock_ul > li#'+elem+'_'+elemId+':not(.destroyed)');
					if (oldLi.size() > 0) {
						$('ul#dock_ul > li.selected:not(#'+elem+'_'+elemId+')').removeClass('selected');
						oldLi.addClass('selected');
						oldLi.attr('last_hash', hash);
					} else {
						$('ul#dock_ul > li.selected').removeClass('selected');
						//var li = $('<li id="'+elem+'_'+elemId+'" class="'+elem+' selected" key="'+key+'" title="'+elem+' '+elemId+'" hash="'+elem+'['+elemId+']"><span><span class="title">'+'<span class="chargement">chargement</span>'+'</span><span class="close" title="fermer"></span></span></li>');
						var li = $('<li id="'+elem+'_'+elemId+'" class="'+elem+' selected" key="'+key+'" hash="'+elem+'['+elemId+']"><span><span class="title">'+'<span class="chargement">chargement</span>'+'</span><span class="close" title="fermer"></span></span></li>');
						li.attr('last_hash', hash);
						li.bind('click', $.proxy(this.elemClicked, this));
						$('.close', li).bind('click', $.proxy(this.closeClicked, this));
						$('ul#dock_ul').append(li);
					}

					this.loadContent(url);
					this.checkDestroyed();
					this.checkCurrentIsVisible();
					return true;
				} else {
					return false;
				}
			}
		}
		
		//this.loadContent('./'+key);
		return false;
	},
	openBackward: function(dest) {
		if ($.type(dest) === 'string') dest = parseHash(dest);
		
		var key = null;
		var params = null;
		if (dest && count(dest) > 0) { // Should always be true anyway
			key = dest[0].getLabel();
			params = dest[0].getParams();
		}
		
		for (var elem in this.options.elemsDockable) {
			if (key == elem) {
				if (params && count(params) == 1) {
					var elemId = params[0];
					
					var url = getUrlPrefix()+'/'+elem+'/'+elemId;
					var key = buildKeyFromUrl(url);
					
					var oldLi = $('ul#dock_ul > li#'+elem+'_'+elemId+':not(.destroyed)');
					if (oldLi.size() > 0) {
						//$('ul#dock_ul > li.selected:not(#'+elem+'_'+elemId+')').removeClass('selected');
						//oldLi.addClass('selected');
					} else {
						$('ul#dock_ul > li.selected').removeClass('selected');
						//var li = $('<li id="'+elem+'_'+elemId+'" class="'+elem+'" key="'+key+'" title="'+elem+' '+elemId+'" hash="'+elem+'['+elemId+']"><span><span class="title">'+'<span class="chargement">chargement</span>'+'</span><span class="close" title="fermer"></span></span></li>');
						var li = $('<li id="'+elem+'_'+elemId+'" class="'+elem+'" key="'+key+'" hash="'+elem+'['+elemId+']"><span><span class="title">'+'<span class="chargement">chargement</span>'+'</span><span class="close" title="fermer"></span></span></li>');
						li.bind('click', $.proxy(this.elemClicked, this));
						$('.close', li).bind('click', $.proxy(this.closeClicked, this));
						$('ul#dock_ul').append(li);
					}

					this.loadContentBackward(url);
					this.checkDestroyed();
					return true;
				} else {
					return false;
				}
			}
		}
		
		//this.loadContent('./'+key);
		return false;
	},
	elemClicked: function(event) {
		var t = $(event.target);
		if (t.hasClass('close')) return;
		
		var target = $(event.currentTarget);
		if (target.hasClass('destroyed')) return;
		var lastHash = target.attr('last_hash');
		var hash = target.attr('hash');
		
		if (lastHash) hc().setHash(lastHash);
		else hc().setHash(hash);
	},
	closeClicked: function(event) {
		var elem = $(event.currentTarget);
		var li = elem.closest('li');
		
		var index = li.index();
		
		var key = li.attr('key');
		
		var removeRes = this.removeContent(key);
		var resultType = typeof removeRes;
		if (resultType == 'object') {
			// On a été bloqué.
			return;
		}
		
		var wasActive = removeRes;
		li.addClass('destroyed');
		
		if (wasActive) {
			// Reste-t-il des éléments ?
			var lis = $('ul#dock_ul > li:not(.destroyed)');
			if (lis.size() > 0) {
				//if (index > 0) index--;
				if (index >= lis.size()) index = lis.size() - 1;
				var newLi = $(lis.get(index));
				var hash = newLi.attr('hash');
					
				hc().setHash(hash);
			} else {
				if (this.options.outsideLastLocation) hc().setHash(this.options.outsideLastLocation);
				else hc().setHash(this.options.defaultHash);
			}
		}
		
		event.stopPropagation();
		
		this.checkWidth();
		setTimeout($.proxy(this.checkDestroyed, this), 250);
		//setTimeout($.proxy(this.checkCurrentIsVisible, this), 210);
		
		return false;
	},
	checkDestroyed: function() {
		var destroyed = $('ul#dock_ul > li.destroyed');
		
		for (var i = 0; i < destroyed.size(); i++) {
			var dest = $(destroyed.get(i));
			var width = dest.width();
			
			if (width == 0) dest.remove();
		}
		
		this.checkWidth();
	},
	updateBlock: function(block) {
		if (!block) return;
		var uid = trim($('.uid', block).html());
		if (!uid) return;
		
		// Est-ce qu'on a cet élément ?
		var li = $('ul#dock_ul > li#'+uid+':not(.destroyed)');
		if (li && li.size() == 1) {
			// OK let's do it.
			var textContainer = $('.text', block);
			if (textContainer.size() == 1) {
				var txt = textContainer.html();
				$(' > span > span.title', li).html(txt);
				//li.attr('title', txt);
			}
			
			var titleContainer = $('.title', block);
			if (titleContainer.size() == 1) {
				var title = titleContainer.html();
				//li.attr('title', title);
			}
		}
		
		this.checkDestroyed();
		this.checkCurrentIsVisible();
	},
	buttonLeftClicked: function() {
		this.moveToTheLeft(this.options.moveLength);
	},
	buttonRightClicked: function() {
		this.moveToTheRight(this.options.moveLength);
	},
	moveToTheLeft: function(distance) {
		return this.moveTo(0-distance);
	},
	moveToTheRight: function(distance) {
		return this.moveTo(distance);
	},
	moveTo: function(distance) {
		this.updateScrollVariables();
		
		// Let's get our new position.
		var ulLeft = 0 - intval(this.options.dockUl.css('left'));
		var newLeft = ulLeft + distance;
		//console.log(ulLeft+' >> '+newLeft+' >> '+this.options.maxLeft);
		
		if (newLeft > this.options.maxLeft) newLeft = this.options.maxLeft;
		if (newLeft < 0) newLeft = 0;
		
		if (newLeft == ulLeft) return;
		
		newLeft = 0 - newLeft;
		
		this.options.dockUl.css('left', newLeft+'px');
	},
	checkWidth: function() {
		this.updateScrollVariables();
		
		var ulLeft = 0 - intval(this.options.dockUl.css('left'));
		if (ulLeft > this.options.maxLeft) {
			this.options.dockUl.css('left', (0-this.options.maxLeft)+'px');
		}
	},
	checkCurrentIsVisible: function() {
		var selected = $(' > li.selected', this.options.dockUl);
		if (selected.size() == 1) {
			// Let's get the offset.
			var offsetSelected = selected.offset();
			var leftSelected = offsetSelected.left;
			var rightSelected = leftSelected + selected.width();
			
			// Let's get the visibility zone offset
			var offsetDock = this.options.dockDiv.offset();
			var leftDock = offsetDock.left;
			var rightDock = leftDock + this.options.dockDiv.width();
			
			//console.log('selected : left['+leftSelected+'] right['+rightSelected+'] // dock : left['+leftDock+'] right['+rightDock+']');
			
			// is it visible on the left ?
			if (leftSelected - 60 < leftDock) {
				var distance = leftDock - leftSelected + 60;
				this.moveToTheLeft(distance);
			} else if (rightSelected + 60 > rightDock) { // is it visible on the right ?
				var distance = rightSelected - rightDock + 60; 
				this.moveToTheRight(distance);
			}
		}
	},
	updateScrollVariables: function() {
		// on récupère la longueur dispo.
		var parent = this.options.dockUl.parent();
		var grandParent = parent.parent();
		
		var dispo = grandParent.width();
		
		var margins = intval(this.options.dockUl.css('margin-left')) + intval(this.options.dockUl.css('margin-right'));
		var dockUlWidth = this.options.dockUl.width();
		
		dockUlWidth += margins;
		
		// On récupère les éléments destroyed
		var destroyed = $('ul#dock_ul > li.destroyed');
		for (var i = 0; i < destroyed.size(); i++) {
			var dest = $(destroyed.get(i));
			var width = dest.width();
			dockUlWidth -= width;
		}
		
		var max = dockUlWidth - dispo;
		if (max < 0) max = 0;
		
		this.options.maxLeft = max;
		this.options.moveLength = dispo - 230;
	},
	contentLoaded: function(res) {
		//alert('loaded : '+res);
	},
	getDestDiv: function() {
		return this.options.destDiv;
	},
	onAction: function(action) {
		// Let's deal with this.
		console.log("DOCKNAV_ACTION["+action+"]");
    },
    options: {
    	defaultHash: 'accueil',
    	outsideLastLocation: null,
    	
    	maxLeft: -1,
    	moveLength: 500,
        destDiv: null,
        elemsDockable: {}
    }
});

function initDockNavigator() {
    var dock = $('#south_menu');
    if (dock.size() == 1) {
        if (dock.data('seriel-dockNavigator')) {
            serDockNav = dock.data('seriel-dockNavigator');
            return;
        }

        dock.dockNavigator();

        serDockNav = dock.data('seriel-dockNavigator');
    }
}

function dockNav() {
    if (!serDockNav) {
    	initDockNavigator();
    }

    return serDockNav;
}