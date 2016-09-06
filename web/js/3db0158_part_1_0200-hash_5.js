
function getCleanHash() {
    var hash = document.location.hash;
    if (hash == null || hash == undefined || strlen(hash) == 0)
        return '';
    return substr(hash, 1);
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
        hash = trim(hash);
    if ((!hash) || hash == '' || hash == '/') {
        var elem = new UrlElement();
        elem.setLabel('');
        elem.setParams(null);

        return [elem];
    }

    var res = [];

    // OK, let's split stuf.
    var splitted = explode('/', hash);
    for (var i = 0; i < count(splitted); i++) {
        var str = splitted[i];
        if (str)
            str = trim(str);
        if (i == 0 && ((!hash) || hash == '')) {
            // Si le premier élément est vide, on fait comme s'il n'était pas
            // présent.
            // Le hash commence par un /
            continue;
        }

        var label = '';
        var paramsStr = '';

        // L'est try to find the params.
        var splitted2 = explode('[', str);
        var lastChar = str.slice(-1);
        if (count(splitted2) == 2 && lastChar == ']') {
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
            var splitted3 = explode(',', paramsStr);
            if (useObject) {
                params = {};
                for (var j = 0; j < count(splitted3); j++) {
                    var pm = splitted3[j];
                    var splitted4 = explode('=', pm);
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
    _create: function () {
        $(window).unbind('hashchange.serhashcontrol');
        $(window).bind('hashchange.serhashcontrol', $.proxy(this.hashchange, this));

        var hashElem = $('#content > .hash');
        if (hashElem && hashElem.size() == 1) {
            var hash = hashElem.html();
            hashElem.remove();
            this.setHash(hashElem.html());
        } else {
            this.hashchange();
        }
    },
    setHash: function (hash) {
        if (!hash)
            hash = '';
        window.location.hash = hash;
    },
    hashchange: function () {
        unActiveCurrentActions();

        var hash = getCleanHash();
        if (hash == '') {
            this.setHash('accueil');
            return;
        }
        
		//var res = websock().emit('seriel.websocket.test', hash);

        // alert('change from -'+this.options.lastLocation+'- to -'+hash+'-');
        var dest = parseHash(hash);
        var res = nav().load(dest);
        if (!res) {
            // On a un problème.
            // this.setHash(this.options.lastLocation);
            //window.history.back();
        } else {
            // Tout va bien.
            this.options.lastLocation = hash;
        }
    },
    getLastLocation: function() {
    	return this.options.lastLocation;
    },
    options: {
        lastLocation: ''
    }
});

$.widget('seriel.ancrage', {
    _create: function () {
        this.options.links = $('.ancre', this.element);
        this.options.links.bind('click', $.proxy(this.ancreClicked, this));
    },
    ancreClicked: function (event) {
        var target = $(event.currentTarget);
        var ancre = target.attr('ancre');
        
        var block_height = this.options.scrollblock.height();
        var block_content_height = this.options.scrollblock.get(0).scrollHeight;

        var scrollto = $('.block_ancre_' + ancre, this.options.scrollblock);

        var scrolltoPos = scrollto.position();
        
        var scrollDest = scrolltoPos.top + 1 + this.options.scrollblock.scrollTop();
        if (scrollDest <= 1) scrollDest = 0;
        if (scrollDest > block_content_height - block_height) scrollDest = block_content_height - block_height;

        this.options.scrollblock.animate({'scrollTop': scrollDest}, 400);
    },
    options: {
        scrollblock: null
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