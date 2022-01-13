odoo.define('pos_customize.TicketButtonWidget', function (require) {
    'use strict';

    var gui = require('point_of_sale.gui');
    var models = require('point_of_sale.models');
    var core = require('web.core');
    var rpc = require('web.rpc');
    var utils = require('web.utils');
    var field_utils = require('web.field_utils');
    var BarcodeEvents = require('barcodes.BarcodeEvents').BarcodeEvents;
    var Printer = require('point_of_sale.Printer').Printer;
    var pos_screens = require('point_of_sale.screens');

    var QWeb = core.qweb;
    var _t = core._t;

    var chrome = require("point_of_sale.chrome");
    var PosBaseWidget = require('point_of_sale.BaseWidget');

    chrome.Chrome.include({
            build_widgets: function(){
                this.widgets.push({
                    'name':   'ticketbuttonwidget',
                    'widget': TicketButtonWidget,
                    'replace':  '.placeholder-TicketButtonWidget',
                    //'replace': 'TicketButtonWidget',
                    });
                this._super();
            },

        });

    var TicketButtonWidget = PosBaseWidget.extend({
    template:'TicketButtonWidget',
    init: function(parent) {
        this._super(parent);
    },

    renderElement: function(){
        var self = this;
        this._super();
        console.log('count',this.count());
        //console.log('render');
        this.$('.ticket-button').click(function(){
                self.order_click_handler();
        });
         //this.$('.ticket-button').prependTo({ 'with-badge':this.pos.get_order_list().length});
        //console.log('badge -', this.$el = $('<div class="with-badge" t-att-badge="count"/>'));

    },
    order_click_handler: function() {
       this.gui.show_screen('ShowOrdersWidget');
       //this.gui.show_screen('TicketScreen');
    },

    count() {
        if (this.pos) {
            return this.pos.get_order_list().length;
        } else {
            return 0;
        }
    },

});

return {
        'TicketButtonWidget': TicketButtonWidget,
    };

});
