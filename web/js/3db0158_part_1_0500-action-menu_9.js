var currentActionsActive = null;

function setCurrentActionActive(actions) {
    unActiveCurrentActions();
    if (actions) {
        try {
            actions.addClass('active');
            currentActionsActive = actions;
        } catch (ex) {
            console.log("setCurrentActionActive() : ERROR");
        }
    }
}
function unActiveCurrentActions() {
    if (currentActionsActive) {
        try {
            currentActionsActive.removeClass('active');
        } catch (ex) {
            console.log("unActiveCurrentActions() : ERROR");
        }
    }
    currentActionsActive = null;
}


function actionClicked(event) {
    var target = $(event.currentTarget);
    var navelem = pnv(target);

    var action = target.attr('action');
    var title = $(' > span:first-child', target).html();
    if (!navelem)
        navelem = nav();
    navelem.onAction(action, title);

    return false;
}

function initActions() {
    //$(document).on('click.acts', 'li.action', actionClicked);
    $(document).on('mousedown.acts', 'li.action', actionClicked);
    //$(document).on('mousedown.acts', 'span.action', actionClicked);
}



$.widget('seriel.actionMenu', {
    _create: function () {
        this.options.elems = $(' > ul > li', this.element);
        this.options.elems.bind('click', $.proxy(this.elemClicked, this));
        this.options.elems.bind('mouseenter', $.proxy(this.mouseEnterElem, this));

        $('li.action', this.options.elems).bind('mouseenter', $.proxy(this.mouseEnterAction, this));

        // Let's deal with the shortcuts
        for (var i = 0; i < this.options.elems.size(); i++) {
            var menu = $(this.options.elems.get(i));
            if (menu.size() == 1 && menu.attr('shortcut')) {
                var shortcut = menu.attr('shortcut');
                if (!shortcut)
                    continue;

                var label = $('> span', menu).html();

                var newLabel = selectShortcutletter(label, shortcut);

                if (newLabel) {
                    $('> span', menu).html(newLabel);
                }

                this.options.shortcuts[shortcut] = menu;
            }
        }

        var hasActionShortcut = false;
        // Let's initialise action shortcuts.
        var actions = $('li.action', this.element);
        for (var i = 0; i < actions.size(); i++) {
            var act = $(actions.get(i));
            var shortcut = act.attr('shortcut');
            if (shortcut) {
                // console.log("SHORTCUT FOUND : "+shortcut);
                // Let's show it.
                var shortcutSpan = $('<span class="shortcut">' + shortcut + '</span>');
                shortcutSpan.appendTo(act);

                hasActionShortcut = true;

                this.options.shortcuts[shortcut] = act;
            }
        }

        // On gère maintenant la largeur des éléments afin d'aligner les
        // raccourcis à droite.
        if (hasActionShortcut) {

        }

        // this.element.bind('click', $.proxy(this.setUnactive, this));

        $('li.inactive', this.options.elems).bind('mousedown', $.proxy(this.inactiveSubElemClicked, this));
    },
    elemClicked: function (event) {
        var target = $(event.target);
        if (target.hasClass('action')) {
            return true;
        }
        this.toggleActive();
        return false;
    },
    toggleActive: function () {
        this.element.toggleClass('active');
        if (this.element.hasClass('active')) {
            this.checkCurrentMenuWidth();
            setCurrentActionActive(this.element);
        } else {
            unActiveCurrentActions();
        }
    },
    setUnactive: function () {
        this.element.removeClass('active');
        try {
            if (currentActionsActive && currentActionsActive.get(0) == this.element) {
                unActiveCurrentActions();
            }
        } catch (ex) {
            console.log('actionMenu::setUnactive() ERROR');
        }
    },
    mouseEnterElem: function (event) {
        this.removeAllActionsSelected();

        var elem = $(event.currentTarget);
        this.options.elems.removeClass('selected');
        elem.addClass('selected');

        this.checkCurrentMenuWidth();
    },
    mouseEnterAction: function (event) {
        var target = $(event.currentTarget);
        if (target && target.hasClass('selected'))
            return;

        this.removeAllActionsSelected();
    },
    inactiveSubElemClicked: function (event) {
    	if (event) {
    		event.stopPropagation();
    	}
        return false;
    },
    buildKeyString: function (event) {
        var key = event.which;
        var ctrlPressed = event.ctrlKey;
        var altPressed = event.altKey;
        var shiftPressed = event.shiftKey;

        var str = "";
        if (shiftPressed)
            str += "Maj+";
        if (ctrlPressed)
            str += "Ctrl+";
        if (altPressed)
            str += "Alt+";
        str += chr(key);

        return str;
    },
    forceOpenFirstMenu: function () {
        if ((!this.options.elems) || this.options.elems.size() == 0)
            return;
        var firstMenu = $(this.options.elems.get(0));
        this.forceOpenMenu(firstMenu);
    },
    forceOpenMenu: function (menu) {
        this.element.addClass('active');
        this.options.elems.removeClass('selected');
        menu.addClass('selected');
        setCurrentActionActive(this.element);

        // Let's select the first elem of the list.
        $('li.action.selected', menu).removeClass('selected');
        var actions = $('li.action:not(.inactive)', menu);
        if (actions && actions.size() > 0) {
            $(actions.get(0)).addClass('selected');
        }

        this.checkMenuWidth(menu);
    },
    checkCurrentMenuWidth: function () {
        var menu = this.options.elems.filter('.selected');
        if (menu && menu.size() == 1) {
            this.checkMenuWidth(menu);
        }
    },
    checkMenuWidth: function (menu) {
        var actions = $('li.action', menu);
        // $(' > span:first-child', actions).css('min-width', 0);

        var max = -1;
        var hasDiff = false;

        var maxRacc = -1;
        var hasDiffRacc = false;

        for (var i = 0; i < actions.size(); i++) {
            var action = $(actions.get(i));
            var width = $(' > span:first-child', action).width();
            if (max >= 0 && max != width)
                hasDiff = true;
            if (width > max)
                max = width;

            var racc = $(' > span.shortcut', action);
            if (racc && racc.size() == 1) {
                var widthRacc = racc.width();
                if (maxRacc >= 0 && maxRacc != widthRacc)
                    hasDiffRacc = true;
                if (widthRacc > maxRacc)
                    maxRacc = widthRacc;
            }
        }

        if (hasDiff && max > 0)
            $(' > span:first-child', actions).css('min-width', max);
        if (hasDiffRacc && maxRacc > 0)
            $(' > span.shortcut', actions).css('min-width', maxRacc);
    },
    selectNextMenu: function () {
        var currElem = this.options.elems.filter('.selected');
        var next = currElem.next();
        if (next && next.size() == 1) {
            this.forceOpenMenu(next);
            return;
        } else {
            var first = this.options.elems.filter(':first-child');
            if (first && first.size() == 1) {
                if (first.get(0) != currElem.get(0)) {
                    this.forceOpenMenu(first);
                    return;
                }
            }
        }
    },
    selectPrevMenu: function () {
        var currElem = this.options.elems.filter('.selected');
        var prev = currElem.prev();
        if (prev && prev.size() == 1) {
            this.forceOpenMenu(prev);
            return;
        } else {
            var last = this.options.elems.filter(':last-child');
            if (last && last.size() == 1) {
                if (last.get(0) != currElem.get(0)) {
                    this.forceOpenMenu(last);
                    return;
                }
            }
        }
    },
    goUp: function () {
        var menu = this.options.elems.filter('.selected');
        var actions = $('li.action:not(.inactive)', menu);

        if (actions.size() == 0)
            return; // Rien a faire

        var currAction = $('li.action.selected', menu);

        if ((!currAction) || currAction.size() == 0) {
            // On sélectionne le dernier.
            var last = $(actions.get(actions.size() - 1));
            last.addClass('selected');
            return;
        }

        if (actions.size() <= 1)
            return; // Rien a faire

        if (currAction && currAction.size() == 1) {
            var prev = currAction;
            do {
                prev = prev.prev();
            } while (prev && prev.size() > 0 && prev.hasClass('inactive'));
            // } while ((!prev) || prev.size() == 0 || (prev.size() == 1 &&
            // (!prev.hasClass('inactive'))));

            if (prev && prev.size() == 1) {
                $('li.action.selected', menu).removeClass('selected');
                prev.addClass('selected');
                return;
            } else {
                var last = $('li.action:last-child', menu);
                if (last && last.size() == 1) {
                    while (last && last.size() > 0 && last.hasClass('inactive')) {
                        last = last.prev();
                    }

                    if (last && last.size() == 1) {
                        $('li.action.selected', menu).removeClass('selected');
                        last.addClass('selected');
                    }
                }
            }
        }
    },
    goDown: function () {
        var menu = this.options.elems.filter('.selected');
        var actions = $('li.action:not(.inactive)', menu);

        if (actions.size() == 0)
            return; // Rien a faire

        var currAction = $('li.action.selected', menu);

        if ((!currAction) || currAction.size() == 0) {
            // On sélectionne le premier.
            var first = $(actions.get(0));
            first.addClass('selected');
            return;
        }

        if (actions.size() <= 1)
            return; // Rien a faire

        if (currAction && currAction.size() == 1) {
            var next = currAction;
            do {
                next = next.next();
            } while (next && next.size() > 0 && next.hasClass('inactive'));
            // } while ((!prev) || prev.size() == 0 || (prev.size() == 1 &&
            // (!prev.hasClass('inactive'))));

            if (next && next.size() == 1) {
                $('li.action.selected', menu).removeClass('selected');
                next.addClass('selected');
                return;
            } else {
                var first = $('li.action:first-child', menu);
                if (first && first.size() == 1) {
                    while (first && first.size() > 0 && first.hasClass('inactive')) {
                        first = first.next();
                    }

                    if (first && first.size() == 1) {
                        $('li.action.selected', menu).removeClass('selected');
                        first.addClass('selected');
                    }
                }
            }
        }
    },
    removeAllActionsSelected: function () {
        $('li.action.selected', this.element).removeClass('selected');
    },
    triggerAction: function () {
        var menu = this.options.elems.filter('.selected');
        var currAction = $('li.action.selected', menu);

        if (currAction && currAction.size() == 1) {
            //currAction.trigger('click');
            currAction.trigger('mousedown');
        }
    },
    keyPressed: function (event) {
        var combinaison = this.buildKeyString(event);

        var elem = this.options.shortcuts[combinaison];
        if (elem) {
            // S'agit-il d'un raccourci menu ou action ?
            if (elem.parent().parent().hasClass('actions')) {
                console.log('Catched MENU ' + combinaison);
                this.forceOpenMenu(elem);
            } else {
                if (!elem.hasClass('inactive')) {
                    //elem.trigger('click');
                    elem.trigger('mousedown');
                } else {
                    console.log('action inactive : ' + combinaison);
                }
            }

            return false;
        }

        var key = event.which;
        if (this.element.hasClass('active')) {
            // Différentes actions sont possible lorsque le menu est ouvert.

            if (key == 27) {
                this.setUnactive();
                return false;
            }
            if (key == 37) {
                this.selectPrevMenu();
                return false;
            }
            if (key == 39) {
                this.selectNextMenu();
                return false;
            }
            if (key == 38) {
                this.goUp();
                return false;
            }
            if (key == 40) {
                this.goDown();
                return false;
            }
            if (key == 13) {
                // OK, let's run the event.
                this.triggerAction();
                unActiveCurrentActions();
                return false;
            }

            if (key == 93) {
                return false;
            }


            console.log('KEY : ' + key);
        } else {
            if (key == 93) {
                this.forceOpenFirstMenu();
                return false;
            }
        }

        return true;
    },
    options: {
        shortcuts: {}
    }
});


function selectShortcutletter(label, shortcut) {
    // Ok, on commence par splitter le shortcut.

    var splitted = explode('+', shortcut);
    var letter = null;
    for (var i = 0; i < count(splitted); i++) {
        var str = splitted[i];
        if (strlen(str) == 1) {
            letter = str;
            break;
        }
    }

    if (!letter)
        return label;

    letter = strtoupper(letter);

    var res = "";
    for (var i = 0; i < strlen(label); i++) {
        var l = label[i];
        if (strtoupper(l) == letter) {
            res += "<span class='short'>" + l + "</span>" + substr(label, i + 1);
            break;
        } else {
            res += l;
        }
    }

    return res;
}


