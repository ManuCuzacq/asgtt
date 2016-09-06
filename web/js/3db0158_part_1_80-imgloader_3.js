$.widget('seriel.imgloader', {
	_create: function() {
		this.options.stack.css({'position': 'fixed', 'top': '0', 'left': '0', 'width': '0', 'height': '0', 'overflow': 'hidden', 'visibility': 'hidden'});
		this.options.stack.prependTo('body');
	},
	addImg: function(img, position, forceLoading) {
		if (!img) return;
		
		img = $(img);
		
		if (img.size() > 1) {
			for (var i = 0; i < img.size(); i++) {
				this.addImg(img.get(i));
			}
			return;
		}
		
		img.serimg();
		
		var imgurl = img.serimg('getImgurl');
		if (this.options.loaded[imgurl]) {
			img.serimg('forceLoaded');
			return;
		}
		
		//img.bind('serloaded', $.proxy(this.imgLoaded, this));
		//img.bind('sererror', $.proxy(this.imgError, this));
		this.addToStack(img, position);
		
		if (forceLoading) img.serimg('load');
		
		this.loadNext();
	},
	loadNext: function() {
		var currentLoading = $(' > .loading', this.options.stack);
		if (currentLoading.size() >= this.options.maxSimultLoading) return;
		
		// On récupère le premier.
		var children = $(' > *:not(.loading)', this.options.stack);
		
		//alert('loadNext : '+children.size());
		
		if (children.size() == 0) return;
		
		var marker = $(children.get(0));
		var serimg = marker.data('serimg');
		
		serimg.load();
	},
	forceLoadImg: function(img) {
		if (!img) return;
		
		img = $(img);
		
		if (img.size() > 1) {
			for (var i = 0; i < img.size(); i++) {
				this.forceLoadImg(img.get(i));
			}
			return;
		}
		
		var serimgData = img.data('serielSerimg');
		if (serimgData) {
			serimgData.load();
		}
		/*var data = img.data();
		for (var key in data) {
			console.log("IMG data : "+key);
		}*/
	},
	addToStack: function(img, pos) {
		var marker = img.serimg('getMarker');
		
		if (!pos) {
			this.options.stack.append(marker);
		} else {
			var nthChild = $(' > :nth-child('+pos+')', this.options.stack);
			if (nthChild.size() == 1) {
				marker.insertBefore(nthChild);
			} else {
				this.options.stack.append(marker);
			}
		}
	},
	imgLoaded: function(event) {
		var img = $(event.currentTarget);
		var imgurl = img.serimg('getImgurl');
		//console.log('LOADED : '+imgurl);
		
		var elemsWithThisImg = $(' > [imgurl=\''+imgurl+'\']', this.options.stack);
		for (var i = 0; i < elemsWithThisImg.size(); i++) {
			var elem = $(elemsWithThisImg.get(i));
			var serimg = elem.data('serimg');
			serimg.forceLoaded;
		}
		
		this.options.loaded[imgurl] = imgurl;
		
		this.loadNext();
	},
	imgLoadedUrl: function(imgurl) {
		//console.log('LOADED : '+imgurl);
		
		var elemsWithThisImg = $(' > [imgurl=\''+imgurl+'\']', this.options.stack);
		for (var i = 0; i < elemsWithThisImg.size(); i++) {
			var elem = $(elemsWithThisImg.get(i));
			var serimg = elem.data('serimg');
			serimg.forceLoaded;
		}
		
		this.options.loaded[imgurl] = imgurl;
		
		this.loadNext();
	},
	imgError: function() {
		var img = $(event.currentTarget);
		var imgurl = img.serimg('getImgurl');
		console.log('ERROR : '+imgurl);
		
		this.loadNext();
	},
	imgErrorUrl: function(imgurl) {
		console.log('ERROR : '+imgurl);
		
		this.loadNext();
	},
	options: {
		maxSimultLoading: 3,
		// INTERNE
		stack: $('<div/>'),
		loaded: {},
		imgByUrl: {}
	}
});

$.widget('seriel.serimg', {
	_create: function() {
		this.options.tagName = this.element.get(0).tagName.toLowerCase();
		this.options.isImg = this.options.tagName == 'img';
		
		if (this.options.isImg) {
			this.options.imgurl = this.element.attr('src');
			if (!this.options.imgurl) this.options.imgurl = this.element.attr('imgurl');
			
			this.element.attr('src', '');
		} else {
			var attr_img = this.element.attr('imgurl');
			var bg = null;
			if (attr_img) {
				bg = attr_img;
			} else {
				bg = trim(this.element.css("background-image"));
				if (substr(strtolower(bg), 0, 4) == 'url(') {
					if (substr(strtolower(bg), strlen(bg) - 1) == ')') {
						bg = substr(bg, 4, strlen(bg) - 5);
					}
				}
			}
			this.options.imgurl = bg;
			this.element.css("background-image", 'none');
		}
		
		this.element.addClass('serimg');
		
		var marker = $('<span></span>');
		
		marker.attr('imgurl', this.options.imgurl);
		marker.data('serimg', this);
		
		this.options.marker = marker;
	},
	getImgurl: function() {
		return this.options.imgurl;
	},
	load: function() {
		if (this.options.loaded) return;
		if (this.options.objImg) return;
		
		console.log('imgloader : start loading : '+this.options.imgurl);
		
		this.element.addClass('loading');
		this.options.marker.addClass('loading');
		
		var img = $('<img style="position: fixed; top: 0; left: 0; height: 10px; width: 10px; opacity: 0; overflow: hidden" />');
		img.one('error', $.proxy(this.error, this));
		img.one('load', $.proxy(this.loaded, this));
		img.attr('src', this.options.imgurl);
		
		$('body').prepend(img);
		this.options.objImg = img;
		
		if (this.options.showWhileLoading) {
			if (this.options.isImg) {
				this.element.attr('src', this.options.imgurl);
			} else {
				this.element.css("background-image", 'url('+this.options.imgurl+')');
			}			
		}
	},
	terminate: function() {
		this.element.removeClass('loading');
		
		if (this.options.isImg) {
			this.element.attr('src', this.options.imgurl);
		} else {
			this.element.css("background-image", 'url('+this.options.imgurl+')');
		}
		
		if (this.options.objImg) this.options.objImg.remove();
		if (this.options.marker) this.options.marker.remove();
		
		this.options.objImg = null;
	},
	error: function() {
		console.log('imgloader : error : '+this.options.imgurl);
		this.options.loaded = false;
		this.terminate();
		//this.element.trigger('sererror');
		imgLoader().imgloader('imgErrorUrl', this.options.imgurl);
	},
	loaded: function() {
		console.log('imgloader : loaded : '+this.options.imgurl);
		this.options.loaded = true;
		this.terminate();
		//this.element.trigger('serloaded');
		imgLoader().imgloader('imgLoadedUrl', this.options.imgurl);
	},
	forceLoaded: function() {
		this.terminate();
		this.options.loaded = true;
	},
	getMarker: function() {
		return this.options.marker;
	},
	options: {
		// INTERNE
		tagName: null,
		isImg: false,
		marker: null,
		
		imgurl: null,
		objImg: null,
		
		showWhileLoading: true,
		
		loaded: false
	}
});

var imgloader = null;
function imgLoader() {
	if (imgloader) return imgloader;
	imgloader = $('<div></div>');
	imgloader.imgloader();
	
	return imgloader;
}