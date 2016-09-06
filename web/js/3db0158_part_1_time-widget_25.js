

$.widget('seriel.ser_timeWidget', $.seriel.ser_widget, {
    _create: function () {
        this._super();
        
        // On crée les 3 champs input
        this.options.inputHour = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '[hour]" />');
        this.options.inputMinute = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '[minute]" />');
        this.options.inputSecond = $('<input class="inputs_save" type="hidden" name="' + this.options.inputName + '[second]" />');
        
        this.options.inputHour.appendTo(this.options.widget);
        this.options.inputMinute.appendTo(this.options.widget);
        this.options.inputSecond.appendTo(this.options.widget);

        // On récupère les options si elles sont présente.
        var options_container = $('.options', this.element);
        if (options_container.size() == 1) {
            var opts = $.parseJSON(options_container.html());
            if (opts) {
                for (var key in opts) {
                    this.options[key] = opts[key];
                }
            }
        }
        
        var head = $('<span class="time_widget_head"><ul><li class="empty" tab="empty"><span>Vider</span></li></ul></span>');
        var cont = $('<div class="time_widget_content"></div>');
        cont.html(this.options.content.html());
        this.options.content.html('');
        
        this.options.content.append(head);
        this.options.content.append(cont);
        
        this.options.hour_inp = $('.hour_inp', cont);
        this.options.minutes_inp = $('.minutes_inp', cont);
        
        var val = this.element.attr('val');
        if (val) this.setVal(val);
        
        $('.time_widget_head > ul > li.empty', this.options.content).bind('click', $.proxy(this.empty, this));
        
        var splitted = explode(':', val);
        if (count(splitted) == 2 || count(splitted) == 3) {
        	this.options.hour_inp.val(splitted[0]);
        	this.options.minutes_inp.val(splitted[1]);
        }
        
        var real_allowed_minutes = [];
        var minutes_step = intval(this.options.minutes_inp.attr('step'));
        if (!minutes_step) minutes_step = 5;
        var min = 0;
        while (min < 60) {
        	real_allowed_minutes.push(min);
        	min += minutes_step;
        }
        this.options.allowed_minutes = real_allowed_minutes;
        
        this.options.hour_inp.bind('mouseup mousedown keydown keyup change', $.proxy(this.hourChanged, this));
        this.options.minutes_inp.bind('mouseup mousedown keydown keyup change', $.proxy(this.minutesChanged, this));
        
        this.options.hour_inp.bind('keyup', $.proxy(this.hourKeyUp, this));
        this.options.minutes_inp.bind('keyup', $.proxy(this.minutesKeyUp, this));
        
        this.options.hour_up = $('.hour .plus', cont);
        this.options.hour_down = $('.hour .minus', cont);
        
        this.options.minutes_up = $('.minutes .plus', cont);
        this.options.minutes_down = $('.minutes .minus', cont);
        
        this.options.hour_up.bind('click', $.proxy(this.hourUp, this));
        this.options.hour_down.bind('click', $.proxy(this.hourDown, this));
        
        this.options.minutes_up.bind('click', $.proxy(this.minutesUp, this));
        this.options.minutes_down.bind('click', $.proxy(this.minutesDown, this));
        
        
     // Do we have a title here ?
        if (!this.options.title) {
            var titleSpan = $('.title', this.options.button);
            if (titleSpan.size() == 1) {
                this.options.title = titleSpan.html();
                if (titleSpan.hasClass('fixed')) this.options.fixed_title = true;
            }
        }

        this.options.widget.addClass('ser_time_widget');

        this.refreshButton();
        this.saveInputs();

        if (options_container.size() == 1) {
            options_container.remove();
        }
        
        this.element.bind('after_open', $.proxy(this.onOpen, this));
    },
    onOpen: function() {
    	this.options.hour_inp.focus().select();    	
    },
    hourUp: function() {
    	var val = intval(this.options.hour_inp.val());
    	val++;
    	if (val < 0) val = 0;
    	if (val > 23) val = 23;
    	this.options.hour_inp.val(val);
    	this.options.hour_inp.trigger('change');
    },
    hourDown: function() {
    	var val = intval(this.options.hour_inp.val());
    	val--;
    	if (val < 0) val = 0;
    	if (val > 23) val = 23;
    	this.options.hour_inp.val(val);
    	this.options.hour_inp.trigger('change');
    },
    minutesUp: function() {
    	var val = intval(this.options.minutes_inp.val());
    	for (var i = 0; i < count(this.options.allowed_minutes); i++) {
    		var min = intval(this.options.allowed_minutes[i]);
    		if (min > val) {
    			this.options.minutes_inp.val(min);
    			this.options.minutes_inp.trigger('change');
    			return;
    		}
    	}
    },
    minutesDown: function() {
    	var val = intval(this.options.minutes_inp.val());
    	for (var i = count(this.options.allowed_minutes) - 1; i >= 0; i--) {
    		var min = intval(this.options.allowed_minutes[i]);
    		if (min < val) {
    			this.options.minutes_inp.val(min);
    			this.options.minutes_inp.trigger('change');
    			return;
    		}
    	}
    },
    hourChanged: function() {
    	this.refreshVal();
    },
    minutesChanged: function() {
    	this.refreshVal();
    },
    refreshVal: function() {
    	var hour = this.options.hour_inp.val();
        var minutes = this.options.minutes_inp.val();
        
        var str_minutes = ''+minutes;
        while (strlen(str_minutes) < 2) str_minutes = '0'+str_minutes;
        
        this.setVal(hour+':'+str_minutes);
        this.refreshButton();
    },
    hourKeyUp: function(event) {
    	if (event.which == 39) {
    		this.options.minutes_inp.focus().select();
    	}
    },
    minutesKeyUp: function(event) {
    	if (event.which == 37) {
    		this.options.hour_inp.focus().select();
    	}
    },
    refreshButton: function () {
        var title = '';
        if (this.options.title) title = this.options.title;

        if (this.options.fixed_title) {
            this.displayButtonVal(title);
            return;
        }
        
        title = this.options.val;
        if (title == '00:00' || title == '0:00') title = '';
        this.displayButtonVal(title);
    },
    saveInputs: function() {
    	if (!this.options.val) {
    		this.options.inputHour.val('');
        	this.options.inputMinute.val('');
        	this.options.inputSecond.val('');
        	
        	this.options.inputHour.attr('value', '');
        	this.options.inputMinute.attr('value', '');
        	this.options.inputSecond.attr('value', '');
    	} else {
    		var splitted = explode(':', this.options.val);
    		
    		if (count(splitted) == 2 || count(splitted) == 3) {
    			this.options.inputHour.val(splitted[0]);
    			this.options.inputMinute.val(splitted[1]);
    			this.options.inputSecond.val('0');
    			
    			this.options.inputHour.attr('value', splitted[0]);
            	this.options.inputMinute.attr('value', splitted[2]);
            	this.options.inputSecond.attr('value', '0');
    		}
    	}
    	
    	this.element.trigger('change');
    },
    setVal: function(val) {
    	this.options.val = val;
    	if (!val) {
    		this.options.hour_inp.val('');
    		this.options.minutes_inp.val('');
    	} else {
    		var splitted = explode(':', this.options.val);
    		var hour_val = this.options.hour_inp.val();
    		var minute_val = this.options.minutes_inp.val();
    		
    		if (intval(hour_val) != intval(splitted[0])) this.options.hour_inp.val(splitted[0]);
    		if (intval(minute_val) != intval(splitted[1])) this.options.minutes_inp.val(splitted[1]);
    	}
    	
    	this.saveInputs();
    	this.refreshButton();
    },
    getName: function () {
        return this.options.inputName;
    },
    getVal: function() {
    	return this.options.val;
    },
    displayButtonVal: function (val) {
        if (!val)
            val = "&nbsp;";
        this.options.button.html(val);
    },
    empty: function () {
        this.setVal('');
        this.refreshButton();
        this.saveInputs();
        this.close();
        this.options.hour_inp.val('');
        this.options.minutes_inp.val('');
    },
    options: {
    	prefered_pos: 'bottom',
        title: null,
        fixed_title: false,
        
        val: null,
        
        inputHour: null,
        inputMinute: null,
        inputSecond: null,
        
        hour_inp: null,
    	minutes_inp: null,
    	
    	hour_up: null,
    	hour_down: null,
    	minutes_up: null,
    	minutes_down: null,
    	
    	allowed_minutes: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
    }
});