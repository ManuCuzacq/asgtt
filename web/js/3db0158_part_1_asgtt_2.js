var serielSM = null;
var serielPanier = null;
var serielCatalogue = null;

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

function initPanier() {
	if ($('.pan_widget').data('seriel-myPanier')) {
		serielPanier = $('.pan_widget').data('seriel-myPanier');
		return;
	}
	$('.pan_widget').myPanier();
	serielPanier = $('.pan_widget').data('seriel-myPanier');
}

function panier() {
	if (!serielPanier) {
		initPanier();
	}

	return serielPanier;
}

function initCatalogue() {
	var catalogueElem = $('.page_catalogue > .catalogue');
	if (catalogueElem.data('seriel-catalogue')) {
		serielCatalogue = catalogueElem.data('seriel-catalogue');
		return;
	}
	catalogueElem.catalogue();
	serielCatalogue = catalogueElem.data('seriel-catalogue');
}

function cat() {
	if (!serielCatalogue) {
		initCatalogue();
	}

	return serielCatalogue;
}

function init_menu_admin() {
	var menu_admin = $('.page_admin > .menu_admin');
	if (menu_admin.size() == 1) {
		var data = menu_admin.data('seriel-menuAdmin');
		if (!data) {
			menu_admin.menuAdmin();
		}
	}
}

function init_menu_compte() {
	var menu_compte = $('.page_compte > .menu_admin');
	if (menu_compte.size() == 1) {
		var data = menu_compte.data('seriel-menuCompte');
		if (!data) {
			menu_compte.menuCompte();
		}
	}
}

$.widget('seriel.admTailles', {
	_create : function() {
		$(' > ul', this.element).sortable();

		$('.save_order_button', this.element).bind('click',
				$.proxy(this.save, this));
	},
	save : function() {
		this.setLoading();

		var lis = $(' > ul > li', this.element);
		var datas = {};

		for (var i = 0; i < lis.size(); i++) {
			var li = $(lis.get(i));
			datas['tailles[' + i + ']'] = li.attr('taille_id');
		}

		$.post(getUrlPrefix() + '/admin/tailles', datas, $.proxy(this.saved,
				this));
	},
	saved : function(result) {
		this.hideLoading();
	},
	setLoading : function() {
		this.options.caller.setContentLoading();
	},
	hideLoading : function() {
		this.options.caller.hideContentLoading();
	},
	options : {
		caller : null
	}
});

$.widget('seriel.renommerCategorie', {
	_create : function() {
		$('.cancel_button', this.element).bind('click',
				$.proxy(this.cancelClicked, this));
		$('.valid_button', this.element).bind('click',
				$.proxy(this.saveClicked, this));
	},
	cancelClicked : function() {
		this.element.dialog('close');
	},
	saveClicked : function() {
		var cat_id = $('.cat_renommer', this.element).attr('cat_id');
		var newName = $('input', this.element).val();

		this.options.caller.updateCategorie(cat_id, newName);
		this.element.dialog('close');
	},
	options : {
		caller : null
	}
});

$
		.widget(
				'seriel.admCategories',
				{
					_create : function() {
						$('ul', this.element).sortable();
						$('ul > li', this.element).bind('dblclick',
								$.proxy(this.renommer, this));

						$('.save_order_button', this.element).bind('click',
								$.proxy(this.save, this));
					},
					updateCategorie : function(cat_id, nom) {
						// On récupère l'élément.
						var elem = $('ul > li[cat_id=' + cat_id + ']',
								this.element);
						if (elem.size() == 1) {
							var orig_name = $('.orig_name', elem).html();
							var newLabel = nom ? nom : orig_name;
							var newContent = newLabel
									+ '<span class="orig_name">' + orig_name
									+ '</span><span class="new_name">' + nom
									+ '</span></li>';

							elem.html(newContent);
						}
					},
					renommer : function(event) {
						var target = $(event.currentTarget);
						var cat_id = target.attr('cat_id');
						var orig_name = $('.orig_name', target).html();
						var new_name = $('.new_name', target).html();

						var cont = $('<div class="cat_renommer" cat_id="'
								+ cat_id
								+ '"><div>Nom Wavesoft : '
								+ orig_name
								+ '</div><div>Nom Site Web : <input type="text" name="new_name" placeholder="'
								+ orig_name + '" value="' + new_name
								+ '" /></div></div>');

						var validation = $('<div class="article_admin_buttons modal-buttons" layout-size="65"><span><span class="cancel_button"><span>Annuler</span></span><span class="valid_button"><span>Enregistrer<span></span></span></span></span></div>');
						validation.appendTo(cont);

						openModalWithContentInside('Renommer la catégorie',
								cont, null, {
									'width' : 350,
									'height' : 200
								});

						$('.cat_renommer').parent().renommerCategorie({
							'caller' : this
						});
					},
					save : function() {
						this.setLoading();

						var lis = $('ul > li', this.element);
						var datas = {};

						for (var i = 0; i < lis.size(); i++) {
							var li = $(lis.get(i));
							datas['categories[' + i + '][id]'] = li
									.attr('cat_id');
							datas['categories[' + i + '][nom]'] = $(
									'.new_name', li).html();
						}

						$.post(getUrlPrefix() + '/admin/categories', datas, $
								.proxy(this.saved, this));
					},
					saved : function(result) {
						this.hideLoading();
					},
					setLoading : function() {
						this.options.caller.setContentLoading();
					},
					hideLoading : function() {
						this.options.caller.hideContentLoading();
					},
					options : {
						caller : null
					}
				});

$.widget('seriel.menuCompte', {
	_create : function() {
		this.checkHash();
	},
	checkHash : function() {
		var hash = getCleanHash();

		var elems = parseHash(hash);

		$('.submenu_admin > ul > li.selected', this.element).removeClass(
				'selected');

		if (count(elems) > 1) {
			sub = elems[1].getLabel();

			if (sub == "liste_commandes") {
				this.setContentLoading();
				$('#content_compte', this.element).load(
						getUrlPrefix() + '/compte/liste_commandes',
						$.proxy(this.listeCommandesLoaded, this));
				$('li.commandes', this.element).addClass('selected');

				/*
				 * $('.compte > div > .submenu > ul > li> a',
				 * this.element).removeClass('active'); console.log('remove
				 * class active'); $('.commandes',
				 * this.element).addClass('active') console.log('on ajoute
				 * active sur le bon'); $('#content_compte',
				 * this.element).load(getUrlPrefix() +
				 * '/compte/liste_commandes', datas,
				 * $.proxy(this.listeCommandesLoaded, this)); console.log('on
				 * charge la nouvelle page');
				 */
				// return;
			} else if (sub == "mes_adresses") {
				this.setContentLoading();
				$('#content_compte', this.element).load(
						getUrlPrefix() + '/compte/mes_adresses',
						$.proxy(this.adressesLoaded, this));
				$('li.mes_adresses', this.element).addClass('selected');

				/*
				 * $('.compte > div > .submenu > ul > li > a',
				 * this.element).removeClass('active'); $('.infos_adresses',
				 * this.element).addClass('active'); $('#content_compte',
				 * this.element).load(getUrlPrefix() + '/compte/mes_adresses',
				 * datas, $.proxy(this.adressesLoaded, this)); //return;
				 */
			} else if (sub == "infos_perso") {
				$('li.mes_infos', this.element).addClass('selected');

				/*
				 * $('.compte > div > .submenu > ul > li > a',
				 * this.element).removeClass('active'); $('.infos_perso',
				 * this.element).addClass('active');
				 * 
				 * $('#content_compte', this.element).load(getUrlPrefix() +
				 * '/compte/infos_perso', datas, $.proxy(this.infosLoaded,
				 * this));
				 */
			} else {

			}
		}
	},
	listeCommandesLoaded : function() {
		$('#content_compte > div', this.element).listesCommandes();
		// $('#content_compte > div',this.element).listesCommandes('init');
		this.hideContentLoading();
	},
	adressesLoaded : function() {
		this.hideContentLoading();
	},
	setContentLoading : function() {
		$('#content_compte', this.element).addClass('loading');
	},
	hideContentLoading : function() {
		$('#content_compte', this.element).removeClass('loading');
	},
	options : {

	}
});

$.widget('seriel.menuAdmin', {
	_create : function() {
		this.checkHash();
	},
	checkHash : function() {
		var hash = getCleanHash();

		var elems = parseHash(hash);

		$('.submenu_admin > ul > li.selected', this.element).removeClass(
				'selected');

		if (count(elems) > 1) {
			sub = elems[1].getLabel();
			if (sub == 'tailles') {
				this.setContentLoading();
				$('#content_admin', this.element).load(
						getUrlPrefix() + '/admin/tailles',
						$.proxy(this.taillesLoaded, this));
				$('.submenu_admin > ul > li.tailles', this.element).addClass(
						'selected');
			} else if (sub == 'cats') {
				this.setContentLoading();
				$('#content_admin', this.element).load(
						getUrlPrefix() + '/admin/categories',
						$.proxy(this.catsLoaded, this));
				$('.submenu_admin > ul > li.categories', this.element)
						.addClass('selected');
			} else if (sub == 'commandes') {
				this.setContentLoading();
				$('#content_admin', this.element).load(
						getUrlPrefix() + '/admcompte/liste_commandes',
						$.proxy(this.commandesLoaded, this));
				$('.submenu_admin > ul > li.commandes', this.element).addClass(
						'selected');
			}
		}
	},
	setContentLoading : function() {
		$('#content_admin', this.element).addClass('loading');
	},
	hideContentLoading : function() {
		$('#content_admin', this.element).removeClass('loading');
	},
	taillesLoaded : function() {
		$('#content_admin > .adm_tailles', this.element).admTailles({
			'caller' : this
		});
		this.hideContentLoading();
		this.hideContentLoading();
	},
	catsLoaded : function() {
		$('#content_admin > .adm_categories', this.element).admCategories({
			'caller' : this
		});
		this.hideContentLoading();
	},
	commandesLoaded : function() {
		$('#content_admin > div',this.element).listesCommandes();
		this.hideContentLoading();
	},
	options : {
		lastLoaded : null
	}
});

function initMainMenuNavigator() {
	// Nothing there .. just compatibility
}

$
		.widget(
				'seriel.catalogue',
				{
					_create : function() {
						this.init();
					},
					init : function() {
						this.element.removeClass('loading');

						this.options.articles = $(
								' > .row > .catalogue_article', this.element);

						var nbPages = intval((this.options.articles.size() - 1)
								/ this.options.pageSize) + 1;
						if (nbPages <= 0)
							nbPages = 1;
						this.options.is_button = true;

						if (nbPages > 4) {
							var select = $('<select class="page"></select>');
							// var select_bas = $('<select
							// class="page"></select>');

							for (var i = 1; i <= nbPages; i++) {
								var option = $('<option value="' + i + '">' + i
										+ '</option>');
								option.appendTo(select);
								// option.appendTo(select_bas);
							}

							this.options.is_button = false;

							select.bind('change', $.proxy(
									this.pageSelectChange, this));
							// select_bas.bind('change',
							// $.proxy(this.pageSelectChange, this));

							$('select.page', this.element).replaceWith(select);

							// $('select.page',
							// this.element).last().html(select.html());

						} else {
							// on creer les boutons
							var buttons = $('<div></div>');
							for (var i = 1; i <= nbPages; i++) {

								var button = $('<span class="nav-button button-'
										+ i + '">' + i + '</span>');
								button.bind('click', $.proxy(
										this.buttonNavClicked, this));
								buttons.append(button)

							}

							$('select.page', this.element).replaceWith(buttons);
							$('.nav-button', this.element).first().addClass(
									'active');

						}

						// on s'occupe di trie
						var hash = getCleanHash();
						// test
						var elems = parseHash(hash);
						// console.log(elems);
						if (count(elems) > 0) {
							if (count(elems) > 1) {
								var params = elems[1].getParams();
							} else {
								var params = elems[0].getParams();
							}
						}
						this.options.trie = "nom";
						this.options.filtre = "";
						if (params) {
							if (params['trie']) {
								$('#trier', this.element).val(params['trie']);
								this.options.trie = params['trie'];
							}

							if (params['filtre']) {
								taille = params['filtre'].replace('_', '/');
								$('#filtre', this.element).val(taille);
								this.options.filtre = params['filtre'];
							}
						}
						$('#trier', this.element).bind('change',
								$.proxy(this.trierChange, this));
						$('#filtre', this.element).bind('change',
								$.proxy(this.filtreChange, this));

						$('.bouton-precedent', this.element).bind('click',
								$.proxy(this.pagePrecedente, this));
						$('.bouton-suivant', this.element).bind('click',
								$.proxy(this.pageSuivante, this));

						this.gererBoutonsNav();

					},
					filtreChange : function() {
						var taille = $('#filtre', this.element).val();
						taille = taille.replace('/', '_');
						var params = {}
						var tab = this.getNewHash();
						params = tab['params'];
						var newHash = tab['newHash'];

						if (params) {
							// alert('params');

							if (params['page'] && params['trie']) {
								// alert('params trie et page');
								newHash += '[page=1,trie=' + params['trie']
										+ ',filtre=' + taille + ']';
							} else if (params['page'] || params['trie']) {
								// alert('params trie ou page');
								if (params['page']) {
									// alert('params page');
									newHash += '[page=1,filtre=' + taille + ']';
								} else {
									// alert('params trie');
									newHash += '[trie=' + params['trie']
											+ ',filtre=' + taille + ']';
								}
							} else {
								newHash += '[filtre=' + taille + ']';
							}
						} else {
							newHash += '[filtre=' + taille + ']';
						}
						// alert(newHash);
						hc().setHash(newHash);

					},
					getNewHash : function() {
						var hash = getCleanHash();
						var params = {}
						var first = null;
						var second = null;
						var third = null;
						var res = {}
						var elems = parseHash(hash);

						if (count(elems) > 0) {
							first = elems[0].getLabel();
							params = elems[0].getParams();
							if (count(elems) > 1) {
								second = elems[1].getLabel();
								params = elems[1].getParams();
								if (count(elems) > 2) {
									third = elems[2].getLabel();
									params = elems[2].getParams();
								}
							}
						}

						var newHash = first;
						if (second)
							newHash += '/' + second;
						if (third)
							newHash += '/' + third;
						res['params'] = params
						res['newHash'] = newHash;
						return res;
					},
					trierChange : function() {

						// on recupère le trie et on l'ajoute a l'URL
						var trie = $('#trier', this.element).val();

						var params = {}

						var tab = this.getNewHash();
						params = tab['params'];
						// alert(params['page']);
						var newHash = tab['newHash'];

						if (params) {
							if (params['page'] && params['filtre']) {
								newHash += '[page=1,trie=' + trie + ',filtre='
										+ params['filtre'] + ']';
							} else if (params['page'] || params['filtre']) {
								if (params['page']) {
									newHash += '[page=1,trie=' + trie + ']';
								} else {
									newHash += '[trie=' + trie + ',filtre='
											+ parmas['filtre'] + ']';
								}
							} else {
								newHash += '[trie=' + trie + ']';
							}

						} else {
							newHash += '[trie=' + trie + ']';
						}

						hc().setHash(newHash);

					},
					buttonNavClicked : function(event) {

						var target = $(event.currentTarget);

						var newPage = target.html();

						var params = {};
						var tab = this.getNewHash();
						params = tab['params'];
						var newHash = tab['newHash'];

						if (params) {
							if (params['trie'] && params['filtre']) {
								newHash += '[page=' + newPage + ',trie='
										+ params['trie'] + ',filtre='
										+ params['filtre'] + ']';
							} else if (params['trie'] || params['filtre']) {
								if (params['trie']) {
									newHash += '[page=' + newPage + ',trie='
											+ params['trie'] + ']';
								} else {
									newHash += '[page=' + newPage + ',filtre='
											+ params['filtre'] + ']';
								}
							} else {
								newHash += '[page=' + newPage + ']';
							}
						} else {
							newHash += '[page=' + newPage + ']';
						}

						hc().setHash(newHash);

						$.proxy(this.gererBoutonsNav(), this);
					},
					gererBoutonsNav : function() {

						if (this.options.is_button == false) {
							var numero_page = $('select.page', this.element)
									.val();
						} else {
							var hash = getCleanHash();
							// test
							var elems = parseHash(hash);
							// console.log(elems);
							if (count(elems) > 0) {
								if (count(elems) > 1) {
									var params = elems[1].getParams();
								} else {
									var params = elems[0].getParams();
								}
							}
							// console.log(params);
							if (params) {
								var numero_page = intval(params['page']);

								if (params['trie']) {
									$('#trier', this.element).val(
											params['trie']);
								}

							} else {
								var numero_page = 1;
							}

							$('.nav-button', this.element)
									.removeClass('active');
							$('.button-' + numero_page, this.element).addClass(
									'active');

						}

						if (numero_page == '1') {
							$('.bouton-precedent', this.element).css('opacity',
									'0.5');
						} else {
							$('.bouton-precedent', this.element).css('opacity',
									'1');
						}

						var nbPages = intval((this.options.articles.size() - 1)
								/ this.options.pageSize) + 1;

						if (numero_page == nbPages) {
							$('.bouton-suivant', this.element).css('opacity',
									'0.5');
						} else {
							$('.bouton-suivant', this.element).css('opacity',
									'1');
						}
					},
					pagePrecedente : function() {

						var hash = getCleanHash();

						if (this.options.is_button == false) {
							var newPage = $('select.page', this.element).val();

						} else {
							var elems = parseHash(hash);
							// var params = elems[0].getParams();
							if (count(elems) > 0) {
								if (count(elems) > 1) {
									var params = elems[1].getParams();
								} else {
									var params = elems[0].getParams();
								}
							}
							if (params) {
								number = params['page'];
								if (number) {
									var newPage = number;
								} else {
									var newPage = 1;
								}
							} else {
								var newPage = 1;
							}

						}

						newPage--;
						if (newPage < 1) {
							newPage = 1;
						}

						var params = {}
						var tab = this.getNewHash();
						params = tab['params'];
						var newHash = tab['newHash'];

						if (params) {
							if (params['trie'] && params['filtre']) {
								newHash += '[page=' + newPage + ',trie='
										+ params['trie'] + ',filtre='
										+ params['filtre'] + ']';
							} else if (params['trie'] || params['filtre']) {
								if (params['trie']) {
									newHash += '[page=' + newPage + ',trie='
											+ params['trie'] + ']';
								} else {
									newHash += '[page=' + newPage + ',filtre='
											+ params['filtre'] + ']';
								}
							} else {
								newHash += '[page=' + newPage + ']';
							}
						} else {
							newHash += '[page=' + newPage + ']';
						}

						hc().setHash(newHash);
						this.gererBoutonsNav();
					},
					pageSuivante : function() {
						var hash = getCleanHash();

						if (this.options.is_button == false) {
							var newPage = $('select.page', this.element).val();

						} else {
							var elems = parseHash(hash);
							var params = {};
							// var params = elems[0].getParams();
							if (count(elems) > 0) {
								if (count(elems) > 1) {
									var params = elems[1].getParams();
								} else {
									var params = elems[0].getParams();
								}
							}

							if (params) {
								var number = params['page'];
								if (number) {
									var newPage = number;
								} else {
									var newPage = 1;
								}
							} else {
								var newPage = 1;
							}

						}

						newPage++;
						var nbPages = intval((this.options.articles.size() - 1)
								/ this.options.pageSize) + 1;

						if (newPage > nbPages) {
							newPage = nbPages;
						}

						var params = {}
						var tab = this.getNewHash();
						params = tab['params'];
						var newHash = tab['newHash'];

						if (params) {
							if (params['trie'] && params['filtre']) {
								newHash += '[page=' + newPage + ',trie='
										+ params['trie'] + ',filtre='
										+ params['filtre'] + ']';
							} else if (params['trie'] || params['filtre']) {
								if (params['trie']) {
									newHash += '[page=' + newPage + ',trie='
											+ params['trie'] + ']';
								} else {
									newHash += '[page=' + newPage + ',filtre='
											+ params['filtre'] + ']';
								}
							} else {
								newHash += '[page=' + newPage + ']';
							}
						} else {
							newHash += '[page=' + newPage + ']';
						}

						hc().setHash(newHash);
						this.gererBoutonsNav();
					},
					pageSelectChange : function(event) {
						var target = $(event.currentTarget);

						var newPage = target.val();

						// this.gererBoutonsNav();

						// OK, on reconstruit l'url.
						var params = {}
						var tab = this.getNewHash();
						params = tab['params'];
						var newHash = tab['newHash'];

						if (params) {
							if (params['trie'] && params['filtre']) {
								newHash += '[page=' + newPage + ',trie='
										+ params['trie'] + ',filtre='
										+ params['filtre'] + ']';
							} else if (params['trie'] || params['filtre']) {
								if (params['trie']) {
									newHash += '[page=' + newPage + ',trie='
											+ params['trie'] + ']';
								} else {
									newHash += '[page=' + newPage + ',filtre='
											+ params['filtre'] + ']';
								}
							} else {
								newHash += '[page=' + newPage + ']';
							}
						} else {
							newHash += '[page=' + newPage + ']';
						}
						//
						hc().setHash(newHash);
						// this.gererBoutonsNav();
					},
					showPage : function() {
						var page = this.options.pageDisplayed;

						if (this.options.articles) {
							var first = ((page - 1) * this.options.pageSize) + 1;
							var last = page * this.options.pageSize;
							//

							var toShow = this.options.articles
									.filter(':nth-child(n+' + first
											+ '):nth-child(-n+' + last + ')');
							this.options.articles.addClass('hidden');
							toShow.removeClass('hidden');
						}

						$('select.page', this.element).val(page);
						this.gererBoutonsNav();
					},
					navigate : function() {
						var hash = getCleanHash();

						var first = null;
						var second = null;
						var third = null;

						var trie = 'nom';

						var elems = parseHash(hash);
						if (count(elems) > 0) {
							first = elems[0].getLabel();
							if (count(elems) > 1) {
								second = elems[1].getLabel();
								if (count(elems) > 2) {
									third = elems[2].getLabel();
								}
							}
						}

						$('.indicateur', this.element).css('visibility',
								'visible');
						$('.indicateur > div > .principal', this.element).html(
								strtoupper(first));

						var params = {};

						var page = 1;

						if (!second) {
							$('.indicateur > div > .secondaire', this.element)
									.css('visibility', 'hidden');
							params = elems[0].getParams();
						} else {
							$('.indicateur > div > .principal', this.element)
									.html(strtoupper(second));
							$('.indicateur > div > .secondaire', this.element)
									.css('visibility', 'visible');
							params = elems[1].getParams();
						}

						var pageChange = false;

						var trie = "nom";
						var filtre = "";

						if (params && count(params) > 0) {
							page = intval(params['page']);
							if (params['trie']) {
								trie = params['trie'];
							}
							if (params['filtre']) {
								filtre = params['filtre'];
							}

						}

						if (page <= 0)
							page = 1;
						if (page != this.options.pageDisplayed)
							pageChange = true;
						this.options.pageDisplayed = intval(page);

						if (this.options.trie != trie) {
							// console.log("trie : "+trie);
							// console.log("this.options.trie :
							// "+this.options.trie);
							// on change de type de trie
							this.element.addClass('loading');
							this.options.trie = trie;
							var datas = {
								'trie' : trie
							};
							if (params) {
								if (params['filtre']) {
									datas['filtre'] = params['filtre'];
								}
							}

							this.options.pageDisplayed = 1;
							if (second) {
								$.post(getUrlPrefix() + '/catalogue/'
										+ strtolower(first) + '/' + second,
										datas, $.proxy(this.loaded, this));
								// alert('test');
							} else {
								$.post(getUrlPrefix() + '/catalogue/'
										+ strtolower(first), datas, $.proxy(
										this.loaded, this));
							}

							return;
						}

						if (this.options.filtre != filtre) {
							this.element.addClass('loading');
							// on verifie si on a changer le trie
							// alert('filtre CHanged');
							this.options.filtre = filtre;
							var datas = {};
							datas['filtre'] = filtre;
							if (params) {
								if (params['trie']) {
									datas['trie'] = params['trie'];
								}
							}

							this.options.pageDisplayed = 1;

							if (second) {
								$.post(getUrlPrefix() + '/catalogue/'
										+ strtolower(first) + '/' + second,
										datas, $.proxy(this.loaded, this));
								// alert('test');
							} else {
								$.post(getUrlPrefix() + '/catalogue/'
										+ strtolower(first), datas, $.proxy(
										this.loaded, this));
							}
							return;
							console.log("filtre : " + filtre);
							console.log("this.options.filtre : "
									+ this.options.filtre);

						}

						var cmpStr = first;
						if (second)
							cmpStr += '/' + second;
						if (third)
							cmpStr += '/' + third;

						if (is_admin()) {
							if (cmpStr == this.options.lastCmpStr) {
								// On controle le contenu, fiche article ou
								// catalogue.
								if ($(' > .article', this.element).size() > 0) { // fiche
																					// produit
									/*
									 * if (this.options.lastResult) { res =
									 * $(this.options.lastResult);
									 * this.updateContent(res.html());
									 * this.showPage(); return; }
									 */
								} else { // Catalogue.
									if (pageChange) {
										this.showPage();
										return;
									}
								}
							}
						} else {
							if (cmpStr == this.options.lastCmpStr) {
								// On controle le contenu, fiche article ou
								// catalogue.
								if ($(' > .article', this.element).size() > 0) { // fiche
																					// produit
									if (this.options.lastResult) {
										res = $(this.options.lastResult);
										this.updateContent(res.html());
										this.showPage();
										return;
									}
								} else { // Catalogue.
									this.showPage();
									return;
								}
							}
						}

						if (filtre != "") {
							var datas = {
								'trie' : trie,
								'filtre' : filtre
							};
						} else {
							var datas = {
								'trie' : trie
							};
						}

						this.options.lastResult = null;
						this.options.lastCmpStr = cmpStr;

						this.element.addClass('loading');

						if (false && first == 'drap-de-plage') {
							// var datas = {'trie':trie};
						} else {
							if (second) {
								$.post(getUrlPrefix() + '/catalogue/'
										+ strtolower(first) + '/' + second,
										datas, $.proxy(this.loaded, this));
								// alert('test');
							} else {
								$.post(getUrlPrefix() + '/catalogue/'
										+ strtolower(first), datas, $.proxy(
										this.loaded, this));
							}
						}
					},
					loaded : function(result) {
						// alert("loaded");
						this.options.lastResult = result;

						res = $(result);
						this.updateContent(res.html());
						this.showPage();
					},
					updateContent : function(html) {
						this.element.html(html);
						this.init();
					},
					options : {
						pageSize : 12,
						articles : null,
						lastCmpStr : null,
						lastResult : null,
						pageDisplayed : 1
					}
				});

function isSmallDisplay() {
	/*
	 * var css_pos = $('#header').css('position'); var res = (css_pos ==
	 * 'relative'); //console.log('isMobile() : '+res); return res;
	 */

	// TODO
	return false;
}

var screenSize = {
	widthClass : function() {
		var width = $(document).width();

		if (width <= 700)
			return 'width_inf_700';
		if (width <= 720)
			return 'width_inf_720';
		if (width <= 780)
			return 'width_inf_780';
		if (width <= 880)
			return 'width_inf_880';
		if (width <= 980)
			return 'width_inf_980';
		if (width <= 1010)
			return 'width_inf_1010';
		if (width <= 1100)
			return 'width_inf_1100';
		if (width <= 1250)
			return 'width_inf_1250';
		if (width > 1900)
			return 'width_sup_1900';

		return '';
	},
	heightClass : function() {
		var height = $(document).height();

		if (height <= 450)
			return 'height_inf_450';
		if (height <= 520)
			return 'height_inf_520';
		if (height <= 600)
			return 'height_inf_600';
		if (height <= 700)
			return 'height_inf_700';
		if (height <= 800)
			return 'height_inf_800';
		if (height <= 850)
			return 'height_inf_850';

		return '';
	},
	currentWidthClass : function() {
		var currentClass = '';
		var cl = $('body').get(0).className;
		var classes = explode(' ', cl);
		for (var i = 0; i < count(classes); i++) {
			var cla = classes[i];
			if (substr(cla, 0, 6) == 'width_') {
				currentClass = cla;
				break;
			}
		}
		return currentClass;
	},
	currentHeightClass : function() {
		var currentClass = '';
		var cl = $('body').get(0).className;
		// console.log('cl : '+cl);
		var classes = explode(' ', cl);
		for (var i = 0; i < count(classes); i++) {
			var cla = classes[i];
			// console.log('cla : '+cla);
			if (substr(cla, 0, 7) == 'height_') {
				// console.log('cla FOUND : '+cla);
				currentClass = cla;
				break;
			}
		}
		return currentClass;
	},
	updateScreenSizeClasses : function() {
		var widthClass = screenSize.widthClass();
		var heightClass = screenSize.heightClass();

		var curWidthClass = screenSize.currentWidthClass();
		var curHeightClass = screenSize.currentHeightClass();

		if (widthClass != curWidthClass) {
			if (curWidthClass)
				$('body').removeClass(curWidthClass);
			if (widthClass)
				$('body').addClass(widthClass);
		}
		if (heightClass != curHeightClass) {
			if (curHeightClass)
				$('body').removeClass(curHeightClass);
			if (heightClass)
				$('body').addClass(heightClass);
		}
	}
};

var isMobile = {
	Android : function() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry : function() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS : function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera : function() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows : function() {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any : function() {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS()
				|| isMobile.Opera() || isMobile.Windows());
	}
};

var isIE = {
	IE11 : function() {
		return !!navigator.userAgent.match(/Trident.*rv\:11\./);
	},
	IE10 : function() {
		return navigator.appVersion.match(/MSIE 10/i);
	},
	IE9 : function() {
		return navigator.appVersion.match(/MSIE 9/i);
	},
	IE8 : function() {
		return navigator.appVersion.match(/MSIE 8/i);
	},
	IE7 : function() {
		return navigator.appVersion.match(/MSIE 7/i);
	},
	others : function() {
		return navigator.appVersion.match(/MSIE/i);
	},
	lowerThan9 : function() {
		return (isIE.IE8() || isIE.IE7());
	},
	any : function() {
		return (isIE.IE11() || isIE.others());
	}
};

function dialogLoaded() {
	// Let's deal with navigator :
	var dialog = this.data('modal');
	var navSpan = $(' > .nav_widget', dialog);
	if (navSpan && navSpan.size() == 1) {
		var navClass = navSpan.html();
		navSpan.remove();
		eval('dialog.' + navClass + '();');
	}
}

function modalClosed() {
	// Do something here.
	// alert(this.get(0));
	this.removeClass('modal-open');
}

function is_admin() {
	return $('body').hasClass('is_admin');
}
function is_client() {
	return $('body').hasClass('is_client');
}

function checkDialogPos(dialog, container) {
	// En gros, ici, on replace l'élément au milieu de la page.
	var tagname = strtolower(container.get(0).tagName);
	if (tagname != 'body')
		return;

	// OK, on est dans le body, on essaye de recentrer la fenêtre verticalement
	// si nécessaire.
	var dad = dialog.parent();
	dad.css('transition', 'none');
	var pos = dad.offset();
	var top = pos['top'];
	var top = intval(dad.css('top'));
	var height = dad.height();
	var bottom = top + height;

	var scroll = $('body').scrollTop();
	var windowHeight = $(window).height();

	var relativeTop = top - scroll;
	var relativeBottom = bottom - scroll;

	// On centre la fenetre.
	var wishedRelativeTop = intval((windowHeight - height) / 2) - 10;
	var move = intval(wishedRelativeTop - relativeTop);

	// alert(relativeTop+'['+height+'] > '+wishedRelativeTop);

	// dad.css({'top': (top - move)+'px' });
	dad.css({
		'top' : (top + move) + 'px'
	});

	// alert(top+' / '+scroll );
}

function openModalInside(title, url, dest, options) {
	if (!dest)
		dest = $('body');

	dest.addClass('modal-open');

	if (!title)
		title = '';

	var width = 900;
	var height = 450;
	var post = null;

	if (options) {
		if (options['width'])
			width = intval(options['width']);
		if (options['height'])
			height = intval(options['height']);
		if (options['post'])
			post = options['post'];
	}

	var availableWidth = dest.width() - 20;
	if (width > availableWidth)
		width = availableWidth;

	var availableHeight = dest.height() - 10;
	// alert(height+' / '+availableHeight);
	if (height > availableHeight)
		height = availableHeight;

	var dialog = $('<div class="seriel_dialog"></div>');
	dest.data('modal', dialog);
	dialog.dialog({
		'modal' : true,
		'title' : title,
		'draggable' : true,
		'resizable' : false,
		'width' : width,
		'height' : height,
		'appendTo' : dest,
		'position' : {
			my : "center",
			at : "center",
			of : dest
		},
		'beforeClose' : $.proxy(this.beforeCloseModal, this)
	});
	dialog.html('<div class="loading"></div>');
	dialog.css('position', 'relative');

	if ('post')
		dialog.load(url, post, $.proxy(dialogLoaded, dest));
	else
		dialog.load(url, $.proxy(this.dialogLoaded, this));

	// alert(dialog.size()+' > '+dest.get(0));

	dialog.bind('dialogclose', $.proxy(modalClosed, dest));
	dialog.dialog('open');

	checkDialogPos(dialog, dest);
}

function openModalWithContentInside(title, content, dest, options) {
	if (!dest)
		dest = $('body');

	var width = 900;
	var height = 450;

	if (options) {
		if (options['width'])
			width = intval(options['width']);
		if (options['height'])
			height = intval(options['height']);
	}

	if (!title)
		title = '';
	var dialog = $('<div class="seriel_dialog"></div>');
	dialog.data('parentNavigator', this);
	dialog.dialog({
		'modal' : true,
		'title' : title,
		'draggable' : false,
		'resizable' : false,
		'width' : width,
		'height' : height,
		'appendTo' : dest,
		'position' : {
			my : "center",
			at : "center",
			of : dest
		}
	});
	dialog.html(content);
	dialog.dialog('open');
	dialog.css('position', 'relative');

	checkDialogPos(dialog, dest);

	// HACK !
	// this.document.unbind( "focusin" );
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
$.widget('seriel.pageContact',
		{
			_create : function() {
				this.initForm();
			},
			viderForm : function() {
				$('input', this.options.form).each(function() {
					$(this).val('');
				});

				$('textarea', this.options.form).each(function() {
					$(this).html('');
				});
			},
			initForm : function() {
				this.options.form = $('form', this.elment);
				this.options.submit = $('button[type=submit]', this.element);
				$('.button', this.element).bind('click',
						$.proxy(this.saveClick, this));
				this.options.submit.bind('click', $.proxy(this.submit, this));
			},
			saveClick : function() {
				this.options.submit.trigger('click');
			},
			submit : function(event) {
				event.stopPropagation();
				var datas = this.options.form.serializeArray()
				$.post(getUrlPrefix() + '/contact', datas, $.proxy(this.saved,
						this));
				return false;

			},
			saved : function(result) {
				var res = $(result);
				if (res.hasClass('success')) {
					showAlert('Demande Enregistrée',
							'Votre demande à bien été enregistrée');
					this.viderForm();
					hc().setHash('');
				} else {
					$('form', this.element).html($('form', res).html());
					this.initForm();
				}
			},
			options : {

			}
		});

$.widget('seriel.ser_adminLogin', {
	_create : function() {
		this.init();
	},
	init : function() {
		this.options.form = $('form', this.element);
		this.options.form.bind('submit', $.proxy(this.submit, this));

		$('#username', this.element).focus().select();

		$('.button', this.element).bind('click',
				$.proxy(this.buttonClicked, this));
	},
	buttonClicked : function() {
		$('input[type=submit]', this.element).trigger('click');
		// this.options.form.trigger('submit');
	},
	submit : function(event) {
		event.preventDefault();
		event.stopPropagation();
		this.setLoading();
		var datas = this.options.form.serializeArray();
		console.log(datas);
		var url = this.options.form.attr('action');

		this.options.currentRequest = $.ajax({
			'url' : url,
			'data' : datas,
			'type' : 'POST',
			success : $.proxy(this.answered, this)
		});

		return false;
	},
	setLoading : function() {
		this.element.addClass('loading');
	},
	hideLoading : function() {
		this.element.removeClass('loading');
	},
	answered : function(result) {
		// let's see what we have.

		var res = $(result);

		if (res.hasClass('admin')) {
			// We failed.
			this.element.html(res.html());
			this.init();

			this.hideLoading();

			return;
		} else {
			// On travail la chaine de resultat pour ne récupérer que le body.
			var bodyStart = strpos(result, '<body');
			var body = substr(result, bodyStart);
			var bodyStart2 = strpos(body, '>');
			body = substr(body, bodyStart2 + 1);
			var bodyEnd = strpos(body, '</body');
			// body = substr(body, 0, bodyEnd)+'</body>';
			body = substr(body, 0, bodyEnd);
			// var html = '<html>'+body;
			res = $("<div/>");
			res.html(html_entity_decode(body));

			$('body').addClass('is_admin');
			// alert($('.compte_menu.cpte', res).size());
			$('.compte_menu.cpte').replaceWith($('.compte_menu.cpte', res));
			// $(' > *', this.element).css('visibility', 'hidden');
			// this.hideLoading();
			// hc().setHash('');
			$('.page_admin').load(getUrlPrefix() + '/admin/menu',
					init_menu_admin);
		}
	},
	options : {
		form : null,
		currentRequest : null
	}
});

$.widget('seriel.ser_clientLogin', {
	_create : function() {
		this.init();
		console.log('clientLog')
	},
	init : function() {
		this.options.form = $('form', this.element);
		this.options.form.bind('submit', $.proxy(this.submit, this));
		this.options.url = this.options.form.attr('action');
		this.options.form.prop('action', '');

		$('#username', this.element).focus().select();

		$('.button', this.element).bind('click',
				$.proxy(this.buttonClicked, this));
	},
	buttonClicked : function() {
		$('input[type=submit]', this.element).trigger('click');
		// this.options.form.trigger('submit');
	},
	submit : function(event) {
		event.preventDefault();
		event.stopPropagation();
		this.setLoading();
		var datas = this.options.form.serializeArray();
		var url = this.options.url;

		this.options.currentRequest = $.ajax({
			'url' : url,
			'data' : datas,
			'type' : 'POST',
			success : $.proxy(this.answered, this)
		});

		return false;

		/*
		 * this.setLoading(); event.stopPropagation();
		 * 
		 * var datas = this.options.form.serializeArray(); var url =
		 * this.options.form.attr('action'); this.options.currentRequest =
		 * $.ajax({ 'url': url, 'data': datas, 'type': 'POST', success:
		 * $.proxy(this.answered, this) });
		 * 
		 * return false;
		 */
	},
	setLoading : function() {
		this.element.addClass('loading');
	},
	hideLoading : function() {
		this.element.removeClass('loading');
	},
	answered : function(result) {
		// let's see what we have.
		var res = $(result);

		if (res.hasClass('admin')) {
			// We failed.
			// Si on a déjà un message d'erreur on le supprime.
			$('.error', this.element).remove();
			$('.error', res).insertBefore(this.options.form);

			// this.init();

			this.hideLoading();
			return;
		} else {
			// On travail la chaine de resultat pour ne récupérer que le body.
			var bodyStart = strpos(result, '<body');
			var body = substr(result, bodyStart);

			var bodyEnd = strpos(body, '</body');
			body = substr(body, 0, bodyEnd) + '</body>';
			// var html = '<html>'+body;
			res = $(html_entity_decode(body));
			console.log(body);
			$('body').addClass('is_client');

			$('.navbar.navbar-custom').replaceWith(
					$('.navbar.navbar-custom', res));
			$('.pan_widget').myPanier();
			// hc().setHash('');

			$(' > *', this.element).css('visibility', 'hidden');
			this.hideLoading();

			if (isCommandeOn()) {
				_setModeCommandeOff();
				hc().setHash('commande');

				return;
			}

			if (is_admin()) {
				hc().setHash('admin');
			} else {
				$('.page_compte').load(getUrlPrefix() + '/compte/menu',
						init_menu_compte);
			}

		}
	},
	options : {
		form : null,
		url : null,
		currentRequest : null
	}
});

$
		.widget(
				'seriel.myPanier',
				$.seriel.ser_widget,
				{
					_create : function() {
						this._super();

						var tuiles = $(
								'.liste_tuiles_articles > .article_block:not(.clonable)',
								this.options.content);
						tuiles.tuilePanier({
							'caller' : this
						});

						this.options.boutonValider = $('.valid_panier',
								this.options.content);
						this.options.boutonValider.bind('click', $.proxy(
								this.validerPanier, this));

						this.checkPanierVide();
						this.updateTotal();
					},
					validerPanier : function() {
						hc().setHash('panier');
						this.close();
					},
					getNbArticles : function() {
						var nbArticles = $('.nbArticle', this.element).html();
						return nbArticles;
					},
					deleteLigne : function(article_id) {
						this.setLoading();
						$('.article_block', this.options.content)
								.each(
										function() {
											if ($(this).attr('article_id') == article_id) {
												$(this).remove();
											}
										});
						this.decrementerCompteurArticle();
						this.hideLoading();
					},
					setLoading : function() {
						this.element.addClass('loading');
					},
					hideLoading : function() {
						this.element.removeClass('loading');
					},
					/*
					 * afficher:function(){
					 * 
					 * if($('.panier_widget',this.element).hasClass('visible')){
					 * $('.panier_widget',this.element).removeClass('visible');
					 * $('.panier_widget',this.element).addClass('invisible');
					 * }else{
					 * $('.panier_widget',this.element).addClass('visible');
					 * $('.panier_widget',this.element).removeClass('invisible'); }
					 *  },
					 */
					addLine : function(article_id, declinaison_id, designation,
							prix, prix_barre, taille, qte, img) {
						// Tout d'abord, l'article est-t-il déjà présent ?
						var currLine = this.getLigneForArticleId(article_id);
						if (currLine.size() == 1) {
							currLine.tuilePanier('addQte', qte);

							this.checkPanierVide();
							this.updateTotal();

							this.open();
							setTimeout($.proxy(this.open, this), 5);
							setTimeout($.proxy(this.open, this), 25);
							setTimeout($.proxy(this.open, this), 50);
							setTimeout($.proxy(this.open, this), 200);

							return;
						}

						var newLine = this.getLineClonable().clone();
						newLine.removeClass('clonable');

						newLine.attr('article_id', article_id);
						if (declinaison_id)
							newLine.attr('declinaison_id', declinaison_id);

						$('.nom', newLine).html(designation);
						if (prix_barre) {
							$('.prix', newLine)
									.html(
											'<span class="prix_barre">'
													+ number_format(prix_barre,
															2, '.', '')
													+ '&nbsp;&euro;</span>&nbsp; &nbsp;<span class="prix_vente">'
													+ number_format(prix, 2,
															'.', '')
													+ '&nbsp;&euro;</span>');
						} else {
							$('.prix', newLine).html(
									'<span class="prix_vente">'
											+ number_format(prix, 2, '.', '')
											+ '&nbsp;&euro;</span>');
						}
						$('.qte', newLine).html(qte);
						$('.taille', newLine).html(taille);

						newLine.tuilePanier({
							'caller' : this
						});
						if (img) {
							newLine.tuilePanier('setImg', img);
						}

						newLine.tuilePanier('save');

						$('.liste_tuiles_articles', this.options.content)
								.append(newLine);

						this.checkPanierVide();
						this.updateTotal();

						this.open();
						setTimeout($.proxy(this.open, this), 5);
						setTimeout($.proxy(this.open, this), 25);
						setTimeout($.proxy(this.open, this), 50);
						setTimeout($.proxy(this.open, this), 200);
					},
					isEmpty : function() {
						var blocks = $(
								'.liste_tuiles_articles > .article_block:not(.clonable)',
								this.options.content);
						if (blocks.size() > 0)
							return false;
						return true;
					},
					checkPanierVide : function() {
						if (this.isEmpty()) {
							$('.empty', this.options.content).removeClass(
									'hidden');
						} else {
							$('.empty', this.options.content)
									.addClass('hidden');
						}
					},
					getLineClonable : function() {
						return $('.clonable', this.options.content);
					},
					getLignesPanier : function() {
						return $(
								'.liste_tuiles_articles > .article_block:not(.clonable)',
								this.options.content);
					},
					getLigneForArticleId : function(article_id) {
						return $(
								'.liste_tuiles_articles > .article_block[article_id='
										+ article_id + ']',
								this.options.content);
					},
					updateTotal : function() {
						nb_articles = 0;
						prix_total = 0;

						var lignes = this.getLignesPanier();
						for (var i = 0; i < lignes.size(); i++) {
							var ligne = $(lignes.get(i));
							var qte = ligne.tuilePanier('getQuantite');
							var prix_ligne = ligne.tuilePanier('getPrixLigne');

							nb_articles += qte;
							prix_total += prix_ligne;
						}

						$('.qte_articles', this.options.button).html(
								nb_articles + ' Article'
										+ (nb_articles > 1 ? 's' : ''));
						$('.totalPanier', this.options.button).html(
								round(prix_total) + '&nbsp;&euro;');
						$('.sous-total-nb', this.options.content)
								.html(
										number_format(round(prix_total, 2), 2,
												'.', ' ')
												+ '&nbsp;&euro;');
					},
					removeLine : function(line) {
						// easy.
						line.remove();
						this.checkPanierVide();
						this.updateTotal();
					},
					options : {
						prefered_pos : 'bottom',
					}
				});

$.widget('seriel.tuilePanier', {
	_create : function() {
		// On récupère les valeurs.
		$('.remove_panier_line', this.element).bind('click',
				$.proxy(this.remove, this));
	},
	setImg : function(img_src) {
		var imgContainer = $('.img_container', this.element);
		var img = $(' > img', imgContainer);

		if (img_src) {
			if (img.size() == 1) {
				img.attr('src', img_src);
			} else {
				img = $('<img src="' + img_src + '" />');
				img.appendTo(imgContainer);
			}
			imgContainer.removeClass('no-picture');
		} else {
			if (img.size() > 0) {
				img.remove();
			}

			imgContainer.addClass('no-picture');
		}
	},
	getArticleId : function() {
		return this.element.attr('article_id');
	},
	getDeclinaisonId : function() {
		var decl_id = this.element.attr('declinaison_id');
		if (decl_id)
			return decl_id;
	},
	getQuantite : function() {
		return intval($('.qte', this.element).html());
	},
	addQte : function(qte) {
		this.setLoading();
		var orig_qte = this.getQuantite();
		var new_qte = orig_qte + qte;
		this.setQte(new_qte);
	},
	setQte : function(qte) {
		$('.qte', this.element).html(qte);
		this.save();
	},
	getTaille : function() {
		return $('.taille', this.element).html();
	},
	getPrixUnitaire : function() {
		// Soit le prix est directement dans .prix, soit il est dans .prix >
		// .prix_vente

		var prix_container = $('.prix > .prix_vente', this.element);
		if (prix_container.size() == 0)
			prix_container = $('.prix', this.element);

		var prix_str = prix_container.html();
		prix_str = str_replace(' ', '', prix_str);
		prix_str = str_replace('&nbsp;', '', prix_str);
		prix_str = str_replace(',', '.', prix_str);

		var prix = round(floatval(prix_str), 2);
		return prix;
	},
	getPrixLigne : function() {
		var prix_unitaire = this.getPrixUnitaire();
		var qte = this.getQuantite();

		var prix = round(prix_unitaire * qte, 2);
		return prix;
	},
	save : function() {
		// OK, let's save it.
		this.setLoading();

		var article_id = this.getArticleId();
		var declinaison_id = this.getDeclinaisonId();
		var quantite = this.getQuantite();
		var taille = this.getTaille();

		var datas = {
			'quantite' : quantite,
			'taille' : taille
		};
		if (declinaison_id)
			datas['declinaison_id'] = declinaison_id;

		$.post(getUrlPrefix() + '/article/ajouter/panier/' + article_id, datas,
				$.proxy(this.saved, this));
	},
	saved : function(result) {
		this.hideLoading();
	},
	remove : function() {
		this.setLoading();
		var article_id = this.getArticleId();
		$.post(getUrlPrefix() + '/article/supprimer/panier/' + article_id, $
				.proxy(this.removed, this));
	},
	removed : function() {
		this.options.caller.removeLine(this.element);
	},
	setLoading : function() {
		this.element.addClass('loading');
	},
	hideLoading : function() {
		this.element.removeClass('loading');
	},
	options : {
		caller : null,
		article_id : null,
		declinaison_id : null,
		taille : null,
		nom : null,
		qte : 0
	}
});

$.widget('seriel.ficheArticle', {
	_create : function() {
		$('.ajout_panier_button', this.element).bind('click',
				$.proxy(this.ajouter, this));
		$('.admin_button', this.element).bind('click',
				$.proxy(this.adminButtonClicked, this));

		$('.block_photos .mini-photo', this.element).bind('click',
				$.proxy(this.miniClicked, this));

		this.options.tailleSelect = $('select#taille_select', this.element);
		this.options.qteSelect = $('select#qte_select', this.element);

		this.options.tailleSelect.bind('change', $.proxy(this.tailleChanged,
				this));

		this.updateMaxQte();
	},
	tailleChanged : function() {
		var currTaille = this.options.tailleSelect.val();
		available = true;

		if (currTaille) {
			var opt = $(' > option[value="' + currTaille + '"]',
					this.options.tailleSelect);
			if (opt.size() == 1) {
				if (opt.hasClass('not_available'))
					available = false;
			}
		}

		if (available)
			this.options.tailleSelect.removeClass('not_available');
		else
			this.options.tailleSelect.addClass('not_available');

		this.updateMaxQte();
	},
	getArticleIdFromCurrentTaille : function() {
		var currTaille = this.options.tailleSelect.val();
		available = true;

		if (currTaille) {
			var opt = $(' > option[value="' + currTaille + '"]',
					this.options.tailleSelect);
			if (opt.size() == 1) {
				var article_id = opt.attr('composant_id');
				if (article_id)
					return article_id;
			}
		}

		return null;
	},
	getCurrentMaxQte : function() {
		var options = $(' > option', this.options.qteSelect);
		var max = 0;
		for (var i = 0; i < options.size(); i++) {
			var val = intval($(options.get(i)).attr('value'));
			if (val > max)
				max = val;
		}
		return max;
	},
	updateMaxQte : function() {
		var curQte = this.options.qteSelect.val();
		var currMaxQte = this.getCurrentMaxQte();

		var currTaillStock = 0;
		var currTaille = this.options.tailleSelect.val();

		var newMaxQte = 15;
		if (!currTaille) {
			curQte = 0;
			// On autorise par défaut une quantité de 20, on ne fait rien.
		} else {
			if ((!curQte) || intval(curQte) == 0)
				curQte = 1;
			var opt = $(' > option[value="' + currTaille + '"]',
					this.options.tailleSelect);
			if (opt.size() == 1) {
				newMaxQte = opt.attr('stock');
			}
		}

		if (currMaxQte == newMaxQte)
			return;
		// On construit le nouveau select.
		var qteOpts = [];
		var optsHtml = (newMaxQte > 0) ? '<option value="0">Quantité</option>'
				: '<option value="">Taille non disponible</option>';

		for (var i = 1; i <= newMaxQte; i++) {
			optsHtml += '<option value="' + i + '">' + i + '</option>';
		}

		this.options.qteSelect.html(optsHtml);
		if (curQte) {
			if (curQte > newMaxQte) {
				this.options.qteSelect.val(newMaxQte);
			} else {
				this.options.qteSelect.val(curQte);
			}
		}
	},
	miniClicked : function(event) {
		var target = $(event.currentTarget);
		$('.block_photos .mini-photo.selected', this.element).removeClass(
				'selected');
		target.addClass('selected');

		var artNum = target.attr('num');
		this.showArt(artNum);
	},
	showArt : function(num) {
		$('.apercu-article img', this.element).addClass('hidden');
		$('.apercu-article img[num=' + num + ']', this.element).removeClass(
				'hidden');
	},
	adminButtonClicked : function(event) {
		var target = $(event.currentTarget);
		var article_id = target.attr('article_id');

		var article_nom = $('.nom_article', this.element).html();

		openModal(article_nom, getUrlPrefix() + '/admin/article/' + article_id,
				{
					'width' : 1200,
					'height' : 700
				});
	},
	ajouter : function() {
		var article_id = $('.ajout_panier_button', this.element).attr(
				'article_id');

		var taille = this.options.tailleSelect.val();
		var qte = intval(this.options.qteSelect.val());

		if ((!taille) && qte <= 0) {
			alert('Veuillez selectionner une taille et une quantite');
			return;
		}
		if (!taille) {
			alert('Veuillez selectionner une taille');
			return;
		}
		if (qte <= 0) {
			alert('Veuillez saisir une quantite');
			return;
		}

		// var datas = { 'taille': taille, 'quantite': qte };

		var article_id = this.getArticleId();
		var declinaison_id = this.getDeclinaisonId();
		var designation = this.getDesignation();
		var prix = this.getPrix();
		var prix_barre = this.getPrixBarre();
		var img = this.getImg();

		if (declinaison_id && (!article_id)) {
			// On récupère l'article_id par la taille.
			article_id = this.getArticleIdFromCurrentTaille();
		}

		// alert('['+article_id+'] ['+declinaison_id+']');

		panier().addLine(article_id, declinaison_id, designation, prix,
				prix_barre, taille, qte, img);

		// $.post(getUrlPrefix() + '/article/ajouter/panier/'+article_id, datas,
		// $.proxy(this.addTuilePanier,this));
	},
	added : function() {

	},
	getDesignation : function() {
		return $('.description_fiche_article > .nom_article', this.element)
				.html();
	},
	getPrixBarre : function() {
		var prix_barre_container = $('.description_fiche_article .prix_barre',
				this.element);
		if (prix_barre_container.size() == 1) {
			var prix_str = prix_barre_container.html();
			var prix_str = str_replace(' ', '', prix_str);
			var prix_str = str_replace('&nbsp;', '', prix_str);

			return floatval(prix_str);
		}
		return null;
	},
	getPrix : function() {
		var prix_str = $('.prix_vente', this.element).html();
		var prix_str = str_replace(' ', '', prix_str);
		var prix_str = str_replace('&nbsp;', '', prix_str);

		return floatval(prix_str);
	},
	getImg : function() {
		var img = $('.other-photo > .mini-photo:first-child > img',
				this.element);
		if (img.size() == 1) {
			return img.attr('src');
		}
		return '';
	},
	getArtId : function() {
		return $('.art_id', this.element).html();
	},
	getArticleId : function() {
		return $('.article_id', this.element).html();
	},
	getDeclinaisonId : function() {
		return $('.declinaison_id', this.element).html();
	},
	addTuilePanier : function(result) {
		var res = $(result);
		var tuile = $('.article_block', res);
		$('.pan_widget').myPanier('ajouterArticlePanier', tuile);
	},
	options : {
		tailleSelect : null,
		qteSelect : null
	}
});
$.widget('seriel.editInfoPerso',
		{
			_create : function() {
				this.initForm();
				$('.btn', this.element).bind('click',
						$.proxy(this.okclicked, this));
			},
			initForm : function() {
				this.options.form = $('form', this.element);
				this.options.form.bind('submit', $.proxy(this.save, this));
			},
			okclicked : function() {
				// alert('okClicked');
				this.options.form.trigger('submit');
			},
			save : function(event) {
				event.stopPropagation();
				var datas = this.options.form.serializeArray();

				$.post(getUrlPrefix() + '/compte/infos_perso', datas, $.proxy(
						this.saved, this));
				return false;
			},
			saved : function(result) {
				var res = $(result);
				if (res.hasClass('success')) {
					showAlert('enregistrement succes',
							'Informations bien enregistrée');

				} else {
					this.options.form.html($('form', res).html());
					this.initForm();

				}

			},
			options : {
				form : null
			}
		});

$.widget('seriel.pageCompte', {
	_create : function() {
	},
	addClient : function() {
		$
				.post(getUrlPrefix() + '/addAccount', $.proxy(
						this.saisieClient, this));
	},
	saisieClient : function(result) {
		$('.container-fluid', this.element).html($(result));
		this.options.form = $('form', this.element);
		$('.client > .button', this.element).bind('click',
				$.proxy(this.saveButtonClicked, this));
		this.options.form.bind('submit', $.proxy(this.save, this));
	},
	save : function(event) {
		event.stopPropagation();
		var datas = this.options.form.serializeArray()
		var mdp1 = $('.mdp1', this.element).val();
		var mdp2 = $('.mdp2', this.element).val();

		if (mdp1 == mdp2) {
			if (mdp1 != '' && mdp1 != ' ') {
				datas['mdp'] = mdp1;
				$.post(getUrlPrefix() + '/addAccount', datas, $.proxy(
						this.returnAccueil, this));
			} else {
				alert('le mot de passe ne doit pas etre vide');
			}
			return false;
		}
		alert('Les mots de passes ne correspondent');
		return false;
	},
	returnAccueil : function(result) {
		alert('accueil');
	},
	saveButtonClicked : function() {
		this.options.form.trigger('submit');
	},
	options : {

	}
});

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
		if (isIE.lowerThan9()) {
			this.element.appendTo(this.options.container);
			this.element.css('width', '100%')
		} else {
			this.element.remove();
		}
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

$
		.widget(
				'seriel.carousel',
				{
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
						if (isIE.lowerThan9()) {
							var curr = null;
							for (var i = 0; i < this.options.elements.size(); i++) {
								var elem = $(this.options.elements.get(i));
								var display = elem.css('display');
								if (display == 'block') {
									curr = elem;
								}
							}

							return curr;
						}
						var maxOpacity = 0;
						var curr = null;
						for (var i = 0; i < this.options.elements.size(); i++) {
							var elem = $(this.options.elements.get(i));
							var op = floatval(elem.css('opacity'));
							if (curr == null || op > maxOpacity) {
								curr = elem;
								maxOpacity = op;
							}
						}

						return curr;
					},
					gotoElem : function(index) {
						if (isSmallDisplay()) {
							this.gotoElemReal(index)
						} else {
							setTimeout($.proxy(function() {
								this.gotoElemReal(index)
							}, this), 50);
						}
					},
					gotoElemReal : function(index) {
						index = intval(index);
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

						if (isIE.lowerThan9() && dataCarImg) {
							dataCarImg.checkImg8IE();
						}

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

$
		.widget(
				'seriel.siteManager',
				{
					_create : function() {
						var href = document.location.href;
						if (strpos(href, 'app_dev.php') > 0)
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

						if (isMobile.iOS())
							this.options.bodyClass = 'iOS';
						if (isMobile.Android())
							this.options.bodyClass = 'Android';
						if (isMobile.BlackBerry())
							this.options.bodyClass = 'BlackBerry';
						if (isMobile.Opera())
							this.options.bodyClass = 'Opera';
						if (isMobile.Windows())
							this.options.bodyClass = 'Windows';
						if (isIE.any()) {
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
						}

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
						if (count(to_infos) == 0) {
							// On revient a la page d'accueiL.
							$('body')
									.removeClass(
											'homme femme enfant drap-de-plage panier compte admin contact commande feria register');
							$('body').addClass('accueil');
							this.navigate('');

						} else {
							var first_level = to_infos[0];
							var second_level = to_infos[1];
							if (count(to_infos) > 1) {
								var label = first_level.getLabel() + '/'
										+ second_level.getLabel()
							} else {
								var label = first_level.getLabel();
							}

							if (label == '') {
								$('body')
										.removeClass(
												'homme femme enfant drap-de-plage panier compte admin contact commande feria register');
								$('body').addClass('accueil');
								this.navigate('');
							} else {
								var label = first_level.getLabel();
								// alert(label);
								$('body').addClass(label);
								var classes = [ 'accueil', 'homme', 'femme',
										'enfant', 'drap-de-plage', 'panier',
										'compte', 'admin', 'contact',
										'commande', 'feria', 'register' ];
								for ( var i in classes) {
									cl = classes[i];
									if (cl != label && $('body').hasClass(cl)) {
										$('body').removeClass(cl);
									}
								}
								// $('body').removeClass();
								// alert('test 1');
								$('body').addClass(label);
								// alert('test 2');

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
						if (count(elems) > 0) {
							first = elems[0].getLabel();
							if (count(elems) > 1) {
								second = elems[1].getLabel();
								if (count(elems) > 2) {
									third = elems[2].getLabel();
								}
							}
						}

						var tab = label.split('/');
						/*
						 * var first = tab[0]; var second = tab[1];
						 */
						console.log('test label : ' + label);

						$('.main_menu > li', this.element).removeClass(
								'selected');
						if (label) {
							$('.main_menu > li.' + first, this.element)
									.addClass('selected');
						}
						if (!third) {
							$('.indicateur', this.element).css('visibility',
									'hidden');
							$('body').removeClass('fiche_produit');
							$('body').addClass(first);

							if (first == 'homme' || first == 'femme'
									|| first == 'enfant'
									|| first == 'drap-de-plage'
									|| first == 'feria') {
								cat().navigate();
								return;

								/*
								 * if(first == 'homme'){
								 * $('.indicateur',this.element).css('visibility','visible');
								 * if(!second){ $('.indicateur > div >
								 * .principal',this.element).html('homme');
								 * $('.indicateur > div >
								 * .secondaire',this.element).css('visibility','hidden');
								 * }else{ $('.indicateur > div >
								 * .principal',this.element).html(second);
								 * $('.indicateur > div >
								 * .secondaire',this.element).html('homme');
								 * $('.indicateur > div >
								 * .secondaire',this.element).css('visibility','visible'); }
								 * 
								 * $('.catalogue',this.element).addClass('loading');
								 * 
								 * if(second){ $.post(getUrlPrefix() +
								 * '/catalogue/homme/'+second,$.proxy(this.afficherContenu));
								 * }else{ $.post(getUrlPrefix() +
								 * '/catalogue/homme',$.proxy(this.afficherContenu)); }
								 * return; } else if (first=='femme') {
								 * $('.indicateur',this.element).css('visibility','visible');
								 * if(!second){ $('.indicateur > div >
								 * .principal',this.element).html('femme');
								 * $('.indicateur > div >
								 * .secondaire',this.element).css('visibility','hidden');
								 * }else{ $('.indicateur > div >
								 * .principal',this.element).html(second);
								 * $('.indicateur > div >
								 * .secondaire',this.element).html('femme');
								 * $('.indicateur > div >
								 * .secondaire',this.element).css('visibility','visible'); }
								 * 
								 * $('.catalogue',this.element).addClass('loading');
								 * 
								 * if(second){ $.post(getUrlPrefix() +
								 * '/catalogue/femme/'+second,$.proxy(this.afficherContenu));
								 * }else{ $.post(getUrlPrefix() +
								 * '/catalogue/femme',$.proxy(this.afficherContenu)); }
								 * return; } else if (first=='enfant'){
								 * $('.indicateur',this.element).css('visibility','visible');
								 * if(!second){ $('.indicateur > div >
								 * .principal',this.element).html('enfant');
								 * $('.indicateur > div >
								 * .secondaire',this.element).css('visibility','hidden');
								 * }else{ $('.indicateur > div >
								 * .principal',this.element).html(second);
								 * $('.indicateur > div >
								 * .secondaire',this.element).html('enfant');
								 * $('.indicateur > div >
								 * .secondaire',this.element).css('visibility','visible'); }
								 * $('.catalogue',this.element).addClass('loading');
								 * if(second){ $.post(getUrlPrefix() +
								 * '/catalogue/enfant/'+second,$.proxy(this.afficherContenu));
								 * }else{ $.post(getUrlPrefix() +
								 * '/catalogue/enfant',$.proxy(this.afficherContenu)); }
								 * return; } else if (first=='drap-de-plage') {
								 * $('.indicateur',this.element).css('visibility','visible');
								 * $('.catalogue',this.element).addClass('loading');
								 * if(!second){ $('.indicateur > div >
								 * .principal',this.element).html('drap de
								 * plage'); $('.indicateur > div >
								 * .secondaire',this.element).css('visibility','hidden');
								 * }else{ $('.indicateur > div >
								 * .principal',this.element).html(second);
								 * $('.indicateur > div >
								 * .secondaire',this.element).html('drap de
								 * plage'); $('.indicateur > div >
								 * .secondaire',this.element).css('visibility','visible'); }
								 * 
								 * $.post(getUrlPrefix() +
								 * '/catalogue/drap-de-plage',$.proxy(this.afficherContenu));
								 * return;
								 */
							} else if (first == '') {
								$('.indicateur', this.element).css('display',
										'none');
								var cloned = $('<div></div>');
								for (var i = 0; i < this.options.accueilImgs
										.size(); i++) {
									cloned.append($(
											this.options.accueilImgs.get(i))
											.clone());
								}
								$('.slider', this.element).carousel('update',
										$(' > img', cloned));
								// $.post(getUrlPrefix() +
								// '/catalogue/accueil',$.proxy(this.afficherContenu));
								return;
							} else if (first == 'panier') {
								$('.panier', this.element).addClass('loading');

								if (!second) {
									$.post(getUrlPrefix() + '/panier', $
											.proxy(this.afficherPanier));
									return;
								} else {
									if (second == 'compte') {
										// Let's rock and roll !!
										var clone = this.options.compteImgs
												.clone();
										var datas = {
											'client' : true
										};

										$('body').addClass('compte');
										$('body').removeClass('panier');

										$('.slider', this.element).carousel(
												'update', $(' > img', clone));

										// alert($('.isClient').html());
										// if($('.isClient').html() == 1 ){
										if (is_client()) {
											$('.page_connexion_container')
													.load(
															getUrlPrefix()
																	+ '/compte',
															datas);
										} else {
											// $('.page_connexion_container').load(getUrlPrefix()
											// + '/compte');
											$('#register').css('display',
													'none');
											$('.page_connexion_container').css(
													'display', 'block');
											$('#login_client', this.element)
													.load(
															getUrlPrefix()
																	+ '/login',
															datas,
															$
																	.proxy(
																			this.loginClientLoaded,
																			this));

											// $('.not-client',this.element).bind('click',$.proxy(this.addAccount,this));
										}

										return;
									}
								}

							} else if (first == 'compte') {
								if (!is_client()) {
									$('#register').css('display', 'none');
									$('.page_connexion_container').css(
											'display', 'block');
									$('#login_client', this.element).load(
											getUrlPrefix() + '/login?client=1',
											$.proxy(this.loginClientLoaded,
													this));
								} else {
									var menu_compte = $('.page_compte > .menu_admin');
									if (menu_compte.size() == 1) {
										init_menu_compte();
										menu_compte.menuCompte('checkHash');
									} else {
										$('.page_compte')
												.load(
														getUrlPrefix()
																+ '/compte/menu',
														init_menu_compte);
									}
								}

								/*
								 * 
								 * var clone = this.options.compteImgs.clone();
								 * var datas = {'client':true};
								 * 
								 * $('.slider',this.element).carousel('update',
								 * $(' > img', clone));
								 * 
								 * console.log("client "+is_client()+" admin
								 * "+is_admin())
								 * 
								 * if(is_client()||is_admin()) {
								 * 
								 * $('.page_connexion_container',this.element).load(getUrlPrefix() +
								 * '/compte',datas);
								 * 
								 * if( is_client() ) { if (second) { if (second ==
								 * "liste_commandes") { $('.compte > div >
								 * .submenu > ul > li> a',
								 * this.element).removeClass('active');
								 * console.log('remove class active');
								 * $('.commandes',
								 * this.element).addClass('active')
								 * console.log('on ajoute active sur le bon');
								 * $('#content_compte',
								 * this.element).load(getUrlPrefix() +
								 * '/compte/liste_commandes', datas,
								 * $.proxy(this.listeCommandesLoaded, this));
								 * console.log('on charge la nouvelle page');
								 * //return; } else if(second == "liste_avoirs") {
								 * $('.compte > div > .submenu > ul > li > a',
								 * this.element).removeClass('active');
								 * $('.avoirs',
								 * this.element).addClass('active');
								 * $('#content_compte',
								 * this.element).load(getUrlPrefix() +
								 * '/compte/liste_avoirs', datas,
								 * $.proxy(this.listeAvoirsLoaded, this));
								 * //return; } else if(second=="infos_perso"){
								 * $('.compte > div > .submenu > ul > li > a',
								 * this.element).removeClass('active');
								 * $('.infos_perso',
								 * this.element).addClass('active');
								 * 
								 * $('#content_compte',
								 * this.element).load(getUrlPrefix() +
								 * '/compte/infos_perso', datas,
								 * $.proxy(this.infosLoaded, this));
								 * 
								 * //return false; } else if(second ==
								 * "mes_adresses"){ $('.compte > div > .submenu >
								 * ul > li > a',
								 * this.element).removeClass('active');
								 * $('.infos_adresses',
								 * this.element).addClass('active');
								 * $('#content_compte',
								 * this.element).load(getUrlPrefix() +
								 * '/compte/mes_adresses', datas,
								 * $.proxy(this.adressesLoaded, this));
								 * //return; }else {
								 * 
								 * $('#content_compte',
								 * this.element).load(getUrlPrefix() +
								 * '/compte/' + second, datas,
								 * $.proxy(this.detailCommande, this)); } } else {
								 * console.log('compte'); //on veut la page
								 * vierge $('.content_compte',
								 * this.element).html(''); } return; } else if(
								 * is_admin() ){ // admin if (second) {
								 * 
								 * //if( $("#content_compte").html() == "") //
								 * $('.admcompte.container-fluid').load(getUrlPrefix() +
								 * '/admcompte',datas);
								 * 
								 * if (second == "frais_livraison") { $('.compte >
								 * div > .submenu > ul > li> a',
								 * this.element).removeClass('active');
								 * $('.frais_livraison',
								 * this.element).addClass('active')
								 * $('#content_compte',
								 * this.element).load(getUrlPrefix() +
								 * '/admcompte/frais_livraison', datas,
								 * $.proxy(this.listeFraisLivraisonLoaded,
								 * this)); } else if (second ==
								 * "liste_commandes") { $('.compte > div >
								 * .submenu > ul > li> a',
								 * this.element).removeClass('active');
								 * $('.commandes',
								 * this.element).addClass('active')
								 * $('#content_compte',
								 * this.element).load(getUrlPrefix() +
								 * '/admcompte/liste_commandes', datas,
								 * $.proxy(this.listeCommandesLoaded, this)); }
								 * else { if (second == "liste_avoirs") {
								 * $('.compte > div > .submenu > ul > li > a',
								 * this.element).removeClass('active');
								 * $('.avoirs',
								 * this.element).addClass('active');
								 * $('#content_compte',
								 * this.element).load(getUrlPrefix() +
								 * '/admcompte/liste_avoirs', datas,
								 * $.proxy(this.listeAvoirsLoaded, this)); }
								 * else { $('#content_compte',
								 * this.element).load(getUrlPrefix() +
								 * '/admcompte/' + second, datas,
								 * $.proxy(this.listeAvoirsLoaded, this)); } } }
								 * else {
								 * //$('.admcompte.container-fluid').load(getUrlPrefix() +
								 * '/admcompte',datas); //on veut la page vierge
								 * $('.content_compte', this.element).html(''); }
								 *  } } else {
								 * //$('.page_connexion_container').load(getUrlPrefix() +
								 * '/compte');
								 * $('#register').css('display','none');
								 * $('.page_connexion_container').css('display','block');
								 * $('#login_client',this.element).load(getUrlPrefix() +
								 * '/login',datas,
								 * $.proxy(this.loginClientLoaded, this));
								 * 
								 * //$('.not-client',this.element).bind('click',$.proxy(this.addAccount,this)); }
								 */

								return;
							} else if (first == 'admin') {
								var clone = this.options.adminImgs.clone();
								$('.slider', this.element).carousel('update',
										$(' > img', clone));

								var datas = {
									"admin" : true
								};
								if (!is_admin()) {
									$('#admin_login_block')
											.load(
													getUrlPrefix() + '/login',
													datas,
													$
															.proxy(
																	this.loginAdminLoaded,
																	this));
								} else {
									// Ok, on affiche le menu
									// Est-ce que le menu admin est chargé ???
									var menu_admin = $('.page_admin > .menu_admin');
									if (menu_admin.size() == 1) {
										menu_admin.menuAdmin('checkHash');
									} else {
										$('.page_admin').load(
												getUrlPrefix() + '/admin/menu',
												init_menu_admin);
									}

									// hc().setHash('compte');
								}

								// $('#identifiant_admin').focus().select();
								// $('#password_admin').val('');

								return;
							} else if (first == 'commande') {
								if (second == 'livraison') {
									if ($('.page_commande').html() == "")
										hc().setHash('commande');
									else
										this.formCommandeLivraisonLoaded();
								} else if (second == 'paiement') {
									if ($('.page_commande').html() == "")
										hc().setHash('commande');
									else
										this.formCommandePaiementLoaded();
								} else
									$('.page_commande').load(
											getUrlPrefix() + '/commande',
											$.proxy(this.formCommandeLoaded,
													this));
							} else if (first == 'register') {
								$('#register').load(
										getUrlPrefix() + '/compte/addAccount',
										$.proxy(this.formAccountLoaded, this));
							} else if (first == 'contact') {
								$('#slider', this.element).carousel('update',
										$(' > img', clone));
								$('.page_contact', this.element).load(
										getUrlPrefix() + '/contact',
										$.proxy(this.contactLoaded, this));
							}
						} else {
							$('.catalogue', this.element).addClass('loading');
							$('.indicateur', this.element).css('display',
									'none');
							$('body').addClass('fiche_produit');
							third = urlencode(third);
							if (second) {
								$.post(getUrlPrefix() + '/catalogue/' + first
										+ '/' + second + '/' + third, $
										.proxy(this.afficherFicheArticle));
							} else {
								$.post(getUrlPrefix() + '/catalogue/' + first
										+ '//' + third, $
										.proxy(this.afficherFicheArticle));
							}

						}
					},
					menuAdminLoaded : function(result) {

					},
					listeFraisLivraisonLoaded : function() {
						$('#content_compte', this.element).fraisLivraison();
						$('#content_compte', this.element).fraisLivraison(
								"init");
					},
					infosLoaded : function() {
						$('#content_compte', this.element).editInfoPerso();
					},
					listeCommandesLoaded : function() {
						$('#content_compte', this.element).listesCommandes();
						$('#content_compte', this.element).listesCommandes(
								'init');
						console.log('commandes loaded');
						// return;
					},
					listeAvoirsLoaded : function() {
						console.log('avoirs loaded');
						// return;
					},
					adressesLoaded : function() {
						$('#content_compte', this.element).editAdresses();
					},
					detailCommande : function() {
						// return
					},
					contactLoaded : function() {
						$('.page_contact', this.element).pageContact();
					},
					formAccountLoaded : function() {
						// à voir car je ne comprend pas le truc...
						// $(".page_compte").css("opacity","1");
						// $(".page_compte").css("max-height",($(document).height())+"px")
						$("body").addClass("compte");
						// .......................................
						$('#register', this.element).css('display', 'block');
						$('.page_connexion_container').css('display', 'none');
						$('#register').addAccount();
					},
					formCommandeLoaded : function() {
						$('.page_commande > div.container-fluid').commande();
					},
					formCommandeLivraisonLoaded : function() {
						$('.page_commande > div.container-fluid').commande(
								'showStep2');
					},
					formCommandePaiementLoaded : function() {
						$('.page_commande > div.container-fluid').commande(
								'showStep3');
					},
					loginClientLoaded : function() {
						$('.page_compte .page_connexion_container')
								.ser_clientLogin();
						// $('#login_client').ser_clientLogin();
					},
					loginAdminLoaded : function() {
						$('#admin_login_block > .admin').ser_adminLogin();
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

						/*
						 * $('.catalogue',this.element).html(res.html());
						 * $('.catalogue',this.element).removeClass('loading');
						 */

					},
					afficherFicheArticle : function(result) {
						// $('.slider',this.element).hide();
						var res = $(result);

						$('.catalogue', this.element).html(res);
						$('.catalogue > div', this.element).ficheArticle();

						$('.catalogue', this.element).removeClass('loading');

					},
					afficherPanier : function(result) {
						var res = $(result); // on a le bon resultat

						$('.page_panier', this.element).html(res);
						$('.page_panier .panier', this.element).pagePanier();
						$('.panier', this.element).removeClass('loading');
					},
					/*
					 * afficherCompte: function(result) {
					 * //$('.slider',this.element).hide(); alert('test'); var
					 * res = $(result); $('#register',this.element).html(res);
					 * $('#register',this.element).css('display','block');
					 * 
					 * $('.page_compte',this.element).pageCompte(); },
					 */

					showSubMenu : function(page) {
						$("#header > .header_bottom > .submenu").hide();
						$("#header > .header_bottom .submenu ul li")
								.removeClass("selected");
						// show/hide submenu bg
						if ($("#header > .header_bottom > .submenu > ul[rel='"
								+ page + "']").length > 0)
							$("#header > .header_bottom > .submenu_bg").show();
						else
							$("#header > .header_bottom > .submenu_bg").hide();
						// show/hide submenu
						$(
								"#header > .header_bottom > .submenu > ul[rel='"
										+ page + "']").parent().show();
						// if a submenu is selected
						if ($("#header > .header_bottom > .submenu > ul > li > a[href='#"
								+ page + "']").length > 0) {
							// show bg
							$("#header > .header_bottom > .submenu_bg").show();
							// show submenu on loading
							$(
									"#header > .header_bottom > .submenu > ul > li > a[href='#"
											+ page + "']").closest(".submenu")
									.show();
							// add class selected on li parent and child
							$(
									"#header > .header_bottom > .submenu > ul > li > a[href='#"
											+ page + "']").parent().addClass(
									"selected");
							var rel = $(
									"#header > .header_bottom > .submenu > ul > li > a[href='#"
											+ page + "']").closest("ul").attr(
									"rel");
							$("#header > .header_bottom .menu ul li." + rel)
									.addClass("selected");
						}
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

$
		.widget(
				'seriel.pagePanier',
				{
					_create : function() {
						$('.delete', this.element).bind('click',
								$.proxy(this.deleteLigne, this));
						$('.qte', this.element).bind('change',
								$.proxy(this.autocalc, this));
						this.autocalc();
						this.options.commandButton = $('.command-button',
								this.element);
						this.options.commandButton.bind('click', $.proxy(
								this.commander, this));

						this.hideLoading();
					},
					commander : function() {

						if (is_client()) {
							this.setLoading();
							this.gotoCommande();
							return;
						}

						_setModeCommandeOn();
						hc().setHash('compte');
					},
					gotoCommande : function() {
						this.setLoading();
						var data = {};
						$(".ligne", this.element)
								.each(
										function(index) {
											data["a_"
													+ $(this)
															.attr("article_id")] = $(
													this).find(".qte").val();
										});
						console.log("data " + data);
						$.post(getUrlPrefix() + '/panier/modifyQtePanier',
								data, $.proxy(this.gotoCommandeLoaded, this))
					},
					gotoCommandeLoaded : function(data) {
						if (data.msg == "ok") {
							hc().setHash('commande');
						} else {
							showAlert("Erreur",
									"Erreur durant la sauvegarde des données");
						}
						this.hideLoading();
					},

					deleteLigne : function(event) {
						this.setLoading();
						var target = $(event.currentTarget);
						var ligne_id = target.attr('ligne_id');
						$.post(getUrlPrefix() + '/panier/deleteLigne/'
								+ ligne_id, $.proxy(this.ligneDeleted, this));
					},
					ligneDeleted : function(result) {
						var res = $(result);
						if (res.hasClass('success')) {
							var article_id = res.attr('article_id');
							this.hideLineForArticleId(article_id);
							this.autocalc();
						}

						this.hideLoading();
					},
					hideLineForArticleId : function(article_id) {
						$('.ligne[article_id=' + article_id + ']', this.element)
								.remove();
					},
					autocalc : function() {
						var total = 0;

						var lignes = $('.ligne', this.element);
						for (var i = 0; i < lignes.size(); i++) {
							var ligne = $(lignes.get(i));
							var prix_str = $('.prix_article', ligne).html();
							prix_str = str_replace(' ', '', prix_str);
							prix_str = str_replace('&nbsp;', '', prix_str);
							prix_str = str_replace(',', '.', prix_str);
							var prix = floatval(prix_str);

							var qte_input = $('.qte', ligne);
							var qte = intval(qte_input.val());

							qte_input.attr('last_checked', qte);

							var total_ligne = round(prix * qte, 2);
							$('.total_article', ligne).html(
									number_format(total_ligne, 2, '.', '')
											+ '&nbsp;&euro;');

							total = total + parseFloat(total_ligne);
						}

						var prix_liv_str = $('.prix_liv', this.element).html();
						if (prix_liv_str) {
							prix_liv_str = str_replace(' ', '', prix_liv_str);
							prix_liv_str = str_replace('&nbsp;', '',
									prix_liv_str);
							prix_liv_str = str_replace(',', '.', prix_liv_str);

							var prix_liv = floatval(prix_liv_str);
							total += prix_liv;
						}

						var ht = round(total / 1.2, 2);
						var tva = round(total - ht, 2);

						$('.prix_ht > span', this.element).html(
								number_format(ht, 2, '.', '') + '&nbsp;&euro;');
						$('.prix_tva > span', this.element)
								.html(
										number_format(tva, 2, '.', '')
												+ '&nbsp;&euro;');
						$('.prix_ttc > span', this.element).html(
								number_format(total, 2, '.', '')
										+ '&nbsp;&euro;');

						if (lignes.size() == 0)
							$('.command-button', this.element).hide();
						else
							$('.command-button', this.element).show();

					},
					setLoading : function() {
						this.element.parent().addClass('loading');
					},
					hideLoading : function() {
						this.element.parent().removeClass('loading');
					},
					options : {
						commandButton : null
					}
				});

$.widget('seriel.commande', {
	_create : function() {

		this.hideLoading();
		this.initForm();
		$(".recap ._l ._p").hide();
		$(".addresse_livraison input:radio").change(function() {
			if ($(this).val() == "1") {
				$(".form_adresse_livraison").fadeIn();
			} else
				$(".form_adresse_livraison").fadeOut();
		});

		$('.step1', this.element).bind('click',
				$.proxy(this.step1Clicked, this));
		$('.step2', this.element).bind('click',
				$.proxy(this.step2Clicked, this));
		$('.step3', this.element).bind('click',
				$.proxy(this.step3Clicked, this));
		var that = this;
		$(".step2-container ._livchk").change(function() {
			if ($(this).val() == "mondial_relay") {
				that._initMondialRelay();
				$(".mondial_relay_div").fadeIn();
			} else {
				$(".mondial_relay_div").fadeOut();
				$("#_pointRelais").html("");
			}
		});

		if ($(document).height() < 768)
			$("._livlabel", this.element).css("float", "right");

	},
	initForm : function() {
		console.log("init form commande")
		this.options.form1 = $('.form1', this.element);
		this.options.form2 = $('.form2', this.element);
		this.options.submit = $('.submit', this.element).bind('click',
				$.proxy(this.save_livraison, this));
		this.options.submit2 = $('.submit2', this.element).bind('click',
				$.proxy(this.save_mode_livraison, this));
		this.options.submit3 = $('.submit3', this.element).bind('click',
				$.proxy(this.payNow, this));
	},
	saveClicked : function() {
		this.setLoading();
		this.options.submit.trigger('click');
		return false;
	},
	save_livraison : function(event) {
		event.stopPropagation();
		var formDatas = this.options.form1.serializeArray();
		var datas = {};
		datas['form1'] = this.options.form1.serializeJSON();
		datas['form2'] = this.options.form2.serializeJSON();
		datas['liv'] = $("input[name='choose_address']:checked").val();
		$.post(getUrlPrefix() + '/commande', datas, $.proxy(
				this.saved_livraison, this));
		return false;
	},
	saved_livraison : function(result) {
		var res = $(result);
		if (res.hasClass("success")) {
			this.options.pass1 = true;
			hc().setHash("commande/livraison");
			this.hideLoading();
		} else {
			$('form', this.element).html($('form', res).html());
			this.initForm();
		}
	},
	payNow : function() {
		$("#systempay-form").submit();
	},
	save_mode_livraison : function(event) {
		var datas = {};
		datas['m'] = $("input[name='livraison']:checked").val();
		$.post(getUrlPrefix() + '/commande/savemodelivraison', datas, $.proxy(
				this.save_mode_livraisonLoaded, this));
	},
	save_mode_livraisonLoaded : function(data) {
		if (data.msg == "ok") {
			this.gotoPaiement();
		} else {
			showAlert("Erreur",
					"Erreur durant la sauvegarde du mode de livraison...");
		}
	},
	gotoPaiement : function() {
		var datas = {};
		datas['m'] = $("input[name='livraison']:checked").val();
		$.post(getUrlPrefix() + '/commande/getPaiementForm', datas, $.proxy(
				this.gotoPaiementLoaded, this));
	},
	gotoPaiementLoaded : function(data) {

		if (data.msg == "ok") {

			$("#systempay-form").html(data.html)

			this.options.pass2 = true;
			hc().setHash("commande/paiement");
		} else {
			showAlert("Erreur",
					"Erreur durant la sauvegarde du mode de livraison...");
		}
	},
	_getCodePostal : function() {
		var cp = $(".form1 input[name='form[cp]']").val();
		if ($(".addresse_livraison input:radio:checked").val() == "1")
			cp = $(".form2 input[name='form[cp]']").val();

		return cp;
	},
	_initMondialRelay : function() {
		var cp = this._getCodePostal();
		if ($(".mondial_relay_div").html() == "") { // @TODO refresh doesnt work
			$(".mondial_relay_div").MR_ParcelShopPicker(
					{
						// Target: "#_pointRelais", // Selecteur JQuery de
						// l'élément dans lequel sera renvoyé l'ID du Point
						// Relais sélectionné (généralement un champ input
						// hidden)
						Brand : "BDTEST  ", // Votre code client Mondial Relay
						// Country: "FR", // Code ISO 2 lettres du pays utilisé
						// pour la recherche
						PostCode : cp,
						// EnableGeolocalisatedSearch: "true",
						OnParcelShopSelected : // Permet l'appel d'une fonction
												// lors de la selection d'un
												// Point Relais
						function(data) { // Implémentation de la fonction de
											// traitement, le paramètre Data
											// contient un objet avec les
											// informations du Point Relais

							// Remplace les données de la balise ayant l'Id
							// "cb_ID" par le contenu html de data.ID
							// "data" est le paramètre reçu par la fonction,
							// sont contenu est inconnu à la compilation
							// "ID" est contenu dans "data", il pourrait y avoir
							// une erreur si "ID" n'existe pas dans la variable
							// "data" reçue en paramètre
							/*
							 * $("#cb_ID").html(data.ID);
							 * 
							 * $("#cb_Nom").html(data.Nom);
							 * $("#cb_Adresse").html(data.Adresse1 + ' ' +
							 * data.Adresse2); $("#cb_CP").html(data.CP);
							 * $("#cb_Ville").html(data.Ville);
							 * $("#cb_Pays").html(data.Pays);
							 */
							$("#_pointRelais").html(
									"Livraison en point relais "
											+ data.Nom
											+ " à "
											+ data.Ville
											+ " - "
											+ data.Adresse1
											+ ' '
											+ ((data.Adresse2 == null) ? ""
													: data.Adresse2))

						}
					});
		}
	},
	getFraisLivraison : function() {
		var data = {};
		this.options.data = data;
		$.post(getUrlPrefix() + '/frais_livraison/get', data, $.proxy(
				this.onGetFraisLivraisonLoaded, this))
		$(".recap ._l ._p").show();
	},
	onGetFraisLivraisonLoaded : function(data) {
		if (data.msg == "ok") {
			$(".step2-container ._tlivraison").html(data.fraisMontant + " €");
			$(".recap ._l ._p").html(data.fraisMontant + " €");
			$(".recap ._t ._pht").html(data.prixHt + " €");
			$(".recap ._t ._pttc").html(data.prixTotal + " €");
		} else {
			showAlert("Erreur",
					"Erreur durant le calcul des frais de livraison...");
		}
	},
	step1Clicked : function() {
		hc().setHash('commande');
	},
	step2Clicked : function() {
		hc().setHash('commande/livraison');
	},
	step3Clicked : function() {
		hc().setHash('commande/paiement');
	},
	showStep1 : function() {
		$(".step2-container").hide();
		$(".step3-container").hide();
		$(".step1-container").fadeIn();
		$(".client-progress-bar .step1").addClass("selected");
		$(".client-progress-bar .step2").removeClass("selected");
		$(".client-progress-bar .step3").removeClass("selected");
		$(".client-progress-bar .step4").removeClass("selected");

		if (this.options.pass1)
			$(".recap ._l ._p").show();
	},
	showStep2 : function() {
		if (this.options.pass1 == false) {
			showAlert("Etape non authorisée",
					"Vous devez passer par la première étape d'abord");
			return;
		}
		this.getFraisLivraison();
		$(".recap ._l ._p").show();
		// this._initMondialRelay();
		$(".step1-container").hide();
		$(".step3-container").hide();
		$(".step2-container").fadeIn();
		$(".client-progress-bar .step1").removeClass("selected");
		$(".client-progress-bar .step2").addClass("selected");
		$(".client-progress-bar .step3").removeClass("selected");
		$(".client-progress-bar .step4").removeClass("selected");
	},
	showStep3 : function() {
		if (this.options.pass2 == false) {
			showAlert("Etape non authorisée",
					"Vous devez passer par la deuxième étape d'abord");
			return;
		}
		$(".step1-container").hide();
		$(".step2-container").hide();
		$(".step3-container").fadeIn();
		$(".client-progress-bar .step1").removeClass("selected");
		$(".client-progress-bar .step2").removeClass("selected");
		$(".client-progress-bar .step3").addClass("selected");
		$(".client-progress-bar .step4").removeClass("selected");
	},
	setLoading : function() {
		this.element.addClass('loading');
	},
	hideLoading : function() {
		this.element.removeClass('loading');
	},
	options : {
		form1 : null,
		form2 : null,
		pass1 : false,
		pass2 : false
	}
});

$.widget('seriel.addAccount', {
	_create : function() {
		this.initForm();
		$('.button', this.element).bind('click',
				$.proxy(this.saveClicked, this));
	},
	initForm : function() {
		this.options.form = $('form', this.element);
		this.options.submit = $('button[type=submit]', this.element).bind(
				'click', $.proxy(this.save, this));
	},
	saveClicked : function() {
		this.setLoading();
		this.options.submit.trigger('click');
		return false;
	},
	save : function(event) {

		event.stopPropagation();

		var formDatas = this.options.form.serializeArray();
		var datas = {};
		for (var i = 0; i < count(formDatas); i++) {
			var elem = formDatas[i];
			datas[elem['name']] = elem['value'];
		}

		var mdp1 = $('.mdp1', this.element).val();
		var mdp2 = $('.mdp2', this.element).val();

		if (mdp1 == mdp2 && mdp1 != '' && mdp1 != ' ') {
			datas['mdp'] = mdp1;

			$.post(getUrlPrefix() + '/compte/addAccount', datas, $.proxy(
					this.saved, this));
		} else {
			showAlert('Erreur', 'les mots de passe ne correspondent pas');
		}
		return false;
	},
	saved : function(result) {
		var container = $('<div></div>');
		container.html(result);
		var res = $(' > div', container);
		// var res = $(result);

		if (res.hasClass('error')) {
			alert(res.html());
			// toastr['error'](res.html());
			// alert('Vous devez sélectionner au moins un filtre');
			return;
		}

		if (res.hasClass("success")) {
			var new_cpte = $('.compte_menu.cpte', res);
			$('.compte_menu.cpte').replaceWith(new_cpte);

			if (isCommandeOn()) {
				$('body').addClass('is_client');
				document.location.href = '#commande';
			} else {
				document.location.href = '#compte';
				$('.page_compte').load(getUrlPrefix() + '/compte/menu',
						init_menu_compte);

			}
			this.hideLoading();
			// showAlert('Confirmation Compte','Votre compte a été créer avec
			// succes');

		} else {
			$('form', this.element).html($('form', res).html());
			this.initForm();
		}

	},
	setLoading : function() {
		this.element.addClass('loading');
	},
	hideLoading : function() {
		this.element.removeClass('loading');
	},
	options : {

	}
});

$.widget('seriel.pageAdminCreaDeclinaison',
		{
			_create : function() {
				this.options.form = $('form', this.element);
				this.options.form.bind('submit', $.proxy(this.submit, this));

				$('.cancel_button', this.element).bind('click',
						$.proxy(this.cancelClicked, this));
				$('.valid_button', this.element).bind('click',
						$.proxy(this.okClicked, this));
			},
			cancelClicked : function() {
				this.element.dialog('close');
			},
			okClicked : function() {
				$('input[type=submit], button[type=submit]', this.element)
						.trigger('click');
			},
			setLoading : function() {
				this.element.addClass('loading');
			},
			hideLoading : function() {
				this.element.removeClass('loading');
			},
			getArticleId : function() {
				return $('.article_id', this.element).html();
			},
			submit : function(event) {
				event.stopPropagation();

				this.setLoading();

				var datas = this.options.form.serializeArray();

				var article_id = this.getArticleId();
				$.post(getUrlPrefix() + '/admin/article/declinaison_crea/'
						+ article_id, datas, $.proxy(this.saved, this));

				return false;
			},
			saved : function(result) {
				var res = $(result);

				if (res.hasClass('success')) {
					var parentContainer = this.element.parent().parent()
							.closest('.ui-dialog');
					var parent = $(' > .seriel_dialog', parentContainer);

					parent.pageAdminArticle('addDecl', $(
							' > .declinaison_admin', res));

					this.element.dialog('close');

					return;
				}
				this.hideLoading();
			},
			options : {
				form : null
			}
		});

$
		.widget(
				'seriel.pageAdminArticle',
				{
					_create : function() {
						$('.modal_tabs_container', this.element).tabs();

						$('#tabs-images', this.element).gerer_documents();

						this.initForm();

						this.options.declCheckBox = $('.check_use_decl',
								this.element);
						this.options.declCheckBox.bind('change', $.proxy(
								this.refreshShowDeclinaison, this));

						this.options.declContainerDiv = $(
								'.declinaisons_adm_container', this.element);
						this.options.declinaisonsUl = $('ul',
								this.options.declContainerDiv)
						$(' > li', this.options.declinaisonsUl).bind('click',
								$.proxy(this.declClicked, this));

						$('.cancel_button', this.element).bind('click',
								$.proxy(this.cancelClicked, this));
						$('.valid_button', this.element).bind('click',
								$.proxy(this.okClicked, this));
						$('.add_button', this.element).bind('click',
								$.proxy(this.addDeclinaisonClicked, this));

						$('form', this.element).bind('submit',
								$.proxy(this.submit, this));

						this.refreshShowDeclinaison();

						$(' > li.ui-selected', this.options.declinaisonsUl)
								.trigger('click');
					},
					test : function() {
						alert('test');
					},
					addDecl : function(decl) {
						// On crée le li.
						var nom = $('.nom', decl).html();
						var id = decl.attr('declinaison_id');

						var li = $('<li declinaison_id="' + id + '">' + nom
								+ '</li>');
						li.bind('click', $.proxy(this.declClicked, this));

						li.appendTo(this.options.declinaisonsUl);
						decl.appendTo($('.details_declinaison .cnt',
								this.element));
						li.trigger('click');
					},
					initForm : function() {
						this.options.promoCheckBox = $('#form_promo',
								this.element);
						this.options.promoCheckBox.bind('change', $.proxy(
								this.refreshShowPromo, this))

						this.options.promoPrixLine = $('#form_prix_promo',
								this.element).parent();

						this.refreshShowPromo();
					},
					declClicked : function(event) {
						var target = $(event.currentTarget);
						var declinaison_id = target.attr('declinaison_id');
						$('> .ui-selected', this.options.declinaisonsUl)
								.removeClass('ui-selected');
						target.addClass('ui-selected');

						$('.details_declinaison .declinaison_admin.selected',
								this.element).removeClass('selected');
						$(
								'.details_declinaison .declinaison_admin[declinaison_id='
										+ declinaison_id + ']', this.element)
								.addClass('selected');
					},
					refreshShowPromo : function() {
						var checked = this.options.promoCheckBox
								.prop('checked');
						if (checked) {
							this.options.promoPrixLine.removeClass('disabled');
						} else {
							this.options.promoPrixLine.addClass('disabled');
						}
					},
					refreshShowDeclinaison : function() {
						var checked = this.options.declCheckBox.prop('checked');
						if (checked) {
							this.options.declContainerDiv
									.addClass('declinaisons_enabled');
						} else {
							this.options.declContainerDiv
									.removeClass('declinaisons_enabled');
						}
					},
					cancelClicked : function() {
						this.element.dialog('close');
					},
					addDeclinaisonClicked : function() {
						var article_id = $('.article_id', this.element).html();
						openModalInside('Nouvelle déclinaison', getUrlPrefix()
								+ '/admin/article/declinaison_crea/'
								+ article_id, this.element.parent(), {
							'width' : 1000,
							'height' : 550
						});
					},
					submit : function(event) {
						event.stopPropagation();
						try {
							this.okClicked();
						} catch (e) {

						}

						return false;
					},
					showAlert : function(title, content) {
						showAlert(title, content, this.element.parent());
					},
					okClicked : function() {
						var datas = {};

						// 1. On s'occupe des images.
						var uploading = $('.dz-preview', this.options.dropzone);
						if (uploading.size() > 0) {
							var title = "Envoi en cours";
							var content = "Certains fichiers sont encore en cours d'envoi.";
							this.showAlert(title, content);
							return;
						}

						// OK, on met le loader en place.
						this.setLoading();

						// On récupère la liste des fichiers.
						var lis = $('.lier_docs_right li', this.element);

						var datas = {};
						var pos = 1;
						for (var i = 0; i < lis.size(); i++) {
							var li = $(lis.get(i));
							var file_id = li.attr('file_id');
							var name = $('input.nom', li).val();

							datas['fichiers[' + i + '][id]'] = file_id;
							datas['fichiers[' + i + '][nom]'] = name;
							datas['fichiers[' + i + '][pos]'] = pos;

							pos++;
						}

						// 2. On s'occupe des données du formulaire.
						var form_datas = $('form', this.element)
								.serializeArray();
						for (var i = 0; i < count(form_datas); i++) {
							var form_data = form_datas[i];
							var key = form_data['name'];
							var value = form_data['value'];

							datas[key] = value;
						}

						// 3. On s'occupe des données de déclinaison.
						var checked = this.options.declCheckBox.prop('checked');

						if (checked) {
							datas['declinaison'] = 1;
							// on récupère la déclinaison sélectionnée.
							var decl = $('> .ui-selected',
									this.options.declinaisonsUl);
							if (decl.size() == 1) {
								datas['declinaison_id'] = decl
										.attr('declinaison_id');
							}
						}

						var article_id = $('.article_id', this.element).html();
						var from_decl_id = this.getFromDeclId();
						if (from_decl_id)
							$.post(getUrlPrefix() + '/admin/article/'
									+ article_id + '/' + from_decl_id, datas, $
									.proxy(this.saved, this));
						else
							$.post(getUrlPrefix() + '/admin/article/'
									+ article_id, datas, $.proxy(this.saved,
									this));
					},
					setLoading : function() {
						this.element.addClass('loading');
					},
					hideLoading : function() {
						this.element.removeClass('loading');
					},
					saved : function(result) {
						var res = $(result);

						if (res.hasClass('update_line')) {
							// OK, on est en declinaison et l'article n'en fait
							// plus parti.
							var line = $('table.updated_line tr', res);

							// this.options.listArtDecl.ser_list('removeLine',
							// art_id, true);

							var art = $(' > .article', res);
							sm().afficherFicheArticle(art);

							var parentModal = getParentModal(this.element);

							if (parentModal.size() == 1) {
								parentModal.pageAdminArticleDeclinaison(
										'updateLineDecl', line);
							}

							this.element.dialog('close');

							return;
						}

						if (res.hasClass('remove_line')) {
							// OK, on est en declinaison et l'article n'en fait
							// plus parti.
							var art_id = $(' > .article_id', res).html();

							// this.options.listArtDecl.ser_list('removeLine',
							// art_id, true);

							var art = $(' > .article', res);
							sm().afficherFicheArticle(art);

							var parentModal = getParentModal(this.element);

							if (parentModal.size() == 1) {
								parentModal.pageAdminArticleDeclinaison(
										'removeLineDecl', art_id);
							}

							this.element.dialog('close');

							return;
						}

						if (res.hasClass('article')) {
							// On recharge l'article.
							sm().afficherFicheArticle(result);
							this.element.dialog('close');

							return;
						}

						$('form', this.element).html($('form', res).html());
						this.initForm();
						this.hideLoading();
					},
					getArticleId : function() {
						var article_id = $('.article_id',
								this.element.parent().parent()).html();
						return article_id;
					},
					getFromDeclId : function() {
						var from_decl_id = $('.from_decl_id', this.element)
								.html();
						return from_decl_id;
					},
					options : {
						promoCheckBox : null,
						promoPrixLine : null,

						declCheckBox : null,
						declContainerDiv : null,

						declinaisonsUl : null
					}
				});

$.widget('seriel.pageAdminArticleDeclinaison', {
	_create : function() {
		$('.modal_tabs_container', this.element).tabs();

		$('#tabs-images', this.element).gerer_documents();

		this.initForm();

		$('.cancel_button', this.element).bind('click',
				$.proxy(this.cancelClicked, this));
		$('.valid_button', this.element).bind('click',
				$.proxy(this.okClicked, this));
		$('.add_button', this.element).bind('click',
				$.proxy(this.addDeclinaisonClicked, this));

		$('form', this.element).bind('submit', $.proxy(this.submit, this));

		this.options.listArtDecl = $(
				'.declinaisons_adm_container .list_content', this.element);
		this.options.listArtDecl.ser_list();
		this.options.listArtDecl.bind('select_changed', $.proxy(
				this.selectionChanged, this));

		$('tr.list_elem', this.options.listArtDecl).bind('dblclick',
				$.proxy(this.elemDblClicked, this))
	},
	elemDblClicked : function(event) {
		var target = $(event.currentTarget);
		var article_id = target.attr('uid');

		var decl_id = this.getArticleId();

		openModalInside('Modificaitons de l\'article', getUrlPrefix()
				+ '/admin/article/' + article_id + '/' + decl_id, this.element
				.parent(), {
			'width' : 1100,
			'height' : 600
		});
	},
	initForm : function() {
		this.options.promoCheckBox = $('#form_promo', this.element);
		this.options.promoCheckBox.bind('change', $.proxy(
				this.refreshShowPromo, this))

		this.options.promoPrixLine = $('#form_prix_promo', this.element)
				.parent();

		this.refreshShowPromo();
	},
	updateLineDecl : function(line) {
		this.options.listArtDecl.ser_list('updateLine', line);
		line.bind('dblclick', $.proxy(this.elemDblClicked, this))
	},
	removeLineDecl : function(art_id) {
		this.options.listArtDecl.ser_list('removeLine', art_id, true);
	},
	selectionChanged : function() {

	},
	refreshShowPromo : function() {
		var checked = this.options.promoCheckBox.prop('checked');
		if (checked) {
			this.options.promoPrixLine.removeClass('disabled');
		} else {
			this.options.promoPrixLine.addClass('disabled');
		}
	},
	cancelClicked : function() {
		this.element.dialog('close');
	},
	submit : function(event) {
		event.stopPropagation();
		try {
			this.okClicked();
		} catch (e) {

		}

		return false;
	},
	showAlert : function(title, content) {
		showAlert(title, content, this.element.parent());
	},
	okClicked : function() {
		var datas = {};

		// 1. On s'occupe des images.
		var uploading = $('.dz-preview', this.options.dropzone);
		if (uploading.size() > 0) {
			var title = "Envoi en cours";
			var content = "Certains fichiers sont encore en cours d'envoi.";
			this.showAlert(title, content);
			return;
		}

		// OK, on met le loader en place.
		this.setLoading();

		// On récupère la liste des fichiers.
		var lis = $('.lier_docs_right li', this.element);

		var datas = {};
		for (var i = 0; i < lis.size(); i++) {
			var li = $(lis.get(i));
			var file_id = li.attr('file_id');
			var name = $('input.nom', li).val();

			datas['fichiers[' + i + '][id]'] = file_id;
			datas['fichiers[' + i + '][nom]'] = name;
		}

		// 2. On s'occupe des données du formulaire.
		var form_datas = $('form', this.element).serializeArray();
		for (var i = 0; i < count(form_datas); i++) {
			var form_data = form_datas[i];
			var key = form_data['name'];
			var value = form_data['value'];

			datas[key] = value;
		}

		var article_id = $('.article_id', this.element).html();
		$.post(getUrlPrefix() + '/admin/article/' + article_id, datas, $.proxy(
				this.saved, this));
	},
	setLoading : function() {
		this.element.addClass('loading');
	},
	hideLoading : function() {
		this.element.removeClass('loading');
	},
	saved : function(result) {
		var res = $(result);

		if (res.hasClass('article')) {
			// On recharge l'article.
			sm().afficherFicheArticle(result);
			this.element.dialog('close');

			return;
		}

		$('form', this.element).html($('form', res).html());
		this.initForm();
		this.hideLoading();
	},
	getArticleId : function() {
		var article_id = $(' > .modal_tabs_container > .article_id',
				this.element).html();
		return article_id;
	},
	options : {
		promoCheckBox : null,
		promoPrixLine : null,

		listArtDecl : null
	}
});

$
		.widget(
				'seriel.gerer_documents',
				{
					_create : function() {
						this.options.dropzone = $('.slide_in_doc', this.element);
						var message = this.options.dropzone.html();

						this.options.dropzone.html('');
						this.options.dropzone.dropzone({
							url : getUrlPrefix() + '/admin/image/send/'
									+ this.getArticleId(),
							'dictDefaultMessage' : message,
							'success' : $.proxy(this.success, this)
						});

						this.options.dropzoneObject = Dropzone.forElement("#"
								+ this.options.dropzone.attr('id'));

						$('.lier_docs_right > .cnt > ul ', this.element)
								.sortable({
									axis : 'y'
								});
						$('.lier_docs_right > .cnt > ul', this.element)
								.disableSelection();

						this.options.files_ul = $('.lier_docs_right ul',
								this.element);

						$('.remove', this.element).bind('click',
								$.proxy(this.removeClicked, this));
					},
					getArticleId : function() {
						var article_id = $('.article_id',
								this.element.parent().parent()).html();
						return article_id;
					},
					success : function(file, result) {
						for ( var key in file) {
							console.log('file[' + key + '] : ' + file[key]);
						}
						var res = $(result);

						if (res.hasClass('success')) {
							var file_id = $('.file_id', res).html();
							var thumb = $('.thumb', res).html();
							var previewElement = $(file['previewElement']);

							var position = previewElement.position();
							previewElement.css({
								'position' : 'absolute',
								'top' : (intval(position.top) + 51) + 'px',
								'left' : (intval(position.left) + 21) + 'px',
								'width' : previewElement.width(),
								'height' : previewElement.height(),
								'min-height' : 0,
								'opacity' : 1,
								'overflow' : 'hidden'
							});
							previewElement.appendTo(this.element);
							// previewElement.css('transition', 'top 0.2s, left
							// 0.2s, width 0.2s, height 0.2s, opacity 0.25s');
							previewElement.css('transition-property',
									'top, left, width, height, opacity');
							previewElement.css('transition-duration',
									'0.2s, 0.2s, 0.2s, 0.2s, 0.1s');
							previewElement.css('transition-delay',
									'0s, 0s, 0s, 0s, 0.15s');
							// previewElement.css({ 'position': 'absolute',
							// 'top': '0px', 'left': '0px'});

							previewElement.data('file', file);

							// On essaie d'anticiper le nom.
							var nom = file['name'];
							var lastPoint = strrpos(nom, '.');
							if (lastPoint) {
								nom = substr(nom, 0, lastPoint);
								nom = str_replace('_', ' ', nom);
								nom = str_replace('-', ' ', nom);
								nom = str_replace('.', ' ', nom);
								nom = ucfirst(trim(nom));
							}

							// On ajoute le nouveau fichier à la liste
							// d'éléments.
							var newLi = $('<li counter="'
									+ this.options.lisCounter
									+ '" file_id="'
									+ file_id
									+ '"><span class="icon" style="background-image: url('
									+ thumb
									+ ')"></span><span class="cnt"><input type="text" class="nom" value="'
									+ nom
									+ '" /><br/><span class="filename">'
									+ file['name']
									+ '</span></span><span class="remove"></span></li>');
							newLi.css('opacity', 0);
							newLi.css('transition-property', 'opacity');
							newLi.css('transition-duration', '0.2s');
							newLi.css('transition-delay', '0.15s');
							newLi.appendTo(this.options.files_ul);

							// var time = new Date();
							previewElement.attr('dest_li',
									this.options.lisCounter);
							previewElement.attr('time', getTimeInMillis());

							setTimeout($.proxy(this.moveElemsToTheList, this),
									45);
							setTimeout($.proxy(this.moveElemsToTheList, this),
									100); // Just in case
							setTimeout($.proxy(this.moveElemsToTheList, this),
									250); // Just in case

							$('.remove', newLi).bind('click',
									$.proxy(this.removeClicked, this)),

							this.options.lisCounter++;
						} else {
							// TODO : show error.
						}
					},
					removeClicked : function(event) {
						var target = $(event.currentTarget);
						var li = target.closest('li');
						li.remove();
					},
					moveElemsToTheList : function() {
						// On récupère tous les éléments qui ont une destination
						// fixee et ne sont pas encore partis.
						var elems = $(' > .dz-preview[dest_li]:not([gone])',
								this.element);
						var time = intval(getTimeInMillis());
						for (var i = 0; i < elems.size(); i++) {
							// On garde un délai de 40 millis avant de commencer
							// à déplacer l'élément.
							var elem = $(elems.get(i));
							var timeElem = intval(elem.attr('time'));
							var diff = time - timeElem;
							if (diff > 40) {
								// Let's move !!!
								var dest_li_counter = elem.attr('dest_li');
								var dest_li = $('li[counter=' + dest_li_counter
										+ ']', this.options.files_ul);
								dest_li.css('opacity', 1);

								var position = dest_li.position();
								var top = position.top + 71;
								var left = 500;
								if (top > 500)
									top = 500;

								elem.attr('gone', '1');
								elem.css({
									'position' : 'absolute',
									'top' : top + 'px',
									'left' : left + 'px',
									'width' : '20px',
									'height' : '24px',
									'opacity' : 0
								})
							}
						}

						// On déclenche un contrôle des elements à supprimer de
						// la dropzone.
						setTimeout($.proxy(this.checkPreviewsToRemove, this),
								35);
						setTimeout($.proxy(this.checkPreviewsToRemove, this),
								60);
						setTimeout($.proxy(this.checkPreviewsToRemove, this),
								100);
						setTimeout($.proxy(this.checkPreviewsToRemove, this),
								1000); // Just in case
					},
					checkPreviewsToRemove : function() {
						previews = $(' > .dz-preview[gone]', this.element);
						for (var i = 0; i < previews.size(); i++) {
							var preview = $(previews.get(i));
							var opacity = preview.css('opacity');
							console.log('opacity : ' + opacity);
							if (opacity < 0.08) {
								var file = preview.data('file');
								this.options.dropzoneObject.removeFile(file);
							}
						}
					},
					/*
					 * koClicked: function() { this.close(); }, okClicked:
					 * function() { // En premier on contrôle la présence du
					 * fichier en cours d'upload. var uploading =
					 * $('.dz-preview', this.options.dropzone); if
					 * (uploading.size() > 0) { var title = "Envoi en cours";
					 * var content = "Certains fichiers sont encore en cours
					 * d'envoi."; this.showAlert(title, content); return; }
					 *  // On récupère la liste des fichiers. var lis = $(' >
					 * li', this.options.files_ul); if (lis.size() == 0) { var
					 * title = "Aucun fichier sélectionné"; var content = "Vous
					 * devez envoyer au moins un fichier.";
					 * this.showAlert(title, content); return; }
					 *  // OK, on met le loader en place. this.setLoading();
					 * 
					 * var datas = {}; for (var i = 0; i < lis.size(); i++) {
					 * var li = $(lis.get(i)); var file_id = li.attr('file_id');
					 * var name = $('input.nom', li).val();
					 * 
					 * datas['fichiers['+i+'][id]'] = file_id;
					 * datas['fichiers['+i+'][nom]'] = name; }
					 * 
					 * $.post(getUrlPrefix() + '/documents/lier/' +
					 * this.getArticleId(), datas, $.proxy(this.saved, this)); },
					 * saved: function(result) { var res = $(result);
					 * 
					 * if (res.hasClass('success')) { var parentNav =
					 * this.getParentNavigator();
					 * 
					 * if (parentNav && parentNav.updateDocs) { var block_docs =
					 * $('.block_documents', res); block_docs.docsBlock();
					 * parentNav.updateDocs(block_docs); }
					 * 
					 * this.close(); return; }
					 * 
					 * this.hideLoading(); },
					 */
					options : {
						defaultLayout : false,
						dropzone : null,
						dropzoneObject : null,
						lisCounter : 0,

						files_ul : null
					}
				});

/*
 * $.widget('seriel.pageContact', { _create: function() {
 * this.options.blockFormulaireInside = $('.block_formulaire_contact > .inside',
 * this.element);
 * 
 * this.options.form = $('form', this.element); this.options.form.bind('submit',
 * $.proxy(this.submit, this));
 * 
 * this.options.mapStPaul = new google.maps.Map($('.block_contact_1
 * .map_container', this.element).get(0), this.options.mapOptionsStPaul);
 * 
 * var marker = new google.maps.Marker({ position:
 * this.options.mapOptionsStPaul.center, map: this.options.mapStPaul,
 * title:"Culture Sud" });
 * 
 * this.options.mapLahonce = new google.maps.Map($('.block_contact_2
 * .map_container', this.element).get(0), this.options.mapOptionsLahonce);
 * 
 * var marker = new google.maps.Marker({ position:
 * this.options.mapOptionsLahonce.center, map: this.options.mapLahonce,
 * title:"Culture Sud" }); }, showing: function() { var message = $('.message',
 * this.options.form.parent()); if (message.size() > 0) message.remove();
 * 
 * if (this.options.form.css('display') == 'none')
 * this.options.form.css('display', 'block'); }, submit: function() {
 * this.setLoading();
 * 
 * var datas = this.options.form.serializeArray();
 * 
 * var url = this.options.form.attr('action'); $.post(url, datas,
 * $.proxy(this.sent, this));
 * 
 * return false; }, sent: function(result) { var res = $(result);
 * 
 * if (res.hasClass('success')) { //
 * 
 *  // On récupère le message. var message = $('.message', res);
 * 
 * this.options.form.css('display', 'none');
 * message.insertBefore(this.options.form);
 *  // On recharge un formulaire. this.options.form.html($('.new_form form',
 * res).html()); } else { var form = $('form', res); if (form.size() == 1) {
 * this.options.form.html(form.html()); } }
 * 
 * this.hideLoading(); }, clearForm: function() { $('ul',
 * this.options.form).remove(); $('input', this.options.form).val('');
 * $('textarea', this.options.form).val(''); }, setLoading: function() { var
 * loading = $('.loading', this.options.blockFormulaireInside); if
 * (loading.size() == 0) { loading = $('<div class="loading"></div>');
 * loading.appendTo(this.options.blockFormulaireInside); }
 * 
 * loading.css('display', 'block'); }, hideLoading: function() { var loading =
 * $('.loading', this.options.blockFormulaireInside); loading.css('display',
 * 'none'); }, options: { blockFormulaireInside: null, form: null,
 * 
 * mapOptionsStPaul: { center: new google.maps.LatLng(43.727237, -1.077566),
 * zoom: 15, mapTypeId: google.maps.MapTypeId.ROADMAP },
 * 
 * mapOptionsLahonce: { center: new google.maps.LatLng(43.491772,-1.426976),
 * zoom: 15, mapTypeId: google.maps.MapTypeId.ROADMAP },
 * 
 * mapStPaul: null, mapLahonce: null } });
 */

function basename(path) {
	return path.replace(/\\/g, '/').replace(/.*\//, '');
}

$
		.widget(
				'seriel.modal',
				{
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

$
		.widget(
				'seriel.editor',
				{
					_create : function() {

						// append blockeditor
						var blockdiv = '<div class="suppr_part">Supprimer la ligne</div><div class="blockeditor"><span rel="1"></span><span rel="2"></span><span rel="3"></span><span rel="4"></span></div>';
						$(this.element).prepend(blockdiv);

						// append parteditor
						if ($(this.element).closest(".inside2").find(
								".parteditor").length == 0) {
							var blockdiv = '<div class="parteditor">Ajouter une ligne</div>';
							$(this.element).closest(".inside2")
									.append(blockdiv);
							// bind click on parteditor
							$(this.element).closest(".inside2").find(
									'.parteditor').bind("click",
									$.proxy(this.onClickParteditor, this));
						}

						// click on block let's appear wysiwyg...
						this.selectBlock();

						// bind click on blockeditor span block
						$('.blockeditor span', this.element).bind("click",
								$.proxy(this.onClickBlockeditor, this));

						$(".suppr_part", this.element).bind("click",
								$.proxy(this.onClickPartSuppr, this));

					},
					onClickPartSuppr : function(event) {
						var element = $(event.currentTarget);
						$(this.element).remove();
					},
					onClickParteditor : function(event) {
						var element = $(event.currentTarget);
						$(this.element).parent().append(
								'<div class="part dashed"></div>');
						$(this.element).parent().find(".part:last-child")
								.editor();
					},
					onClickBlockeditor : function(event) {
						var span = $(event.currentTarget);
						var rel = parseFloat(span.attr("rel"));
						var nbBlock = $(".block", this.element).length;

						$(".block", this.element).removeClass("block_removed");

						if (nbBlock < rel) { // append block
							var block = '<div class="block"><div class="inside"></div></div>';

							for (var i = nbBlock; i < rel; i++) {
								$(this.element).append(block);
								// let's create new block
								// $('.inside',this).hide();
								var _nb = $(".block").length;
								$(".block:nth-last-child(1)", this.element)
										.append(
												'<textarea id="_tx' + (_nb + 1)
														+ '"></textarea>');
								setTimeout(CKEDITOR.replace('_tx' + (_nb + 1)),
										500);
							}
						} else {
							for (var i = 0; i < this.options.maxBlock; i++) {
								if (i >= (rel - 1)) {
									var _id = $(
											".block:eq(" + (i) + ") textarea",
											this.element).attr("id");
									console.log(rel + "____ " + _id + " ==> ");

									if (typeof CKEDITOR.instances[_id] != "undefined") {
										if (CKEDITOR.instances[_id].getData() == "") {
											$(".block", this.element).eq(i)
													.remove();
											// let's remove block
											CKEDITOR.instances[_id]
													.destroy(true);
										} else
											$(".block", this.element).eq(i)
													.addClass("block_removed");
									}
								}
							}
						}
						this.selectBlock();

						$('.block', this.element).bind("click",
								$.proxy(this.onClickBlock, this));
					},
					callCkeditor : function() {

					},
					selectBlock : function() {
						$(".blockeditor span", this.element).removeClass(
								"selected");
						this.removeAllRBlockClass();
						var nb = $(".block", this.element).length;
						for (var i = 0; i < nb; i++) {
							$(".blockeditor span", this.element).eq(i)
									.addClass("selected");
						}
						$(".block", this.element).addClass("r_block_" + nb);

					},
					onClickBlock : function() {

					},
					removeAllRBlockClass : function() {
						for (var i = 1; i <= 4; i++) {
							$(".block", this.element).removeClass(
									"r_block_" + i);
						}
					},
					options : {
						maxBlock : 4
					}
				});

$.widget('seriel.frontend', {
	_create : function() {
		// get content
		var data = {};
		$.ajax({
			dataType : "json",
			url : this.options._urlGet,
			data : data,
			success : function(data) {
				if (data.result == "1") {
					$.each(data.content, function(i, item) {
						$(".page_" + item.name + " .cnt").html(item.content);
					});

					$(".part").each(function(item) {
						var nb = $(".block", this).length;
						$(".block", this).addClass("r_block_" + nb);
					});

				}
			}
		});
	},
	options : {
		_urlGet : '/app_dev.php/blocs/get',
	}
});

$.widget('seriel.backend', {
	_create : function() {
		var that = this;
		// get content
		var data = {};
		$
				.ajax({
					dataType : "json",
					url : this.options._urlGet,
					data : data,
					success : function(data) {
						if (data.result == "1") {

							$.each(data.content, function(i, item) {
								$(".page_" + item.name + " .cnt").html(
										item.content);
							});

							$(".cnt .part").parent().addClass("dashed");
							$(".cnt > .part").addClass("dashed");
							// call the editor
							$(".part").editor();

							// ckeditor
							$(".part .block")
									.each(
											function(index) {
												var inside = $('.inside', this)
														.html();
												$('.inside', this).hide();
												var txta = '<textarea id="_tx'
														+ index + '">' + inside
														+ '</textarea>';
												$(this).append(txta);
												setTimeout(
														CKEDITOR.replace('_tx'
																+ index), 500);
												setTimeout($(this).removeClass(
														"loading"), 500);
											})

							that.options._interval = setInterval($.proxy(
									that.saveContent, that), 1000);

						}
					}
				});
	},
	saveContent : function() {

		// where amI
		var hash = document.location.hash.replace("#", "");
		var content = $(".page_" + hash + " .cnt").html();

		var content = "";
		$(".page_" + hash + " .cnt .part").each(function(item) {
			content += '<div class="part">';
			$(".block", this).each(function(item) {
				var _ediId = $("textarea", this).attr("id");
				if (typeof CKEDITOR.instances[_ediId] == "undefined")
					return false;
				content += '<div class="block">';
				content += '<div class="inside">';
				content += CKEDITOR.instances[_ediId].getData();
				content += '</div>';
				content += '</div>';
			});
			content += '</div>';
		})

		if (content == this.options._contentTmp || content == "")
			return false;

		var data = {
			"blocpage" : hash,
			"content" : content
		};
		var that = this;
		$.ajax({
			dataType : "json",
			url : this.options._urlSave,
			data : data,
			method : "POST",
			success : function(data) {
				if (data.result == "2") {
					clearInterval(that.options._interval);
					return false;
				}
				if (data.result == "0")
					console.log("Error on save content " + new Date());
				else
					that.options._contentTmp = content;
			}
		});

	},
	options : {
		_urlGet : '/app_dev.php/blocs/get',
		_urlSave : '/app_dev.php/blocs/save',
		_interval : null,
		_contentTmp : null
	}
});

function _disBg() {
	var windownScrolltop = $(window).scrollTop();
	if (windownScrolltop > 100) {
		$("#header > .header_bottom > .submenu_bg").addClass('out');
	} else {
		$("#header > .header_bottom > .submenu_bg").removeClass('out');
	}
}

// increase bg color ton on scroll down
$(window).on('scroll', function() {
	_disBg();
});
_disBg();

// **********************************************
function _setModeCommandeOn() {
	_setModeCommandeOff();
	$("body").append('<div class="commande_on"></div>');
}
function _setModeCommandeOff() {
	$(".commande_on").remove();
}
function isCommandeOn() {
	return $(".commande_on").length != 0;
}
var historyurl = [];
$(window).on('hashchange', function() {
	var lastHash = "";
	var currentHash = location.hash;
	if (historyurl.length > 0)
		lastHash = historyurl[historyurl.length - 1];
	console.log("lastHash => " + lastHash);
	if (isCommandeOn()) {
		if (lastHash == "#compte" && currentHash == "#") {
			/* hc().setHash("commande"); */
			_setModeCommandeOff();
			return;
		}
	}
	historyurl.push(currentHash);
});

$
		.widget(
				'seriel.fraisLivraison',
				{
					_create : function() {
						this.init();
					},
					init : function() {
						$('.searchlist', this.element).btsListFilter(
								'#searchinput', {
									itemChild : 'span'
								});
						$('.searchlist div', this.element).bind("click",
								$.proxy(this.onClickPays, this));
						$('.add-frais-livraison', this.element).bind("click",
								$.proxy(this.onClickAddFraisLivraison, this));
						$('.edit-max-livraison', this.element)
								.bind(
										"click",
										$
												.proxy(
														this.onClickEditMaxFraisLivraison,
														this));
						$(".searchlist .list-group-item").bind("click",
								$.proxy(this.nothing, this));
						this._initList();
					},
					_initList : function() {
						// $(".searchlist div
						// span:contains('Espagne')").parent().detach().prependTo(".searchlist");
						$(".searchlist div span:contains('DOM-TOM')").parent()
								.detach().prependTo(".searchlist");
						$(".searchlist div span:contains('France')").parent()
								.detach().prependTo(".searchlist");
					},
					nothing : function(event) {
						event.stopImmediatePropagation()
						console.log("Stop")
						return false;
					},
					onClickPays : function(event) {
						$(".pays-result").show();
						var a = $(event.currentTarget);
						$('.searchlist div', this.element).removeClass(
								"selected");
						a.addClass("selected");
						var id = a.attr("rel");
						this.options.pays_id = id;
						var data = {};
						data["pays_id"] = id;
						$.post(getUrlPrefix()
								+ '/admcompte/frais_livraison/pays', data, $
								.proxy(this.onClickPaysLoaded, this));
					},
					_toInput : function(classname, value) {
						return '<input type="text" class="form-control '
								+ classname + '" value="' + value + '">';
					},
					onClickPaysLoaded : function(data) {
						var that = this;
						if (data.msg == "ok") {
							$(".max-livraison", this.element).val(data.max);
							$(".pays-result .table-frais tbody").html("");
							$
									.each(
											data.data,
											function(i, item) {
												var ligne = '<tr class="frais_'
														+ data.data[i]['id']
														+ '">';
												ligne += '<td>'
														+ that
																._toInput(
																		'qtemin',
																		data.data[i]['qtemin'])
														+ '</td>';
												ligne += '<td>'
														+ that
																._toInput(
																		'qtemax',
																		data.data[i]['qtemax'])
														+ '</td>';
												ligne += '<td>'
														+ that
																._toInput(
																		'tarif',
																		data.data[i]['tarif'])
														+ '</td>';
												ligne += '<td><button type="button" class="btn-save btn btn-warning" rel="'
														+ data.data[i]['id']
														+ '">Enregistrer</button>&nbsp;<button type="button" class="btn-delete btn btn-danger" rel="'
														+ data.data[i]['id']
														+ '">X</button></td>';
												ligne += '</tr>';
												$(
														".pays-result .table-frais tbody")
														.append(ligne);
											});
							this.initEventOnDeleteButton();
							this.initEventOnUpdateButton();
						} else {
							showAlert("Erreur",
									"Erreur durant la récupération des données");
						}
					},
					_initInputs : function() {
						$(".qtemin_add", this.element).val('');
						$(".qtemax_add", this.element).val('');
						$(".tarif_add", this.element).val('');
					},
					onClickEditMaxFraisLivraison : function(event) {
						var a = $(event.currentTarget);
						var data = {};
						data['pays_id'] = this.options.pays_id;
						data['max'] = $(".max-livraison", this.element).val();
						this.options.data = data;
						$.post(getUrlPrefix()
								+ '/admcompte/frais_livraison/max', data, $
								.proxy(this.onClickEditMaxFraisLivraisonLoaded,
										this))
					},
					onClickEditMaxFraisLivraisonLoaded : function(data) {
						// add to list
						if (data.msg == "ok") {
							showAlert('Enregistrement',
									'Les informations ont bien été enregistrées');
						} else {
							showAlert("Erreur",
									"Erreur durant la récupération des données");
						}
					},
					onClickAddFraisLivraison : function(event) {
						var a = $(event.currentTarget);
						var data = {};
						data['qtemin'] = $(".qtemin_add", this.element).val();
						data['qtemax'] = $(".qtemax_add", this.element).val();
						data['tarif'] = $(".tarif_add", this.element).val();
						data['pays_id'] = this.options.pays_id;
						this.options.data = data;
						$.post(getUrlPrefix()
								+ '/admcompte/frais_livraison/pays/add', data,
								$.proxy(this.onClickAddFraisLivraisonLoaded,
										this))
					},
					onClickAddFraisLivraisonLoaded : function(data) {
						// add to list
						if (data.msg == "ok") {
							var ligne = '<tr class="frais_' + data.data['id']
									+ '">';
							ligne += '<td>'
									+ this._toInput('qtemin',
											data.data['qtemin']) + '</td>';
							ligne += '<td>'
									+ this._toInput('qtemax',
											data.data['qtemax']) + '</td>';
							ligne += '<td>'
									+ this
											._toInput('tarif',
													data.data['tarif'])
									+ '</td>';
							ligne += '<td><button type="button" class="btn-save btn btn-warning" rel="'
									+ data.data['id']
									+ '">Enregistrer</button>&nbsp;<button type="button" class="btn-delete btn btn-danger" rel="'
									+ data.data['id'] + '">X</button></td>';
							ligne += '</tr>';
							$(".pays-result .table-frais tbody").append(ligne);
							this.initEventOnDeleteButton();
							this.initEventOnUpdateButton();
							this._initInputs();
						} else {
							showAlert("Erreur",
									"Erreur durant la récupération des données");
						}
					},
					onClickUpdateFraisLivraison : function(event) {
						var a = $(event.currentTarget);
						var tr = a.parent().parent();
						var data = {};
						data['id'] = a.attr("rel");
						data['qtemin'] = $(".qtemin", tr).val();
						data['qtemax'] = $(".qtemax", tr).val();
						data['tarif'] = $(".tarif", tr).val();
						this.options.data = data;
						$.post(getUrlPrefix()
								+ '/admcompte/frais_livraison/pays/update',
								data, $.proxy(
										this.onClickUpdateFraisLivraisonLoaded,
										this))
					},
					onClickUpdateFraisLivraisonLoaded : function(data) {
						if (data.msg == "ok") {
							$(
									".pays-result .table-frais .frais_"
											+ this.options.data['id']
											+ " .btn-save").fadeOut();
							$(
									".pays-result .table-frais .frais_"
											+ this.options.data['id']
											+ " .btn-delete").fadeIn();
						} else {
							showAlert("Erreur",
									"Erreur durant la sauvegarde des données");
						}
					},
					onClickDeleteFraisLivraison : function(event) {
						var a = $(event.currentTarget);
						var data = {};
						data['id'] = a.attr("rel");
						this.options.data = data;
						$.post(getUrlPrefix()
								+ '/admcompte/frais_livraison/pays/delete',
								data, $.proxy(
										this.onClickDeleteFraisLivraisonLoaded,
										this))
					},
					onClickDeleteFraisLivraisonLoaded : function(data) {
						if (data.msg == "ok") {
							$(
									".pays-result .table-frais .frais_"
											+ this.options.data['id']).remove();
						} else {
							showAlert("Erreur",
									"Erreur durant la suppression des données");
						}
					},
					initEventOnDeleteButton : function() {
						$('.btn-delete', this.element)
								.bind(
										"click",
										$
												.proxy(
														this.onClickDeleteFraisLivraison,
														this));
					},
					initEventOnUpdateButton : function() {
						$('.btn-save', this.element)
								.bind(
										"click",
										$
												.proxy(
														this.onClickUpdateFraisLivraison,
														this));
						$(".qtemin,.qtemax,.tarif").focus(
								function() {
									$(this).parent().parent().find(".btn-save")
											.show();
									$(this).parent().parent().find(
											".btn-delete").hide();
								});
					},
					options : {
						pays_id : null,
						data : null
					}
				});

$
		.widget(
				'seriel.listesCommandes',
				{
					_create : function() {
						this.init();
					},
					init : function() {
						$('.searchlistCmd', this.element).btsListFilter(
								'#searchinput_cmd', {
									itemChild : 'div'
								});
						$('.searchlistCmd > div.list-group-item', this.element)
								.bind("click", $.proxy(this.onClickCmd, this));
						$(".searchlistCmd .list-group-item", this.element)
								.bind("click", $.proxy(this.nothing, this));
						// this._initList();
						console.log("init !")
					},
					destroy : function() {
						this.destroy();
						console.log("destroy");
					},
					open : function() {
						console.log("open");
					},
					nothing : function(event) {
						event.stopImmediatePropagation()
						console.log("Stop")
						return false;
					},
					onClickCmd : function(event) {
						$(".commandes", this.element).parent().addClass(
								'hideit');
						$(".cmd-result", this.element).parent().removeClass(
								'hideit');
						// $(".cmd-result").show();
						var a = $(event.currentTarget);
						$('.searchlistCmd div', this.element).removeClass(
								"selected");
						a.addClass("selected");
						var id = a.attr("rel");
						this.options.pays_id = id;
						var data = {};
						this.setLoading();

						$.post(getUrlPrefix() + '/compte/cmd/' + id, data, $
								.proxy(this.onClickCmdLoaded, this));
					},
					insertBack : function() {
						if ($(".back-btn", this.element).length == 0) {
							$(".cmd-result", this.element)
									.parent()
									.prepend(
											'<button type="button" class="btn btn-primary btn-sm back-btn"> < Retour &agrave; la liste des commandes </button>');
							$(".back-btn", this.element).bind("click",
									$.proxy(this.viewList, this));
						}
					},
					viewList : function() {
						$(".commandes", this.element).parent().removeClass(
								'hideit');
						// $(".commandes",this.element).parent().fadeIn();
						// $(".cmd-result",this.element).parent().fadeOut();
						$(".cmd-result", this.element).parent().addClass(
								'hideit');
					},
					hideList : function() {
						$(".commandes", this.element).parent().addClass(
								'hideit');
						// $(".commandes", this.element).parent().fadeOut();
						$(".cmd-result", this.element).parent().removeClass(
								'hideit');
						// $(".cmd-result",this.element).parent().fadeIn('slow');
					},
					onClickCmdLoaded : function(data) {
						$(".cmd-result", this.element).html(data);
						// if( $(document).width() < 768 ){
						// this.hideList();
						//
						// }
						this.insertBack();
						this.hideLoading();
						this.initEvent();
					},
					initEvent : function() {
						$(".add-numero-suivi", this.element).bind("click",
								$.proxy(this.onClickAddNumeroSuivi, this));
					},
					onClickAddNumeroSuivi : function(event) {
						var a = $(event.currentTarget);
						var tr = a.parent().parent();
						this.setLoading();
						var data = {};
						data['id'] = a.attr("rel");
						data['num'] = $("input[name='num']", this.element)
								.val();
						$.post(getUrlPrefix() + '/admcompte/numsuivi', data, $
								.proxy(this.onClickAddNumeroSuiviLoaded, this))
					},
					onClickAddNumeroSuiviLoaded : function(data) {
						if (data.msg == "ok") {
							this.hideLoading();
							showAlert('Enregistrement',
									'Les informations de suivi ont bien été enregistrées');
						} else {
							showAlert("Erreur",
									"Erreur durant la sauvegarde des données");
						}
					},
					setLoading : function() {
						this.element.addClass('loading');
					},
					hideLoading : function() {
						this.element.removeClass('loading');
					},
					options : {
						pays_id : null,
						data : null
					}
				});

$.widget('seriel.editAdresses', {
	_create : function() {
		this.initForm();
	},
	initForm : function() {
		var form1 = $('.form1', this.element);
		var form2 = $('.form2', this.element);

		this.options.form1 = $('form', form1);
		this.options.form2 = $('form', form2);

		this.options.form1.bind('submit', $.proxy(this.saveAddLiv, this));
		this.options.form2.bind('submit', $.proxy(this.saveAddFac, this));

		$('.btn', form1).bind('click', $.proxy(this.button1Clicked, this));
		$('.btn', form2).bind('click', $.proxy(this.button2Clicked, this));
	},
	button1Clicked : function() {
		this.options.form1.trigger('submit');
	},
	button2Clicked : function() {
		this.options.form2.trigger('submit');
		// alert('ok trigger');
	},
	saveAddLiv : function(event) {
		event.stopPropagation();

		this.setLoading();

		// on reunis les données et on save
		var formDatas = this.options.form1.serializeArray();
		var datas = {};
		for (var i = 0; i < count(formDatas); i++) {
			var elem = formDatas[i];
			datas[elem['name']] = elem['value'];
		}

		datas['type'] = 'livr';

		$.post(getUrlPrefix() + '/compte/mes_adresses', datas, $.proxy(
				this.saved, this));
		return false;

	},
	saveAddFac : function(event) {
		event.stopPropagation();

		this.setLoading();

		// on reunis les données et on save
		var formDatas = this.options.form2.serializeArray();
		var datas = {};
		for (var i = 0; i < count(formDatas); i++) {
			var elem = formDatas[i];
			datas[elem['name']] = elem['value'];
		}

		datas['type'] = 'fact';

		$.post(getUrlPrefix() + '/compte/mes_adresses', datas, $.proxy(
				this.saved, this));
		return false;
	},
	saved : function(result) {

		var res = $(result);
		if (res.hasClass = "success") {
			var type = $('.type', res).html();

			if (type == "fact") {
				showAlert('adresse enregistrée',
						"Votre adresse de facturation a bien été modifiée");
			}

			if (type == "livr") {
				showAlert('adresse enregistrée',
						"Votre adresse de livraison a bien été modifiée");
			}
		} else {
			$('#content_compte', this.element).html(res.html());
		}

		this.hideLoading();

	},
	setLoading : function() {
		this.element.addClass('loading');
	},
	hideLoading : function() {
		this.element.removeClass('loading');
	},
	options : {
		pays_id : null,
		data : null
	}
});