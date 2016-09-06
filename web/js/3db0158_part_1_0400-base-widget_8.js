// We use a stack.
var currentWidgetActiveStack = new Array();

function unActiveCurrentWidget(event) {
	var target = $(event.target);
	if (target && target.size() == 1) {

		if (!inDom(target)) {
			// TODO : peut-etre un plus complexe que cela.
			return null;
		}

		var closest = null;
		if (target.hasClass('ser_widget_container'))
			closest = target;
		else
			closest = target.closest('.ser_widget_container');
		if (closest.size() == 1) {
			widgObj = closest.data('ser_widget_object');
			if (widgObj) {
				setCurrentWidgetActive(widgObj.element);
				return;
			}
		}
	}

	setCurrentWidgetActive(null);
}

function getWidgetObjFromElement(elem) {
	if (!elem)
		return null;
	var widgetClass = elem.attr('widget');
	if (widgetClass) {
		var widgetObj = elem.data(widgetClass);
		if (widgetObj)
			return widgetObj;
	}

	return null;
}

function setCurrentWidgetActive(widget) {
	// On dépile jusqu'à ce que l'on trouve notre élément.
	var widgetObj = widget ? getWidgetObjFromElement(widget) : null;

	// Do we have a parent ?
	var widgetObjParent = widgetObj ? widgetObj.getParentWidget() : null;
	var widgetParent = widgetObjParent ? widgetObjParent.element : null;

	if (widgetObjParent) {
		//console.log('WIDGETS : we DO have a parent there');
	}

	// This is more complecated, we have to check our parent is not in there ?
	for (var i = count(currentWidgetActiveStack) - 1; i >= 0; i--) {
		// Let's see what index we hava.
		var widg = currentWidgetActiveStack[i];
		if (widget && widg.get(0) == widget.get(0)) {
			// On est déjà ouvert ... bizarre.
			return;
		}

		if (widgetParent && widg.get(0) == widgetParent.get(0)) {
			// On a trouvé notre parent
			//console.log('WIDGETS : parent found in stack at index ' + i);
			break;
		}

		// Si l'on arrive ici, on peut supprimer l'élément de la pile.
		widg = currentWidgetActiveStack.pop();
		var widgObj = getWidgetObjFromElement(widg);
		if (widgObj.element.hasClass('full_open'))
			continue;
		if (widgObj)
			widgObj.close.call(widgObj, true);
	}

	if (widget) {
		widget.addClass('active');
		currentWidgetActiveStack.push(widget);
	}

	// console.log('stack size : '+count(currentWidgetActiveStack));

	// logStack();
}

function logStack() {
	for (var i = 0; i <= count(currentWidgetActiveStack) - 1; i++) {
		// Let's see what index we hava.
		var widg = currentWidgetActiveStack[i];
		console.log(i + ' : ' + widg);
	}
}

function registerUnactiveWidget(widget) {
	var widgetObj = getWidgetObjFromElement(widget);
	// Notre widget est-il dans la pile ?

	toRemove = [];
	for (var i = count(currentWidgetActiveStack) - 1; i >= 0; i--) {
		var widg = currentWidgetActiveStack.pop();
		toRemove.push(widg);
		if (widg.get(0) == widget.get(0)) {
			// On l'a trouve ...
			break;
		}
	}

	for (var i = count(toRemove) - 1; i >= 0; i--) {
		var widg = toRemove[i];
		var widgObj = getWidgetObjFromElement(widg);
		if (widgObj)
			widgObj.close.call(widgObj, true);
	}
}

/*
 * function unActiveCurrentWidget() { if (currentWidgetActive) { try {
 * currentWidgetActive.removeClass('active');
 * 
 * widgetObj = getWidgetObjFromElement(currentWidgetActive) if (widgetObj)
 * widgetObj.close.call(widgetObj); } catch (ex) {
 * console.log("unActiveCurrentWidget() : ERROR"); } } currentWidgetActive =
 * null; }
 */

$.widget('seriel.ser_widget',
				{
					_create : function() {
						if (this.element.attr('full_open')) {
							// alert('FULL OPEN !!!');
							this.options.full_open = true;
							this.element.addClass('full_open');
						}

						if (this.element.is('input')) {
							this.options.inputName = this.element.attr('name');
							// We have to build all the elements manually.
							this.options.widget = $('<span class="widget is_inp_widget"></span>');

							if (this.element.attr('resume_pos'))
								this.options.widget.attr('resume_pos',
										this.element.attr('resume_pos'));
							if (this.element.attr('resume_name'))
								this.options.widget.attr('resume_name',
										this.element.attr('resume_name'));

							this.options.button = $('<span class="button"></span>');
							this.options.button.appendTo(this.options.widget);
							var val = this.element.val();
							this.setVal(val);
							this.refreshButton();
							this.options.content = $('<span class="content"></span>');
						} else {
							var name = this.element.attr('name');
							if (name) this.options.inputName = name;
							this.options.widget = this.element;
							this.options.button = $('> .button', this.element);
							this.options.content = $('> .content', this.element);

							this.options.resume_block = $(' > .resume', this.element);
							//alert(this.options.inputName+' > '+this.options.resume_block.size());
							if (this.options.resume_block.size() == 1) this.options.has_resume = true;
						}

						this.options.widget.addClass('widget_initialized');
						this.options.widget.data('ser_widget_object', this);

						if (this.options.full_open == false)
							this.options.button.bind('click', $.proxy(
									this.buttonClicked, this));

						this.options.container = $('<div class="ser_widget_container"></div>');
						this.options.container.data('ser_widget_object', this);
						this.options.container.bind('click', $.proxy(
								this.containerClicked, this));

						if (this.options.prefered_width
								&& this.options.prefered_width > 0)
							this.options.container.css('min-width',
									prefered_width);
						if (this.options.prefered_height
								&& this.options.prefered_height > 0)
							this.options.container.css('min-height',
									prefered_height);

						this.options.content.appendTo(this.options.container);
						this.options.content.css('display', 'block');

						if (this.element.is('input'))
							this.element.replaceWith(this.options.widget);

						if (this.options.has_resume) {
							$('input[type=text][resume_name]', this.options.content).bind('click.serwidg mousedown.serwidg mouseup.serwidg keydown.serwidg keyup.serwidg keypress.serwidg change.serwidg', $.proxy(this.inputTextChanged, this));
							$('input[type=radio][resume_name]',
									this.options.content).bind(
									'change.serwidg',
									$.proxy(this.inputRadioChanged, this));
							$('input[type=checkbox][resume_name]',
									this.options.content).bind(
									'change.serwidg',
									$.proxy(this.inputCheckboxChanged, this));
							$('.ser_date_widget[resume_name]',
									this.options.content).bind(
									'change.serwidg',
									$.proxy(this.dateWidgetChanged, this));
							$('.ser_multichoice_widget[resume_name]',
									this.options.content)
									.bind(
											'change.serwidg',
											$
													.proxy(
															this.multiChoiceWidgetChanged,
															this));
						}
						$('input[type=text]', this.options.content).bind(
								'keyup.serwidgsubmit',
								$.proxy(this.inputTextKeyUp, this));

						this.element.attr('widget', this.getWidgetClassName());

						this.checkIfEmptyButton();

						if (this.options.full_open) {
							this.options.container
									.insertAfter(this.options.button);
						}
					},
					isWidget : function() {
						return true;
					},
					getWidgetClassName : function() {
						var data = this.element.data();
						for ( var key in data) {
							var obj = data[key];
							try {
								var res = obj.isWidget();
								if (res == true)
									return key;
							} catch (ex) {

							}
						}

						return null;
					},
					getParentWidget : function() {
						// Is the widget inside a widget ?
						var parentContainer = this.element
								.closest('.ser_widget_container');
						if (parentContainer.size() == 1) {
							return parentContainer.data('ser_widget_object');
						}

						return null;
					},
					checkIfEmptyButton : function() {
						var buttonVal = trim(this.options.button.html());
						if (buttonVal == '')
							this.options.button.html('&nbsp;');
					},
					displayButtonVal : function(val) {
						// To be inplemented.
					},
					dateWidgetChanged : function(event, val) {
						var widget = $(event.currentTarget);

						var name = widget.attr('resume_name');
						if (!name)
							return;

						var pos = (widget.attr('resume_pos') ? widget
								.attr('resume_pos') : url_encode(resume_name));

						// 04012015 - modification JN pour affichage direct de
						// la valeur
						var disp_directly = widget.attr('resume_direct');
						if (disp_directly != false) {
							if (disp_directly == "1") {
								this.setResume(pos, name, val);
								return;
							}
						}

						if (trim(val) == "" || (!val)) {
							this.removeResume(pos);
						} else {
							// On test d'abord la valeur speciale.
							// if (val != null && strlen(val) > 2 && substr(val,
							// 0, 1) == '{' && substr(val, strlen(val) - 1) ==
							// '}') {
							if (widget.ser_dateWidget('isSpecialValue')) {
								/*
								 * var spe_val = substr(val, 1, strlen(val) -
								 * 2);
								 */
								this.setResume(pos, name, widget
										.ser_dateWidget('getTitle'));
								return;
							}

							// Let's work the val. // Only with a single day for
							// the moment.
							var splitted = explode('-', val);
							if (count(splitted) == 3) {
								var day = splitted[2] + '.' + splitted[1] + '.'
										+ splitted[0];
								this.setResume(pos, name, day);
							} else if (count(splitted) == 2) {
								// Il s'agit d'un mois.
								var month = strtolower(monthNames[intval(splitted[1]) - 1]
										+ ' ' + splitted[0]);
								this.setResume(pos, name, month);
							} else {
								// Il s'agit peut-être d'une semaine.
								var splitted = explode('+', val);
								if (count(splitted) == 2) {
									var week = 'sem. ' + splitted[1] + '.'
											+ splitted[0];
									this.setResume(pos, name, week);
								} else {
									// Il s'agit donc d'une année.
									var year = 'ann&eacute;e ' + val;
									this.setResume(pos, name, year);
								}
							}
						}
					},
					multiChoiceWidgetChanged : function(event, helper) {
						var widget = $(event.currentTarget);

						if (!helper) {
							helper = widget.multiChoiceWidget('getHelper');
						}

						var val = helper.value;
						var hash = helper.hashValue;

						var name = widget.attr('resume_name');
						if (!name)
							return;

						var pos = (widget.attr('resume_pos') ? widget
								.attr('resume_pos') : url_encode(resume_name));

						if (trim(val) == "" || (!val)) {
							this.removeResume(pos);
							return;
						}

						var resume = "";
						for ( var key in hash) {
							var choice = hash[key];

							if (resume != "")
								resume += ", ";
							resume += choice;
						}

						this.setResume(pos, name, resume);
					},
					inputTextKeyUp : function(event) {
						if (event.which === 13) {
							// console.log('widget submit');
							this.element.trigger('submit');
						}
					},
					inputTextChanged : function(event) {
						var inp = $(event.currentTarget);
						var val = inp.val();
						if (inp.attr('readonly')) {
							val = '';
						}

						var name = inp.attr('resume_name');
						if (!name)
							return;

						var pos = (inp.attr('resume_pos') ? inp
								.attr('resume_pos') : url_encode(resume_name));

						if (trim(val) == "" || (!val)) {
							this.removeResume(pos);
						} else {
							this.setResume(pos, name, val);
						}
					},
					inputRadioChanged : function(event) {
						var inp = $(event.currentTarget);
						var val = inp.val();
						if (inp.prop('checked') == false)
							val = '';

						var name = inp.attr('resume_name');
						if (!name)
							return;

						if (inp.attr('resume_value') && inp.prop('checked'))
							val = inp.attr('resume_value');

						var pos = (inp.attr('resume_pos') ? inp
								.attr('resume_pos') : url_encode(resume_name));

						if (trim(val) == "" || (!val)) {
							this.removeResume(pos);
						} else {
							this.setResume(pos, name, val);
						}
					},
					inputCheckboxChanged : function(event) {
						var inp = $(event.currentTarget);
						var val = inp.prop('checked');

						var name = inp.attr('resume_name');
						if (!name)
							return;

						if (name == '__label__') {
							// Let's find the label.
							var id = inp.attr('id');

							label = $('label[for="' + id + '"]',
									this.options.content);
							if (label.size() == 1) {
								name = label.html();
							} else {
								name = inp.attr('name');
							}
						}

						var pos = (inp.attr('resume_pos') ? inp
								.attr('resume_pos') : url_encode(resume_name));

						//console.log('VAL : ' + val);

						if (trim(val) == "" || (!val)) {
							this.removeResume(pos);
						} else {
							this.setResume(pos, name, null, 'check');
						}
					},
					setResume : function(pos, name, value, extra_class) {
						// Let's get it.
						var res = $('span.res[res_pos=' + pos + ']',
								this.options.resume_block);

						if (res.size() == 1) {
							$('label', res).html(name);
							if (value) {
								var val_container = $('.res_val', res);
								if (val_container.size() == 0) {
									$(
											'<span class="res_val">' + value
													+ '</span>').appendTo(res);
								} else {
									$('.res_val', res).html(value);
								}
							}

							if (extra_class)
								res.attr('class', 'res ' + extra_class);
							else
								res.attr('class', 'res');

							return;
						}

						var res = $('<span class="res" res_pos="' + pos
								+ '"><label>' + name + '</label></span>');

						if (value) {
							// $('label', res).append(':');
							$('<span class="res_val">' + value + '</span>')
									.appendTo(res);
						}
						if (extra_class) {
							res.addClass(extra_class);
						}

						// We need to insert it at the right place.
						var elems = $('span.res', this.options.resume_block);
						if (elems.size() == 0) {
							res.appendTo(this.options.resume_block);
							return;
						}

						for (var i = 0; i < elems.size(); i++) {
							var elem = $(elems.get(i));
							var elem_pos = elem.attr('res_pos');
							if (intval(elem_pos) > intval(pos)) {
								res.insertBefore(elem);
								return;
							}
						}

						res.appendTo(this.options.resume_block);
					},
					removeResume : function(pos) {
						$('span.res[res_pos=' + pos + ']',
								this.options.resume_block).remove();
					},
					containerClicked : function(event) {
						// event.stopPropagation();
					},
					isDisabled : function() {
						if (this.element.hasClass('disabled')
								| this.options.button.hasClass('disabled'))
							return true;
						return false;
					},
					setDisable : function(disable) {
						if (disable) {
							this.element.addClass('disabled');
						} else {
							this.element.removeClass('disabled');
						}
					},
					buttonClicked : function(event) {
						if (this.isDisabled()) {
							this.close();
							return true;
						}

						if (this.isOpened())
							this.close();
						else
							this.open();

						event.stopPropagation();

						return false;
					},
					open : function() {
						this.element.trigger('before_open');

						// Let's find the good position.
						var button_offset = this.options.button.offset();

						var top = 0;
						var left = 0;

						if (this.options.prefered_pos == 'bottom') {
							top = button_offset.top
									+ this.options.button.height()
									+ intval(this.options.button
											.css('padding-bottom'))
									+ intval(this.options.button
											.css('padding-bottom')) + 5;
							left = button_offset.left;
						} else {
							top = button_offset.top - 2;
							left = button_offset.left
									+ this.options.button.width()
									+ intval(this.options.button
											.css('padding-left'))
									+ intval(this.options.button
											.css('padding-right')) + 5;

							// console.log('offset_left : '+button_offset.left+'
							// / width :
							// '+this.options.button.width());
						}

						this.options.container.css({
							'top' : top,
							'left' : left
						});
						this.options.container.appendTo($('body'));

						$('.def_focus:not([readonly])', this.options.content)
								.focus().select();

						this.checkHeight();
						this.checkPos();

						setCurrentWidgetActive(this.element);

						this.element.trigger('after_open');
					},
					blockNextClose : function() {
						this.options.block_next_close = true;
					},
					close : function(skip_control) {
						if (this.options.full_open) return;
						if (this.options.block_next_close) {
							this.options.block_next_close = false;
							return;
						}

						if (!this.isOpened())
							return;
						this.element.trigger('before_close');

						this.options.container.detach();
						this.element.removeClass('active');

						if (!skip_control)
							registerUnactiveWidget(this.element);
						/*
						 * if (currentWidgetActive && currentWidgetActive.get(0) ==
						 * this.element) { unActiveCurrentWidget(); }
						 */

						this.element.trigger('after_close');
					},
					isOpened : function() {
						return inDom(this.options.container);
					},
					getName : function() {
						var name = this.options.widget.attr('name');
						if (name)
							return name;
						return null;
					},
					setVal : function() {
						// a étendre
					},
					getVal : function(get_empty) {
						// Default action is to look for all inputs inside the
						// container.
						// It can be overwritten.
						var res = {};

						var inputs = $('input', this.options.container);
						for (var i = 0; i < inputs.size(); i++) {
							var inp = $(inputs.get(i));

							// Attention, on exclue les inputs qui sont
							// directement dans un
							// widget.
							// Pour ces derniers, on appele la méthode getVal du
							// widget.
							if (inp.parent().hasClass('widget'))
								continue;

							// On exclue egalement to ce qui est en readonly.
							if (inp.attr('readonly'))
								continue;

							var name = inp.attr('name');
							var value = inp.val();

							if (strtolower(inp.attr('type')) == 'checkbox') {
								var checked = inp.prop('checked');
								if (checked)
									res[name] = 'oui';

								continue;
							}

							if (strtolower(inp.attr('type')) == 'radio') {
								var checked = inp.prop('checked');
								if (checked)
									res[name] = value;

								continue;
							}

							res[name] = value;
						}

						var widgets = $('.widget', this.options.container);
						
						for (var i = 0; i < widgets.size(); i++) {
							var widget = $(widgets.get(i));
							if (widget.data('ser_widget_object')) {
								var obj = widget.data('ser_widget_object');

								var values = obj.getVal();
								/*if (values === null) {
									if (get_empty) res[name] = '';
								}*/
								if (is_string(values)) {
									var name = obj.getName();
									if (name && values) {
										res[name] = values;
									} else if (name && (!values) && get_empty) {
										res[name] = '';
									}

								} else {
									res = array_merge(res, values);
								}
							}
						}

						return res;
					},
					dealWithParam : function(param) {
						// Default action is to look for all inputs inside the
						// container.
						// It can be overwritten.

						var inputs = $('input', this.options.container);
						for (var i = 0; i < inputs.size(); i++) {
							var inp = $(inputs.get(i));

							// Attention, on exclue les inputs qui sont
							// directement dans un
							// widget.
							// Pour ces derniers, on appele la méthode getVal du
							// widget.
							if (inp.parent().hasClass('widget'))
								continue;

							var name = inp.attr('name');

							if (name == param)
								return true;
						}

						var widgets = $('.widget', this.options.container);

						for (var i = 0; i < widgets.size(); i++) {
							var widget = $(widgets.get(i));
							if (widget.data('ser_widget_object')) {
								var obj = widget.data('ser_widget_object');

								// TODO
								/*
								 * var values = obj.getVal(); if
								 * (is_string(values)) { var name =
								 * obj.getName(); if (name && values) {
								 * res[name] = values; }
								 *  } else { res = array_merge(res, values); }
								 */
							}
						}

						return false;
					},
					setParamVal : function(param, val) {
						if (this.getName() == param) {
							this.setVal(val);
							return true;
						}

						// On renvoie true si on a trouve le param. false sinon.
						var inputs = $('input', this.options.container);

						// On commence par trier les radios inputs.
						var radios = inputs.filter('[type=radio]');
						var radiosByName = {};
						if (radios && radios.size() > 0) {
							for (var i = 0; i < radios.size(); i++) {
								var radio = $(radios.get(i));
								var name = radio.attr('name');
								if (!radiosByName[name])
									radiosByName[name] = [];
								radiosByName[name].push(radio);
							}
						}

						if (radiosByName && radiosByName[param]) {
							var the_one = null;
							for (var i = 0; i < count(radiosByName[param]); i++) {
								var radio = radiosByName[param][i];
								if (radio.attr('value') == val) {
									the_one = radio;
								} else {
									radio.prop('checked', false);
								}
							}
							if (the_one) {
								the_one.prop('checked', true);
								the_one.trigger('change');
							}
							return true;
						}

						for (var i = 0; i < inputs.size(); i++) {
							var inp = $(inputs.get(i));

							// Attention, on exclue les inputs qui sont
							// directement dans un
							// widget.
							// Pour ces derniers, on appele la méthode getVal du
							// widget.
							if (inp.parent().hasClass('widget'))
								continue;

							if (inp.attr('type') == 'checkbox') {
								var name = inp.attr('name');

								if (name == param) {
									if (inp.attr('readonly')) {
										return true;
									}
									inp.prop('checked', 'checked');
									inp.trigger('change');
									return true;
								}
							}

							if (inp.attr('type') == 'radio') {
								// Deja traite.
								continue;
								/*
								 * var name = inp.attr('name'); var value =
								 * inp.attr('value');
								 * 
								 * if (name == param && value != val) { if
								 * (inp.prop('checked')) {
								 * inp.removeProp('checked');
								 * inp.trigger('change'); } } else if (name ==
								 * param && value == val) { inp.prop('checked',
								 * 'checked'); inp.trigger('change'); return
								 * true; }
								 */
							}

							var name = inp.attr('name');

							if (name == param) {
								if (inp.attr('readonly')) {
									return true;
								}
								inp.val(val);
								inp.trigger('change');
								return true;
							}
						}

						var widgets = $('.widget', this.options.container);

						for (var i = 0; i < widgets.size(); i++) {
							var widget = $(widgets.get(i));
							if (widget.data('ser_widget_object')) {
								var obj = widget.data('ser_widget_object');
								var res = obj.setParamVal(param, val);
								if (res == true)
									return true;
							}
						}

						return false;
					},
					emptyOtherParams : function(params) {
						if (this.getName()) {
							if (!in_array(this.getName(), params)) {
								// console.log('Emptying : '+this.getName());
								// Si une methode empty existe, on l'utilise.
								if (this.empty)
									this.empty();
								else
									this.setVal('');
								return;
							}
						}

						var inputs = $('input', this.options.container);
						for (var i = 0; i < inputs.size(); i++) {
							var inp = $(inputs.get(i));

							// Attention, on exclue les inputs qui sont
							// directement dans un
							// widget.
							// Pour ces derniers, on appele la méthode getVal du
							// widget.
							if (inp.parent().hasClass('widget'))
								continue;

							if (inp.attr('type') == 'radio'
									|| inp.attr('type') == 'checkbox') {
								var name = inp.attr('name');
								if (!in_array(name, params)) {
									inp.prop('checked', false);
									inp.trigger('change');
								}
								continue;
							}

							var name = inp.attr('name');

							if (!in_array(name, params)) {
								if (!inp.attr('readonly')) {
									inp.val('');
									inp.trigger('change');
								}
							}
						}

						var widgets = $('.widget', this.options.container);

						for (var i = 0; i < widgets.size(); i++) {
							var widget = $(widgets.get(i));
							if (widget.data('ser_widget_object')) {
								var obj = widget.data('ser_widget_object');
								obj.emptyOtherParams(params);
							}
						}
					},
					refreshButton : function() {
						// a étendre
					},
					whoAmI : function() {
						return 'ser_widget';
					},
					getHeader : function() {
						var head = $('.ser_widget_head', this.options.container);
						if (head.size() == 1)
							return head;
						return null;
					},
					useHeader : function(useheader) {
						if (useheader) {
							// Do we already have one.
							var head = this.getHeader();
							if (!head) {
								head = $('<div class="ser_widget_head"><div class="head_content"></div><span class="close"></span></div>');
								$(' > .close', head).bind('click',
										$.proxy(this.close, this));
								this.options.container.prepend(head);
							}
							this.options.useHeader = true;
							this.checkHeight();
							this.checkPos();
						} else {
							this.options.content.css('max-height', 'none');
							this.options.useHeader = false;
						}
					},
					checkHeight : function() {
						if (this.options.useHeader) {
							var head = this.getHeader();
							if (head) {
								var headHeight = head.height();
								var containerMaxHeight = intval(this.options.container
										.css('max-height'));
								if (containerMaxHeight > headHeight) {
									var contentMaxHeight = containerMaxHeight
											- headHeight;
									this.options.content.css('max-height', contentMaxHeight + 'px');
									return;
								}
							}
						}

						this.options.content.css('max-height', 'none');
					},
					checkPos : function() {
						var offset = this.options.container.offset();
						var left = offset.left;
						var top = offset.top;

						var right = left + this.options.container.width();
						var bottom = top + this.options.container.height();

						var screen_width = $(document).width();
						var screen_height = $(document).height();

						if (right > screen_width - 10) {
							var diff = right - screen_width + 10; // 10px de
																	// marge
							var newLeft = left - diff;

							this.options.container.css({
								'left' : newLeft
							});
						}
						if (bottom > screen_height - 10) {
							var diff = bottom - screen_height + 10; // 10px de
																	// marge
							var newTop = top - diff;

							this.options.container.css({
								'top' : newTop
							});
						}
					},
					options : {
						prefered_width : null,
						prefered_height : null,
						prefered_pos : 'right',
						full_open : false,
						// INSIDE
						block_next_close : false,
						widget : null,
						button : null,
						content : null,
						container : null,
						has_resume : false,
						resume_bloc : null,
						inputName : null,
						useHeader : false
					}
				});