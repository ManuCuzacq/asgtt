var serNav = null;

$.widget('seriel.mainNavigator', $.seriel.navigator, {
    _create: function () {
        this._super();

        $('body').unbind('keydown.nav');
        $('body').bind('keydown.nav', $.proxy(this.keyPressed, this));
    },
    getFirstUrlElem: function (url) {
        var splitted = explode('/', url);
        if (splitted) {
            for (var i = 0; i < count(splitted); i++) {
                var val = trim(splitted[i]);
                if ((!val) || val == '')
                    continue;

                return val;
            }
        }

        return '';
    },
    load: function (dest) {
        if ($.type(dest) === 'string')
            dest = parseHash(dest);

        var key = null;
        if (dest && count(dest) > 0)
            key = dest[0].getLabel();

        if (key && this.options.subNavsByUrl[key]) {
            this.options.curActiveChild = this.options.subNavsByUrl[key];
            return this.options.subNavsByUrl[key].load(dest);
        }
        return false;
    },
    declareSubNavigator: function (url, nav) {
        this.options.subNavsByUrl[url] = nav;
    },
    getActiveChild: function () {
        return this.options.curActiveChild;
    },
    options: {
        subNavsByUrl: {},
        curActiveChild: null
    }
});

function initNavigator() {
    hc();

    if ($('body').data('seriel-mainNavigator')) {
        serNav = $('body').data('seriel-mainNavigator');
        initMainMenuNavigator();
        return;
    }
    $('body').mainNavigator();

    serNav = $('body').data('seriel-mainNavigator');

    initMainMenuNavigator();
    initDockNavigator();
    //cm();
}

function nav() {
    if (!serNav) {
        initNavigator();
    }

    return serNav;
}