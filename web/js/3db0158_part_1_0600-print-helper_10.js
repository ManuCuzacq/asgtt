$.widget('seriel.printhelper', {
    _create: function () {
    	
    },
    registerElemTransformer: function(elemClass, method) {
    	this.options.transformers[elemClass] = method;
    },
    getTransformerForElem: function(elem) {
    	for (var className in this.options.transformers) {
    		if (elem.hasClass(className)) return this.options.transformers[className];
    	}
    	
    	return null;
    },
    transformElem: function(elem) {
    	var transformer = this.getTransformerForElem(elem);
    	if (!transformer) return false;
    	
    	transformer.call(this, elem);
    	
    	return true;
    },
    options: {
    	transformers: {}
    }
});

var serPrintHelper = null;

function initSerPrintHelper() {
    if ($('body').data('seriel-printhelper')) {
    	serPrintHelper = $('body').data('seriel-printhelper');
        return;
    }
    $('body').printhelper();

    serPrintHelper = $('body').data('seriel-printhelper');
}

function printhelper() {
    if (!serPrintHelper) {
    	initSerPrintHelper();
    }

    return serPrintHelper;
}