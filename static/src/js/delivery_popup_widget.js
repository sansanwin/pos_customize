odoo.define('pos_customize.delivery_popup_widget', function(require) {
"use strict";

    var core = require('web.core');
    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var gui = require('point_of_sale.gui');
    var PopupWidget = require('point_of_sale.popups');
    var PaymentScreenWidget = screens.PaymentScreenWidget;
    var PosBaseWidget = require('point_of_sale.BaseWidget');
    var BarcodeEvents = require('barcodes.BarcodeEvents').BarcodeEvents;
    var time = require('web.time');
    var QWeb = core.qweb;
    var _t = core._t;

    PaymentScreenWidget.include({
    init: function(parent, options) {
            var self = this;
            this._super(parent, options);

            this.pos.bind('change:selectedOrder', function() {
                this.renderElement();
                this.watch_order_changes();
            }, this);
            this.watch_order_changes();

            this.inputbuffer = "";
            this.firstinput = true;
            this.decimal_point = 	_t.database.parameters.decimal_point;

            // This is a keydown handler that prevents backspace from
            // doing a back navigation. It also makes sure that keys that
            // do not generate a keypress in Chrom{e,ium} (eg. delete,
            // backspace, ...) get passed to the keypress handler.
            this.keyboard_keydown_handler = function(event) {
                if (event.keyCode === 8 || event.keyCode === 46) {
                 self.keyboard_handler(event);
                }
            };
            this.keyboard_handler = function(event) {
                // On mobile Chrome BarcodeEvents relies on an invisible
                // input being filled by a barcode device. Let events go
                // through when this input is focused.
                if (BarcodeEvents.$barcodeInput && BarcodeEvents.$barcodeInput.is(":focus")) {
                    return;
                }

                var key = '';

                if (event.type === "keypress") {
                    if (event.keyCode === 13) { // Enter
                        self.validate_order();
                    } else if (event.keyCode === 190 || // Dot
                        event.keyCode === 110 || // Decimal point (numpad)
                        event.keyCode === 188 || // Comma
                        event.keyCode === 46) { // Numpad dot
                        key = self.decimal_point;
                    } else if (event.keyCode >= 48 && event.keyCode <= 57) { // Numbers
                        key = '' + (event.keyCode - 48);
                    } else if (event.keyCode === 45) { // Minus
                        key = '-';
                    } else if (event.keyCode === 43) { // Plus
                        key = '+';
                    }
                } else { // keyup/keydown
                    if (event.keyCode === 46) { // Delete
                        key = 'CLEAR';
                    } else if (event.keyCode === 8) { // Backspace
                        key = 'BACKSPACE';
                    }
                }
                };
                this.pos.bind('change:selectedClient', function() {
                self.customer_changed();
            }, this);
            //console.log("Init - ",this);
        },

    renderElement: function() {
            var self = this;
            this._super();
            this.$('.popup_notes').click(function() {
                self.get_popup_data();
            });
        },
        get_popup_data: function() {
        var self = this;
        self.gui.show_popup('textinput', {
                title: _t('Delivery Address'),
                confirm: function() {
                var order = self.pos.get_order();
                var note_value = this.$('input,textarea').val();
                //console.log("get_select_data - ", note_value);
                order.set_note_value(note_value);
                //order.set_note_value(document.getElementsByName("textinput")[0].value)
                },
                cancel: function() {},
            });
        this.$('.popup_notes').toggleClass('highlight');
        },
        });

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function(attr, options) {
            this.to_email       = false;
            this.note_value = false;
            //console.log("initialize-", note_value);
            _super_order.initialize.apply(this, arguments);
        },

        set_note_value: function(note_value) {
            //console.log("set_note_value - ",this.note_value);
            this.note_value = note_value;
        },
        get_note_value: function() {
            //console.log("get_note_value - ", this.note_value);
            return this.note_value;
        },

        export_as_JSON: function() {
            var json = _super_order.export_as_JSON.apply(this, arguments);
            var order = this.pos.get('selectedOrder');
            if (order) {
            //console.log("export_as_JSON - ", order, this.note_value);
            // json.field_input_value = this.note_value;
            json.delivery_address = this.note_value;
            }
            //console.log(" return Json - ", json);
            return json
        },
    });

});