$.widget('seriel.multiple_emails', {
	_create: function() {
		var deleteIconHTML = "";
		/*if (this.options.theme.toLowerCase() == "Bootstrap".toLowerCase())
		{
			deleteIconHTML = '<a href="#" class="multiple_emails-close" title="Remove"><span class="glyphicon glyphicon-remove"></span></a>';
		}
		else if (this.options.theme.toLowerCase() == "SemanticUI".toLowerCase() || this.options.theme.toLowerCase() == "Semantic-UI".toLowerCase() || this.options.theme.toLowerCase() == "Semantic UI".toLowerCase()) {
			deleteIconHTML = '<a href="#" class="multiple_emails-close" title="Remove"><i class="remove icon"></i></a>';
		}
		else if (this.options.theme.toLowerCase() == "Basic".toLowerCase()) {
			//Default which you should use if you don't use Bootstrap, SemanticUI, or other CSS frameworks
			
		}*/
		
		deleteIconHTML = '<span href="#" class="multiple_emails-close" title="Remove"><i class="basicdeleteicon">Remove</i></span>';
		
		this.options.deleteIconHTML = deleteIconHTML;
		
		this.options.ul = $('<ul class="multiple_emails-ul" />'); // create html elements - list of email addresses as unordered list
		
		var value = this.element.val();

		if (value) {
			if (this.isJsonString(value)) {
				var elems = jQuery.parseJSON(value);
				
				for (var i = 0; i < elems.size(); i++) {
					var addr = elems[i];
					if (addr) this.addAddr(addr);
				}
			} else {
				var elems = explode(' ', value);
				
				for (var i = 0; i < count(elems); i++) {
					var addr = elems[i];
					if (addr) this.addAddr(addr);
				}
			}
			
		}
		
		
		this.options.inputLengthTest = $('<span class="length_test"></span>');
		this.options.inputLengthTest.css({'position': 'absolute', 'right': 0, 'top': 0, 'visibility': 'hidden'});
		
		this.options.input = $('<input type="text" class="multiple_emails-input text-left" />');
		this.options.input.bind('keyup keypress', $.proxy(this.inputKeyUp, this));
		this.options.input.bind('keydown', $.proxy(this.inputKeyDown, this));
		this.options.input.bind('blur', $.proxy(this.inputBlur, this));
		//this.options.input.css({'min-width': '20px', 'background-color': '#e0e0e0'});
		this.options.input.css({'min-width': '20px'});
		
		var container = $('<div class="multiple_emails-container" />'); // container div
		container.bind('click', $.proxy(this.containerClicked, this));
		var inputLi = $('<li class="inp"></li>');
		inputLi.append(this.options.input);
		this.options.ul.append(inputLi);
		container.append(this.options.ul);
		container.insertBefore(this.element);
		
		container.append(this.options.inputLengthTest);
		
		this.element.hide();
		
		var containerWidth = container.width();
		this.options.input.css('max-width', (containerWidth-1)+'px');
		
		this.checkInpWidth();
	},
	setVal: function(emails) {
		// On supprimer tous les elements.
		var lis = $('li:not(.inp)', this.options.ul);
		lis.remove();
		
		if (emails) {
			for (var i = 0; i < count(emails); i++) {
				var addr = emails[i];
				this.addAddr(addr);
			}
		}
		
		this.refreshEmails();
	},
	checkInpWidth: function() {
		this.options.inputLengthTest.html(this.options.input.val());
		var width = this.options.inputLengthTest.width() + 30;
		
		this.options.input.css('width', width+'px');
	},
	containerClicked: function() {
		this.options.input.addClass('force_visible');
		this.options.input.focus();
		this.options.input.removeClass('force_visible');
	},
	addAddr: function(addr) {
		var newLi = $('<li class="multiple_emails-email"><span class="email_name" data-email="' + addr.toLowerCase() + '">' + addr + '</span></li>');
		var deleteIcon = $(this.options.deleteIconHTML);
		deleteIcon.bind('click', $.proxy(this.removeClicked, this));
		
		newLi.prepend(deleteIcon);
		
		var inputLi = $('li.inp', this.options.ul);
		if (inputLi.size() == 1) {
			newLi.insertBefore(inputLi);
		} else {
			this.options.ul.append(newLi);
		}
		
		this.element.trigger('email_added', addr);
	},
	removeClicked: function(event) {
		var target = $(event.currentTarget);
		var li = target.parent();
		
		var email = $('.email_name', li).attr('data-email');
		
		li.remove();
		
		this.refreshEmails();
		
		//event.preventDefault();
		
		this.element.trigger('email_removed', email);
	},
	inputBlur: function() {
		if (this.options.input.val != '') {
			this.displayEmail(this.options.checkDupEmail);
		}
	},
	inputKeyDown: function(e) {
		var keynum;
		if(window.event){ // IE					
			keynum = e.keyCode;
		}
		else if(e.which){ // Netscape/Firefox/Opera					
			keynum = e.which;
        }
		
		if (keynum == 9 || keynum == 38 || keynum == 40) {
			var ulProposal = $('.multiple_email_auto_complete');
			if (ulProposal.size() > 0) e.preventDefault();
		}
	},
	moveProposalUp: function() {
		var ulProposal = $('.multiple_email_auto_complete');
		var liSelected = $(' > li.selected', ulProposal);
		
		if (liSelected.size() != 1) {
			$(' > li.selected', ulProposal).removeClass('selected');
			$(' > li:first-child', ulProposal).addClass('selected');
		} else {
			var prev = liSelected.prev();
			if ((!prev) || prev.size() == 0) {
				// On va cherche le dernier.
				var last = $(' > li:last-child', ulProposal);
				if (last && last.size() == 1) {
					if (last.hasClass('more')) {
						last = last.prev();
					}
				}
				prev = last;
			}
			
			$(' > li.selected', ulProposal).removeClass('selected');
			prev.addClass('selected');
		}
	},
	moveProposalDown: function() {
		var ulProposal = $('.multiple_email_auto_complete');
		var liSelected = $(' > li.selected', ulProposal);
		
		if (liSelected.size() != 1) {
			$(' > li.selected', ulProposal).removeClass('selected');
			$(' > li:first-child', ulProposal).addClass('selected');
		} else {
			var next = liSelected.next();
			if ((!next) || next.size() == 0 || (next && next.size() == 1 && next.hasClass('more'))) {
				// On va cherche le dernier.
				var first = $(' > li:first-child', ulProposal);
				next = first;
			}
			
			$(' > li.selected', ulProposal).removeClass('selected');
			next.addClass('selected');
		}
	},
	inputKeyUp: function(e) {
		this.checkInpWidth();
		
		this.options.input.removeClass('multiple_emails-error');
		var input_length = this.options.input.val().length;
		
		var keynum;
		if(window.event){ // IE					
			keynum = e.keyCode;
		}
		else if(e.which){ // Netscape/Firefox/Opera					
			keynum = e.which;
        }
		
		if (keynum == 38) { // haut
			this.moveProposalUp();
			return false;
		} else if (keynum == 40) { // bas
			this.moveProposalDown();
			return false;
		}
		
		if (keynum == 8 && input_length == 0 && this.options.input.attr('empty')) {
			this.clearAjaxTimeout();
			
			var inpLi = this.options.input.parent();
			var prev = inpLi.prev();
			
			if (prev) {
				var email = $('.email_name', prev).html();
				prev.remove();
				this.refreshEmails();
				this.options.input.val(email);
				this.checkInpWidth();
				
				this.element.trigger('email_removed', email);
			}
			this.hideProposal();
			return false;
		}
		
		if (input_length == 0) {
			this.options.input.attr('empty', '1');
		} else {
			this.options.input.removeAttr('empty', '1');
		}
		
		//if(event.which == 8 && input_length == 0) { $list.find('li').last().remove(); } //Removes last item on backspace with no input
		
		// Supported key press is tab, enter, space or comma, there is no support for semi-colon since the keyCode differs in various browsers
		if(keynum == 9 || keynum == 32 || keynum == 188) {
			this.clearAjaxTimeout();
			this.displayEmail(this.options.checkDupEmail, (keynum == 9 ? true : false));
			this.hideProposal();
			this.checkInpWidth();
			return false;
		} else if (keynum == 13) {
			this.clearAjaxTimeout();
			this.displayEmail(this.options.checkDupEmail, true);
			this.hideProposal();
			//Prevents enter key default
			//This is to prevent the form from submitting with  the submit button
			//when you press enter in the email textbox
			e.preventDefault();
		} else {
			this.ajaxCheck();
		}
		
		this.checkInpWidth();
	},
	clearAjaxTimeout: function() {
		if (!this.options.ajax_url) return; 
		
		if (this.options.ajaxTimeout) clearTimeout(this.options.ajaxTimeout);
		this.options.ajaxTimeout = null;
	},
	ajaxCheck: function() {
		if (!this.options.ajax_url) return;
		
		var val = this.options.input.val();
    	if (strlen(trim(val)) < 3) {
    		this.options.lastSearchAjax = val;
    		this.hideProposal();
    		if (this.options.ajaxTimeout) clearTimeout(this.options.ajaxTimeout);
    		this.options.ajaxTimeout = null;
    		return;
    	}
		
		//if (this.options.ajaxTimeout) clearTimeout(this.options.ajaxTimeout);
		if (!this.options.ajaxTimeout) this.options.ajaxTimeout = setTimeout($.proxy(this.ajaxRequest, this), 500);
	},
	ajaxRequest: function() {
		this.options.ajaxTimeout = null;
		if (!this.options.ajax_url) return;
		
		// OK, on lance la recherche.
		var val = this.options.input.val();
    	if (val != this.options.lastSearchAjax) {
    		this.options.lastSearchAjax = val;
    		
    		if (this.options.ajaxResquest) {
    			try {
    				this.options.ajaxResquest.abort();
    			} catch (ex) {
    				console.log('EXCEPTION STOPING AJAX REQUEST');
    			}
    		}
    		
    		if (strlen(trim(val)) < 3) {
    			this.hideProposal();
    			//console.log('AUTOCOMPLETE.. []');
    	    	return;
    		}
    		
    		var datas = { 'txt': val };
    		this.options.ajaxResquest = $.ajax({type: 'POST', url: this.options.ajax_url, data: datas, success: $.proxy(this.ajaxReponse, this)});
    	}
	},
	ajaxReponse: function(reponse) {
		var elems = $.parseJSON(reponse);
		var emails = elems['emails'];
		var has_more = elems['has_more'];
		
		this.proposeEmails(emails, has_more);
		
		//console.log('AUTOCOMPLETE ['+reponse+']');
	},
	hideProposal: function() {
		$('.multiple_email_auto_complete').remove();
	},
	proposeEmails: function(emails, has_more) {
		this.hideProposal();
		if (count(emails) == 0) return;
		
		var ul = $('<ul class="multiple_email_auto_complete"></ul>');
		for (var addr in emails) {
			var nom = emails[addr];
			if (strtolower(nom) == 'null') nom = null;
			
			var li = $('<li addr="'+addr+'"></li>');
			if (nom) {
				li.attr('nom', nom);
				li.html(nom+' ('+addr+')');
			} else {
				li.html(addr);
			}
			
			ul.append(li);
		}
		
		$(' > li:first-child', ul).addClass('selected');
		$(' > li', ul).bind('click', $.proxy(this.proposalClicked, this));
		
		if (has_more) {
			ul.append($('<li class="more">...</li>'));
		}
		
		// On affiche le ul.
		var position = this.options.input.position();
		ul.css({'display': 'block', 'position': 'absolute', 'top': (intval(position.top)+20)+'px', 'left': position.left+'px', 'z-index': 5000});
		
		var container = this.options.input.closest('.multiple_emails-container');
		ul.appendTo(container);
	},
	proposalClicked: function(event) {
		var target = $(event.currentTarget);
		$('.multiple_email_auto_complete li.selected').removeClass('selected');
		
		target.addClass('selected');
		
		this.displayEmail(this.options.checkDupEmail, true);
	},
	displayEmail: function(dupEmailCheck, takeProposal) {
		//Remove space, comma and semi-colon from beginning and end of string
		//Does not remove inside the string as the email will need to be tokenized using space, comma and semi-colon
		
		//arr = null;
		if (takeProposal) {
			var liProposal = $('.multiple_email_auto_complete li.selected');
			if (liProposal.size() == 1) {
				var addr = liProposal.attr('addr');
				if (addr) {
					this.options.input.val(addr);
					this.hideProposal();
					this.options.input.focus();
					this.options.input.removeClass('multiple_emails-error');
				}
			}
		}
		
		
		arr = this.options.input.val().trim().replace(/^,|,$/g , '').replace(/^;|;$/g , '');
		//Remove the double quote
		arr = arr.replace(/"/g,"");
		//Split the string into an array, with the space, comma, and semi-colon as the separator
		arr = arr.split(/[\s,;]+/);
		
		var errorEmails = new Array(); //New array to contain the errors
		
		var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
		
		for	(var i = 0; i < arr.length; i++) {
			//Check if the email is already added, only if dupEmailCheck is set to true
			if ( dupEmailCheck === true && this.element.val().indexOf(arr[i]) != -1 ) {
		        if (arr[i] && arr[i].length > 0) {
		        	var existingElement = this.options.ul.find('.email_name[data-email=' + arr[i].toLowerCase().replace('.', '\\.').replace('@', '\\@') + ']');
					existingElement.addClass('doublon');
				}
		        
		        setTimeout($.proxy(this.undisplayDoublons, this), 1500);
			} else if (pattern.test(arr[i]) == true) {
				this.addAddr(arr[i]);
			} else {
				errorEmails.push(arr[i]);
			}
		}
		// If erroneous emails found, or if duplicate email found
		if(errorEmails.length > 0) {
			this.options.input.val(errorEmails.join("; ")).addClass('multiple_emails-error');
		} else {
			this.options.input.val("");
			this.options.input.attr('empty', '1');
		}
		
		this.checkInpWidth();
		
		this.refreshEmails();
	},
	undisplayDoublons: function() {
		$('.doublon', this.options.ul).removeClass('doublon');
	},
	refreshEmails: function() {
		var emails = new Array();
		
		var lis = $(' > li', this.options.ul);
		for (var i = 0; i < lis.size(); i++) {
			var li = $(lis.get(i));
			var email = $('.email_name', li).html();
			emails.push(email);
		}
		
		this.element.val(JSON.stringify(emails));
		this.element.trigger('change');
		
		this.checkInpWidth();
	},
	isJsonString: function(str) {
		try { JSON.parse(str); }
		catch (e) {	return false; }
		return true;
	},
	options: {
		ajax_url: null,
		checkDupEmail: true,
		theme: "Basic",
		position: "top",
		
		// INTERNE
		ajaxTimeout: null,
		ajaxResquest: null,
		lastSearchAjax: '',
		deleteIconHTML: '',
		ul: null,
		inputLengthTest: null,
		input: null
	}
});




/*
(function( $ ){
 
	$.fn.multiple_emails = function(options) {
		
		// Default options
		var defaults = {
			checkDupEmail: true,
			theme: "Bootstrap",
			position: "top"
		};
		
		// Merge send options with defaults
		var settings = $.extend( {}, defaults, options );
		
		var deleteIconHTML = "";
		if (settings.theme.toLowerCase() == "Bootstrap".toLowerCase())
		{
			deleteIconHTML = '<a href="#" class="multiple_emails-close" title="Remove"><span class="glyphicon glyphicon-remove"></span></a>';
		}
		else if (settings.theme.toLowerCase() == "SemanticUI".toLowerCase() || settings.theme.toLowerCase() == "Semantic-UI".toLowerCase() || settings.theme.toLowerCase() == "Semantic UI".toLowerCase()) {
			deleteIconHTML = '<a href="#" class="multiple_emails-close" title="Remove"><i class="remove icon"></i></a>';
		}
		else if (settings.theme.toLowerCase() == "Basic".toLowerCase()) {
			//Default which you should use if you don't use Bootstrap, SemanticUI, or other CSS frameworks
			deleteIconHTML = '<a href="#" class="multiple_emails-close" title="Remove"><i class="basicdeleteicon">Remove</i></a>';
		}
		
		return this.each(function() {
			//$orig refers to the input HTML node
			var $orig = $(this);
			var $list = $('<ul class="multiple_emails-ul" />'); // create html elements - list of email addresses as unordered list

			if ($(this).val() != '' && IsJsonString($(this).val())) {
				$.each(jQuery.parseJSON($(this).val()), function( index, val ) {
					$list.append($('<li class="multiple_emails-email"><span class="email_name" data-email="' + val.toLowerCase() + '">' + val + '</span></li>')
					  .prepend($(deleteIconHTML)
						   .click(function(e) { $(this).parent().remove(); refresh_emails(); e.preventDefault(); })
					  )
					);
				});
			}
			
			var $input = $('<input type="text" class="multiple_emails-input text-left" />').on('keyup', function(e) { // input
				$(this).removeClass('multiple_emails-error');
				var input_length = $(this).val().length;
				
				var keynum;
				if(window.event){ // IE					
					keynum = e.keyCode;
				}
				else if(e.which){ // Netscape/Firefox/Opera					
					keynum = e.which;
                }
				
				//if(event.which == 8 && input_length == 0) { $list.find('li').last().remove(); } //Removes last item on backspace with no input
				
				// Supported key press is tab, enter, space or comma, there is no support for semi-colon since the keyCode differs in various browsers
				if(keynum == 9 || keynum == 32 || keynum == 188) { 
					display_email($(this), settings.checkDupEmail);
				}
				else if (keynum == 13) {
					display_email($(this), settings.checkDupEmail);
					//Prevents enter key default
					//This is to prevent the form from submitting with  the submit button
					//when you press enter in the email textbox
					e.preventDefault();
				}

			}).on('blur', function(event){ 
				if ($(this).val() != '') { display_email($(this), settings.checkDupEmail); }
			});

			var $container = $('<div class="multiple_emails-container" />').click(function() { $input.focus(); } ); // container div
 
			// insert elements into DOM
			if (settings.position.toLowerCase() === "top")
				$container.append($list).append($input).insertAfter($(this));
			else
				$container.append($input).append($list).insertBefore($(this));

			function display_email(t, dupEmailCheck) {
				
				//Remove space, comma and semi-colon from beginning and end of string
				//Does not remove inside the string as the email will need to be tokenized using space, comma and semi-colon
				var arr = t.val().trim().replace(/^,|,$/g , '').replace(/^;|;$/g , '');
				//Remove the double quote
				arr = arr.replace(/"/g,"");
				//Split the string into an array, with the space, comma, and semi-colon as the separator
				arr = arr.split(/[\s,;]+/);
				
				var errorEmails = new Array(); //New array to contain the errors
				
				var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
				
				for	(var i = 0; i < arr.length; i++) {
					//Check if the email is already added, only if dupEmailCheck is set to true
					if ( dupEmailCheck === true && $orig.val().indexOf(arr[i]) != -1 ) {
				        if (arr[i] && arr[i].length > 0) {
							new function () {
								var existingElement = $list.find('.email_name[data-email=' + arr[i].toLowerCase().replace('.', '\\.').replace('@', '\\@') + ']');
								existingElement.css('font-weight', 'bold');
								setTimeout(function() { existingElement.css('font-weight', ''); }, 1500);
							}(); // Use a IIFE function to create a new scope so existingElement won't be overriden
						}
					}
					else if (pattern.test(arr[i]) == true) {
						$list.append($('<li class="multiple_emails-email"><span class="email_name" data-email="' + arr[i].toLowerCase() + '">' + arr[i] + '</span></li>')
							  .prepend($(deleteIconHTML)
								   .click(function(e) { $(this).parent().remove(); refresh_emails(); e.preventDefault(); })
							  )
						);
					}
					else
						errorEmails.push(arr[i]);
				}
				// If erroneous emails found, or if duplicate email found
				if(errorEmails.length > 0)
					t.val(errorEmails.join("; ")).addClass('multiple_emails-error');
				else
					t.val("");
				refresh_emails ();
			}
			
			function refresh_emails () {
				var emails = new Array();
				var container = $orig.siblings('.multiple_emails-container');
				container.find('.multiple_emails-email span.email_name').each(function() { emails.push($(this).html()); });
				$orig.val(JSON.stringify(emails)).trigger('change');
			}
			
			function IsJsonString(str) {
				try { JSON.parse(str); }
				catch (e) {	return false; }
				return true;
			}
			
			return $(this).hide();
 
		});
		
	};
	
})(jQuery);*/