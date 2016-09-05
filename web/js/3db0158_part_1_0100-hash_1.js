function getCleanHash() {
    var hash = document.location.hash;
    if (hash == null || hash == undefined || hash.length == 0)
        return '';
    return hash.substr(1);
    //return substr(hash, 1);
}


/** *************** Class UrlElement **************** */
function UrlElement() {
}

// Label
UrlElement.prototype.setLabel = function (label) {
    this.label = label;
}
UrlElement.prototype.getLabel = function () {
    return this.label;
}

// Params
UrlElement.prototype.setParams = function (params) {
    this.params = params;
}
UrlElement.prototype.getParams = function () {
    return this.params;
}
UrlElement.prototype.whoami = function () {
    alert('UrlElement [label=' + this.getLabel() + '] [params=' + this.getParams() + ']');
}
/** ************* Fin Class UrlElement ************** */


function parseHash(hash) {
    if (hash)
        hash = hash.trim();
    if ((!hash) || hash == '' || hash == '/') {
        var elem = new UrlElement();
        elem.setLabel('');
        elem.setParams(null);

        return [elem];
    }

    var res = [];

    // OK, let's split stuf.
    var splitted = hash.split('/');
    for (var i = 0; i < splitted.length; i++) {
        var str = splitted[i];
        if (str)
            str = str.trim();
        if (i == 0 && ((!hash) || hash == '')) {
            // Si le premier élément est vide, on fait comme s'il n'était pas
            // présent.
            // Le hash commence par un /
            continue;
        }

        var label = '';
        var paramsStr = '';

        // L'est try to find the params.
        var splitted2 = str.split('[');
        var lastChar = str.slice(-1);
        if (splitted2.length == 2 && lastChar == ']') {
            label = splitted2[0];
            paramsStr = splitted2[1].substring(0, splitted2[1].length - 1);
        } else {
            label = str;
        }

        var params = null;
        if (paramsStr) {
            // On parse les paramètres.
            var useObject = false;
            if (paramsStr.indexOf('=') > 0) {
                useObject = true;
            }
            var splitted3 = patamsStr.split(',');
            if (useObject) {
                params = {};
                for (var j = 0; j < splitted3.length; j++) {
                    var pm = splitted3[j];
                    var splitted4 = pm.split('=');
                    if (count(splitted4) == 2) {
                        var key = splitted4[0];
                        var val = splitted4[1];

                        if (key) {
                            params[key] = val;
                        }
                    }
                }
            } else {
                params = [];
                for (var j = 0; j < count(splitted3); j++) {
                    var pm = splitted3[j];
                    params.push(pm);
                }
            }
        }

        var elem = new UrlElement();
        elem.setLabel(label);
        elem.setParams(params);

        res.push(elem);

        /*
         * alert('label['+label+'] params['+params+']'); //alert(params != null &&
         * $.isPlainObject(params)); if (params && $.isPlainObject(params) &&
         * (!$.isArray(params))) { for (var key in params) {
         * alert('params['+key+'] = '+params[key]); } }
         */
    }

    return res;
}

$.widget('seriel.hashcontrol', {
	_create: function() {

		/*if (isIE.IE7()) {
			this.startIE7HashChange();
		}*/

		$(window).unbind('hashchange.serhashcontrol');
		$(window).bind( 'hashchange.serhashcontrol', $.proxy(this.hashchange, this));



		var hashElem = $('#content > .hash');
		if (hashElem && hashElem.size() == 1) {
			var hash = hashElem.html();
			hashElem.remove();
			this.setHash(hashElem.html());
		} else {
			this.hashchange();
		}
	},
	startIE7HashChange: function() {

		var hash = getCleanHash();

		if (this.options.oldHashIE7 != hash) {
			//console.log('check hash IE7 : CHANGED !!!');
			this.hashchange(null);
		} else {
			//console.log('check hash IE7 : didnt change');
		}
		this.options.oldHashIE7 = hash;

		setTimeout($.proxy(this.startIE7HashChange, this), 50);
	},
	setHash: function(hash) {
		if (!hash) hash = '';

		window.location.hash = hash;
	},
	hashchange: function(e) {
		var hash = getCleanHash();
		
		console.log('HASH > '+hash);

		sm().goFromTo(this.options.lastLocation, hash);
		this.options.lastLocation = hash;

		/*try {
		 if (_gaq) {
		 _gaq.push(['_trackPageview', '/'+hash]);
		 }
		 } catch (err) {
		 console.log('ERREUR : '+err);
		 }

		 try {
		 checkBandeauAnalytics();
		 } catch (err) {
		 console.log(err);
		 }*/
		//
	},
	options: {
		lastLocation: '',
		oldHashIE7: null
	}
});


var serHC = null;

function initSerHC() {
    if ($('body').data('seriel-hashcontrol')) {
        serHC = $('body').data('seriel-hashcontrol');
        return;
    }
    $('body').hashcontrol();
    
    serHC = $('body').data('seriel-hashcontrol');
}

function hc() {
    if (!serHC) {
        initSerHC();
    }

    return serHC;
}