var serielSM = null;
var serielPanier = null;
var serielCatalogue = null;

var is_dev = false;
var devInit = false;
function isDev() {
	if (devInit == false) {
		if ( document.location.href.indexOf('app_dev.php') > 0) {
			is_dev = true;
		}
		devInit = true;
	}
	return is_dev;
}

function getUrlPrefix() {
	return (isDev() ? '/app_dev.php' : '');
}

function initSM() {
	if ($('body').data('seriel-siteManager')) {
		serielSM = $('body').data('seriel-siteManager');
		return;
	}
	$('body').siteManager();
	serielSM = $('body').data('seriel-siteManager');
}

function hc() {
	if (!serHC) {
		initSerHC();
	}

	return serHC;
}

function sm() {
	if (!serielSM) {
		initSM();
	}

	return serielSM;
}

function showAlert(title, content, dest) {
	if (!dest)
		dest = $('body');
	$.proxy(closeAlert, dest)();

	var alertBlock = $('<div class="alert_container"><div class="alert_content">'
			+ content
			+ '</div><div class="alert_button"><span class="neutral_button"><span>OK</span></span></div></div>');
	dest.data('alert', alertBlock);
	alertBlock.dialog({
		'modal' : true,
		'title' : title,
		'draggable' : false,
		'resizable' : false,
		'width' : 350,
		'appendTo' : dest,
		'position' : {
			my : "center",
			at : "center",
			of : dest
		}
	});
	alertBlock.parent().addClass('alertModal');

	$('.neutral_button', alertBlock).bind('click', $.proxy(closeAlert, dest));
	alertBlock.dialog('open');
}

function closeAlert(dest) {
	var alertBlock = this.data('alert');
	if (alertBlock) {
		alertBlock.dialog('close');
	}
}

function openModal(title, url, options) {
	openModalInside(title, url, $('body'), options);
}

function getParentModal(modal) {
	var myself = modal.closest('.ui-dialog');
	if (myself.size() == 1) {
		dad = myself.parent().closest('.ui-dialog');
		if (dad.size() == 1) {
			return $(' > .seriel_dialog', dad);
		}
	}
	return null;
}


$.widget('seriel.carouselImage', {
	_create : function() {
		var class_sup = this.element.attr('class') ? ' '
				+ this.element.attr('class') : '';
		this.options.container = $('<div class="carousel_image' + class_sup
				+ '"></div>');
		// this.options.container.css('background-image',
		// 'url('+this.element.attr('src')+')');

		var imgurl = this.element.attr('imgurl');
		if (!imgurl)
			imgurl = this.element.attr('src');

		this.options.container.attr('imgurl', imgurl);

		this.options.container.data('carouselImage', this);
		// this.options.container.css('opacity', this.element.css('opacity'));

		this.element.replaceWith(this.options.container);
		/*if (isIE.lowerThan9()) {
			this.element.appendTo(this.options.container);
			this.element.css('width', '100%')
		} else {
			this.element.remove();
		}*/
	},
	zoom : function(direction, zoom) {
		// this.options.container.addClass('zoom');
		// console.log("TOGGLE ZOOM : "+this.options.container.attr('class'));
		// this.options.container.toggleClass('zoom');
		// console.log("TOGGLE ZOOM AFTER :
		// "+this.options.container.attr('class'));

		setTimeout($.proxy(this.zoomReal, this), 100);
		// this.options.container.stop(),
		// this.options.container.animate({ 'opacity': 1, 'top': -100, 'left':
		// -200, 'right': -20, 'bottom': -20 }, 6000, 'linear');
	},
	zoomReal : function() {
		this.options.container.toggleClass('zoom');
	},
	forceUnzoom : function() {
		// this.options.container.removeClass('zoom');
	},
	checkImg8IE : function() {
		var img = $(' > img', this.options.container);

		img.css('width', '100%');
		img.css('height', 'auto');

		var imgHeight = img.height();
		if (imgHeight < this.options.container.height()) {
			img.css('height', '100%');
			img.css('width', 'auto');

			var width = img.width();
			var containerWidth = this.options.container.width();

			var left = 0;
			if (this.options.container.hasClass('align_left')
					|| this.options.container.hasClass('align_top_left')
					|| this.options.container.hasClass('align_left_top')
					|| this.options.container.hasClass('align_bottom_left')
					|| this.options.container.hasClass('align_left_bottom')) {

				left = 0;
			} else if (this.options.container.hasClass('align_right')
					|| this.options.container.hasClass('align_top_right')
					|| this.options.container.hasClass('align_right_top')
					|| this.options.container.hasClass('align_bottom_right')
					|| this.options.container.hasClass('align_right_bottom')) {

				left = intval(-(width - containerWidth));
			} else {
				left = intval(-(width - containerWidth) / 2);
			}
			if (left > 0)
				left = 0;
			img.css('left', left + 'px');
		} else {
			var height = img.height();
			var containerHeight = this.options.container.height();

			var top = 0;
			if (this.options.container.hasClass('align_top')
					|| this.options.container.hasClass('align_top_left')
					|| this.options.container.hasClass('align_left_top')
					|| this.options.container.hasClass('align_top_right')
					|| this.options.container.hasClass('align_right_top')) {

				top = 0;
			} else if (this.options.container.hasClass('align_bottom')
					|| this.options.container.hasClass('align_bottom_left')
					|| this.options.container.hasClass('align_left_bottom')
					|| this.options.container.hasClass('align_bottom_right')
					|| this.options.container.hasClass('align_right_bottom')) {

				top = intval(-(height - containerHeight));
			} else {
				top = intval(-(height - containerHeight) / 2);
			}

			if (top > 0)
				top = 0;
			img.css('top', top + 'px');
		}
	},
	getContainer : function() {
		return this.options.container;
	},
	options : {
		container : null
	}
});


$.widget('seriel.carousel',{
_create : function() {
	console.log('carousel');
	$(' > img', this.element).carouselImage();
	this.options.elements = $(' > *', this.element);
	imgLoader().imgloader('addImg', this.options.elements);

	if (this.options.useJsEffet)
		this.options.elements.filter(':not(:first-child)')
				.css('opacity', '0');

	this.gotoElem(0);

	setTimeout($.proxy(this.nextAndTimeout, this),
			this.options.timeVisible);
},
setModeManual : function() {
	if (this.options.mode != 'manual') {
		this.options.mode = 'manual';
		this.forceClearTimeout();
	}
},
setModeAutomatic : function() {
	if (this.options.mode != 'automatic') {
		this.options.mode = 'automatic';
	}
},
getCurrentVisible : function() {
	/*if (isIE.lowerThan9()) {
		var curr = null;
		for (var i = 0; i < this.options.elements.size(); i++) {
			var elem = $(this.options.elements.get(i));
			var display = elem.css('display');
			if (display == 'block') {
				curr = elem;
			}
		}

		return curr;
	}*/
	var maxOpacity = 0;
	var curr = null;
	for (var i = 0; i < this.options.elements.size(); i++) {
		var elem = $(this.options.elements.get(i));
		var op = parseFloat(elem.css('opacity'));
		if (curr == null || op > maxOpacity) {
			curr = elem;
			maxOpacity = op;
		}
	}

	return curr;
},
gotoElem : function(index) {
	/*if (isSmallDisplay()) {
		this.gotoElemReal(index)
	} else {*/
		setTimeout($.proxy(function() {
			this.gotoElemReal(index)
		}, this), 50);
	/*}*/
},
gotoElemReal : function(index) {
	index = parseInt(index);
	// console.log('GOTO '+index+" /
	// "+this.options.elements.size());
	if (index >= this.options.elements.size())
		index = 0;
	if (index < 0)
		index = 0;

	if (this.options.useJsEffet)
		this.options.elements.stop();

	var elem = this.options.elements.filter(':nth-child('
			+ (index + 1) + ')');
	if (elem.size() == 1) {
		imgLoader().imgloader('forceLoadImg', elem);
	}

	var dataCarImg = this.options.elements.filter(
			':nth-child(' + (index + 1) + ')').data(
			'carouselImage');

	if (dataCarImg) {
		// console.log("FOUND DATA !!!");
		dataCarImg.forceUnzoom();
	}

	if (this.options.useJsEffet) {
		this.options.elements.filter(
				':not(:nth-child(' + (index + 1) + '))')
				.animate({
					'opacity' : 0
				}, this.options.transitionSpeed);
		this.options.elements.filter(
				':nth-child(' + (index + 1) + ')').animate(
				{
					'opacity' : 1
				}, this.options.transitionSpeed);
	} else {
		this.options.elements.filter(
				':not(:nth-child(' + (index + 1) + '))')
				.removeClass('visible');
		this.options.elements.filter(
				':nth-child(' + (index + 1) + ')')
				.addClass('visible');
	}

	/*if (isIE.lowerThan9() && dataCarImg) {
		dataCarImg.checkImg8IE();
	}*/

	if (dataCarImg)
		dataCarImg.zoom();
},
gotoNext : function() {
	var toRemove = this.options.elements
			.filter('.toRemove');
	if (toRemove.size() > 0) {
		for (var i = 0; i < toRemove.size(); i++) {
			var elem = $(toRemove.get(i));
			if (isIE.lowerThan9()) {
				elem.remove();
			} else {
				var op = floatval(elem.css('opacity'));
				if (op < 0.1)
					elem.remove();
			}
		}
		this.options.elements = $(' > *:not(.toRemove)',
				this.element);
	}
	// On r��cup��re l'��l��ment courant
	var curr = this.getCurrentVisible();
	if (curr && curr.size() > 0) {
		var currPos = curr.index();
		this.gotoElem(currPos + 1);
	}
},
forceClearTimeout : function() {
	try {
		clearTimeout(this.options.currentTimeout);
	} catch (ex) {

	}
},
nextAndTimeout : function() {
	this.forceClearTimeout();
	this.options.elements.removeClass('fast');

	if (this.options.mode != 'automatic') {
		return;
	}

	this.gotoNext();

	this.forceClearTimeout();
	if (this.isLonely())
		this.options.currentTimeout = setTimeout($.proxy(
				this.nextAndTimeout, this),
				this.options.transitionSpeed
						+ this.options.timeVisible + 26000);
	else
		this.options.currentTimeout = setTimeout($.proxy(
				this.nextAndTimeout, this),
				this.options.transitionSpeed
						+ this.options.timeVisible);

},
isLonely : function() {
	if (this.options.elements.filter(':not(.toRemove)')
			.size() <= 1)
		return true;
	return false;
},
update : function(newElements) {
	this.options.elements.removeClass('fast');

	for (var i = 0; i < newElements.size(); i++) {
		var elem = $(newElements.get(i));
		var src = elem.attr('src');
		elem.attr('imgurl', src);
		elem.attr('src', '');
	}

	this.forceClearTimeout();

	// if (newElements.size() > 0)
	// $(newElements.get(0)).addClass('fast');

	this.options.elements.addClass('toRemove');
	if (this.options.useJsEffet)
		newElements.css('opacity', 0);

	var qteImg = newElements.filter('img').size();
	if (isSmallDisplay()) {
		$(' > *', this.element).remove();
	} else {
		// Combien a-t-on d'image ?
		if (qteImg % 2) {
			var dup = $(newElements.filter('img').get(0))
					.clone();
			dup.addClass('toRemove');
			dup.css('visiblity', 'hidden');
			dup.css('display', 'none');
			this.element.prepend(dup);
		}
	}

	this.element.prepend(newElements);

	var elemsImgs = newElements.filter('img');
	if (elemsImgs.size() > 0) {
		var elem = $(elemsImgs.get(0));
		elem.carouselImage();
		var container = elem.carouselImage('getContainer');
		imgLoader().imgloader('addImg', container, 1, true);
	}
	/*
	 * for (var i = elemsImgs.size() - 1; i >= 1; i--) { var
	 * elem = $(elemsImgs.get(i)); elem.carouselImage(); var
	 * container = elem.carouselImage('getContainer');
	 * imgLoader().imgloader('addImg', container, 2); }
	 */
	for (var i = 1; i < elemsImgs.size(); i++) {
		var elem = $(elemsImgs.get(i));
		elem.carouselImage();
		var container = elem.carouselImage('getContainer');
		imgLoader().imgloader('addImg', container, i + 1);
	}

	this.options.elements = $(' > *', this.element);

	// Tout le monde passe en mode rapide !
	this.options.elements.addClass('fast');

	this.gotoElem(0);

	this.forceClearTimeout();

	if (this.isLonely())
		this.options.currentTimeout = setTimeout($.proxy(
				this.nextAndTimeout, this),
				this.options.transitionSpeed
						+ this.options.timeVisible + 26000)
	else
		this.options.currentTimeout = setTimeout($.proxy(
				this.nextAndTimeout, this),
				this.options.transitionSpeed
						+ this.options.timeVisible)
},
options : {
	timeVisible : 4000,
	transitionSpeed : 2000,
	useJsEffet : false,

	// INTERNE
	elements : null,
	mode : 'automatic'
	}
});

$.widget('seriel.siteManager',{
	_create : function() {
		var href = document.location.href;
		if (href.indexOf('app_dev.php') > 0)
			this.options.isDebug = true;

		// On récupère les images de la page d'accueil.
		/*
		 * var accueilImgs = $('.slider > img', this.element);
		 * this.options.accueilImgs = []; for (var i = 0; i <
		 * accueilImgs.size(); i++) {
		 * this.options.accueilImgs.push($(accueilImgs.get(i)).clone()); }
		 */

		this.options.accueilImgs = $('.slider > img',
				this.element);

		var compte_imgs = $('.images_compte > .img',
				this.element);
		this.options.compteImgs = $('<div></div>');
		for (var i = 0; i < compte_imgs.size(); i++) {
			var span = $(compte_imgs.get(i));
			this.options.compteImgs.append('<img src="'
					+ span.html() + '" />');
		}

		var admin_imgs = $('.images_admin > .img', this.element);
		this.options.adminImgs = $('<div></div>');
		for (var i = 0; i < admin_imgs.size(); i++) {
			var span = $(admin_imgs.get(i));
			this.options.adminImgs.append('<img src="'
					+ span.html() + '" />');
		}

		this.options.header = $('#header');
		this.options.content = $('#content');
		this.options.footer = $('#footer');

		this.options.footer.css('overflow', 'hidden');

		this.options.pageContainer = $('.page_container',
				this.element);

		this.options.slider = $('.slider', this.element);
		this.options.slider.carousel();
		this.options.siteTitle = $('.site_title');

		/*if (isMobile.iOS())
			this.options.bodyClass = 'iOS';
		if (isMobile.Android())
			this.options.bodyClass = 'Android';
		if (isMobile.BlackBerry())
			this.options.bodyClass = 'BlackBerry';
		if (isMobile.Opera())
			this.options.bodyClass = 'Opera';
		if (isMobile.Windows())
			this.options.bodyClass = 'Windows'; */
		/*if (isIE.any()) {
			this.options.bodyClass = 'IE';

			if (isIE.IE7())
				this.options.bodyClass += ' IE7';
			if (isIE.IE8())
				this.options.bodyClass += ' IE8';
			if (isIE.IE9())
				this.options.bodyClass += ' IE9';
			if (isIE.IE10())
				this.options.bodyClass += ' IE10';
			if (isIE.IE11())
				this.options.bodyClass += ' IE11';
		}*/

		if (this.options.bodyClass != '')
			$('body').addClass(this.options.bodyClass);

		this.options.pageContact = $('.page_contact',
				this.element);
		// this.options.pageContact.pageContact();
		// On s'occupe des images en caches.
		setTimeout($.proxy(this.initCacheImg, this), 200);
	},
	initCacheImg : function() {
		var imgcaches = $('#imgpreload > img');
		for (var i = 0; i < imgcaches.size(); i++) {
			var imgcache = $(imgcaches.get(i));
			imgLoader().imgloader('addImg', imgcache, i + 100);
		}
	},
	goFromTo : function(from, to) {
		if (from == to)
			return;

		var to_infos = parseHash(to);
		if (to_infos.length == 0) {
			// On revient a la page d'accueiL.
			$('body')
					.removeClass(
							'tradi promo contact compteur membres bureau entrainement maire');
			$('body').addClass('accueil');
			this.navigate('');

		} else {
			var first_level = to_infos[0];
			var second_level = to_infos[1];
			if (to_infos.length > 1) {
				var label = first_level.getLabel() + '/'
						+ second_level.getLabel()
			} else {
				var label = first_level.getLabel();
			}

			if (label == '') {
				$('body')
						.removeClass(
								'tradi promo contact compteur membres entrainements bureau maire photos');
				$('body').addClass('accueil');
				this.navigate('');
			} else {
				var label = first_level.getLabel();
				// alert(label);
				$('body').addClass(label);
				var classes = [ 'accueil' , 'tradi', 'promo', 'photos','contact',
						'compteur', 'membres', 'bureau', 'entrainements','maire' ];
				for ( var i in classes) {
					cl = classes[i];
					if (cl != label && $('body').hasClass(cl)) {
						$('body').removeClass(cl);
					}
				}
				$('body').addClass(label);

				this.navigate(label);
			}
		}

		try {
			this.options.slider.carousel('setModeAutomatic');
		} catch (ex) {
		}

		return;
	},
	navigate : function(label) {
		$('body').animate({
			scrollTop : 0
		}, '200');

		var first = '';
		var second = '';
		var third = '';

		var elems = parseHash(getCleanHash());
		if (elems.length > 0) {
			first = elems[0].getLabel();
			if (elems.length > 1) {
				second = elems[1].getLabel();
				if (elems.length > 2) {
					third = elems[2].getLabel();
				}
			}
		}
		
		var tab = label.split('/');
		alert('test');
		if(first == 'compteur'){
			
		}else if (first == 'contact'){
			
		}else if (first == 'photos'){
			
		}else if (first == 'tradi' || first == 'promo'){ // se sont les pages joueurs
				

		}else if (first == 'maire' || 'first' == 'bureau' || first == 'entrainements' ){  //se sont les pages fixes

			if(!second){
				$.post(getUrlPrefix() + '/page/'+ first.toLowerCase(), $.proxy(this.pageLoaded, this));
			}else{
				if(first == 'maire'){
					var content = CKEDITOR.instances.editor_maire.getData();
				}else if(first == 'bureau'){
					var content = CKEDITOR.instances.editor_bureau.getData();
				}else if (first == 'entrainements'){
					var content = CKEDITOR.instances.editor_entrainements.getData();
				}
	
				var datas = {'content':content};
				
				$.post(getUrlPrefix() + '/page/'+ first.toLowerCase()+'/save',datas, $.proxy(this.pageSaved, this));
			}
			
			
		}else if (first == 'membres'){
			
		}
	},
	setLoading : function() {
		this.element.addClass('loading');
	},
	hideLoading: function() {
		this.element.removeClass('loading');
	},
	getTypeUser: function(){
		return $('.user > .type-user',this.element).html();
	},
	isAdmin : function(){
		var type_user = 'ANON';
		type_user = this.getTypeUser().trim();
		if(type_user == "ADMIN")return true;
		return false;
	},
	isJoueur : function(){
		var type_user = 'ANON';
		type_user = this.getTypeUser().trim();
		if(type_user == "JOUEUR")return true;
		return false;
	},
	pageLoaded: function(result){
		var res = $(result);
		var nom = '';
		
		if (res.hasClass('success')){
			var code = $('<div></div>');
			content = $('.content',res);
			var text = content.text();
			
			nom = $('.nom',res).html().trim();
			if(this.isAdmin()){
				
				if(nom == 'maire'){
					CKEDITOR.instances.editor_maire.setData(text);
				}else if( nom == "bureau"){
					CKEDITOR.instances.editor_bureau.setData(text);
				}else if ( nom == "entrainements"){
					CKEDITOR.instances.editor_entrainements.setData(text);
				}
				
			}else{
				$('.page_'+nom+' > .content',this.element).html(text);
			}
			
		}
		this.hideLoading();
	},
	pageSaved : function(result){
		var res = $(result);
		
		var nom = $('.nom',res).html();
		
		if(res.hasClass="success"){
			document.location.href = '#'+nom;
		}
	},
	afficherContenu : function(result) {
		var res = $(result);
		// $('.slider',this.element).show();
		// On récupère les images.
		var imgsSpans = $('.slider_images > span', res);
		var imgsElems = $('<div></div>');
		for (var i = 0; i < imgsSpans.size(); i++) {
			var span = $(imgsSpans.get(i));
			var elem = $('<img src="' + span.html() + '" />');
			if (span.attr('class'))
				elem.attr('class', span.attr('class'));

			if (imgsSpans.size() == 1)
				elem.addClass('lonely');

			imgsElems.append(elem);
		}

		if ($(' > img', imgsElems).size() > 0) {
			$('.slider', this.element).carousel('update',
					$(' > img', imgsElems));

		}

		cat().updateContent(res.html());
	},
	shortenSlider : function() {
		console.log('shortenSLider');
		this.options.slider.addClass('small');
		this.options.siteTitle.addClass('hidden');
	},
	unshortenSlider : function() {
		this.options.slider.removeClass('small');
		this.options.siteTitle.removeClass('hidden');
	},
	options : {
		accueilImgs : [],
		compteImgs : null,
		adminImgs : null,

		isDebug : false,
		header : null,
		content : null,
		footer : null,
		pageContainer : null,
		slider : null,
		siteTitle : null,
		bodyClass : '',
		pageContact : null
	}
});
$.widget('seriel.modal',{
	_create : function() {
		$_modal = this;
		$_modal.options._url = $(this.element).attr("href");
		$_modal.options.container = $("._modal-container");
		$_modal.options.container_error = $("._modal-error");
		// create modal
		$_modal._createModal();
		// customize it
		if ($(this.element).attr("ajx-css"))
			$_modal.options._cssModal = $(this.element).attr(
					"ajx-css").replace(/'/g, '"');
		try {
			$("._modal").css(
					$.parseJSON($_modal.options._cssModal));
		} catch (e) {
			console.log("Error on json decode " + e.message);
		}
		// init events
		$_modal._iniEvent();
		$(this.element).bind("click",
				$.proxy(this.onClickLink, this));
	},
	_createModal : function() {
		if ($("._modal").length == 0) {
			$("body")
					.append(
							'<div class="_modalBg" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;opacity:0.5;z-index:1000;background:black;"></div><div class="_modal" style="display:none;border:1px solid gray; border-radius:5px;box-shadow: 1px 1px 12px #aaa;position:fixed;top:20%;left:0%;height:300px;width:300px;z-index:1001;background:white;"><div class="_modal-close" style="float:right;cursor:pointer;margin-top:-11px;margin-right:-10px;color:white;background:black;border-radius:10px;border:1px solid white;box-shadow:1px 1px 12px #aaa;">&nbsp;X&nbsp;</div><div class="_modal-container" style="padding:5px"></div><div class="_modal-error" style="padding:5px"></div></div>')
		}
	},
	data : function(data) {

		var from = basename($_modal.options._tmp_url);

		console.log("URL " + $_modal.options._tmp_url
				+ " FROM " + from); //

		if ($(data).find(".ajaxLink").length > 0
				|| from == "logout") {
			console.log("CLOSE MODAL " + new Date())
			$_modal.close();
			location.reload();
			return false;
		} else
			$("._modal-container").html(data);

		return true;
	},
	initEventOnForm : function() {
		console.log("INITEVENTFORM " + new Date())
		if ($("._modal-container form").length > 0) {
			$("._modal-container form")
					.submit(
							function(event) {
								event.preventDefault();
								var $this = $(this);
								var url = $this.attr("action");
								$_modal.options._tmp_url = url;
								$
										.ajax(
												{
													url : $this
															.attr('action'),
													type : $this
															.attr('method'),
													data : $this
															.serialize()
												})
										.fail(
												$_modal._ajaxError)
										.done(
												function(data) {
													if ($_modal
															.data(data))
														$_modal
																.initEventOnForm();
												});
								return false;
							});
		}
	},
	onClickLink : function(event) {
		event.preventDefault();
		// load and show modal
		$_modal.options._tmp_url = this.options._url;
		$.ajax(this.options._url).done(function(data) {
			if ($_modal.data(data))
				$_modal.initEventOnForm();
		}).fail($_modal._ajaxError).always(function() {
		});
		$("._modalBg,._modal").show();
		// open modal
		return false;
	},
	_ajaxError : function(jqXHR, exception) {
		// Our error logic here
		console.log(exception)
		var msg = 'URL : ' + $_modal.options._tmp_url
				+ '<br/> ERROR : ';
		if (jqXHR.status === 0) {
			msg += 'Not connect.\n Verify Network.';
		} else if (jqXHR.status == 404) {
			msg += 'Requested page not found. [404]';
		} else if (jqXHR.status == 500) {
			msg += 'Internal Server Error [500].';
		} else if (exception === 'parsererror') {
			msg += 'Requested JSON parse failed.';
		} else if (exception === 'timeout') {
			msg += 'Time out error.';
		} else if (exception === 'abort') {
			msg += 'Ajax request aborted.';
		} else {
			msg += 'Uncaught Error.\n' + jqXHR.responseText;
		}
		$("._modal-error").css("color", "red");
		$("._modal-error").html(msg);
	},
	_iniEvent : function() {
		// close button
		$("._modalBg,._modal-close").click(function(event) {
			$_modal.close();
		})
	},
	close : function() {
		$("._modalBg,._modal").hide();
	},
	options : {
		_url : null,
		_cssModal : "{'width':'80%','left':'10%'}",
		container : null,
		container_error : null,
		_tmp_url : null
	}
});

$.widget('manu.animationHeader',{
	_create : function() {
		$('ul > li > a > img',this.element).bind('mouseover',$.proxy(this.hoverActivate,this));
		$('ul > li > a > img',this.element).bind('mouseout',$.proxy(this.clearSurvol,this));
		//$('ul > li > a > img',this.element).bind('click',$.proxy(this.select,this));
		this.options.currentSurvol = "";
		this.options.currentSelect = "";
	},
	hoverActivate: function(event){
		
		var target = $(event.currentTarget);
		
		var source = target.attr('src');
		var split = source.split('/');
		var taille = split.length;
		taille --;
		var fichier = split[taille];
		var fichier_split = fichier.split('.');
		var ext = fichier_split[1];
		var nom = fichier_split[0];
		
		if(this.options.currentSurvol != source){
			this.clearSurvol();
		}
		if(!target.hasClass('survol')){
			this.options.currentSurvol = source;
			
			var nom = nom+' survolé';
			var fichier = nom+'.'+ext;
			split[taille] = fichier
			var new_url = "";
			for(var i = 1; i<taille+1;i++){
				new_url = new_url+'/'+split[i];
			}
			
			target.addClass('survol');
		
		
			target.attr('src',new_url);
		}	
	},
	clearSurvol: function(){
		$('ul > li > a > img',this.element).each(function(){
			var test = $(this).attr('src');
			test = test.replace(' survolé','');
			$(this).removeClass('survol');
			$(this).attr('src',test);
			
		});
	},
	clearSelect: function(){
		$('ul > li > a > img',this.element).each(function(){
			var test = $(this).attr('src');
			test = test.replace(' activé','');
			$(this).removeClass('selected');
			$(this).attr('src',test);
		});
	},
	select: function(event){
		$('ul > li a > img',this.element).removeClass('selected');
		var target = $(event.currentTarget);
		
		var source = target.attr('src');
		var split = source.split('/');
		var taille = split.length;
		taille --;
		var fichier = split[taille];
		var fichier_split = fichier.split('.');
		var ext = fichier_split[1];
		var nom = fichier_split[0];
		
		if(this.options.currentSelect != source){
			this.clearSelect();
		}
		if(!target.hasClass('selected')){
			this.options.currentSelect = source;
			var nom = nom.replace(' survolé','');
			var nom = nom+' activé';
			var fichier = nom+'.'+ext;
			split[taille] = fichier
			var new_url = "";
			for(var i = 1; i<taille+1;i++){
				new_url = new_url+'/'+split[i];
			}
			
			target.addClass('selected');

			target.attr('src',new_url);
		}	
		
	},
	options:{
		
	}

});