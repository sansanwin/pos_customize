odoo.define('pos_customize.PopupNote', function(require) {
'use strict';
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');

    /**
     * @props client
     * @emits click-customer
     * @emits click-pay
     */
    class PopupNote extends PosComponent {
        display_popup_note() {
          var core = require('web.core');
          var _t = core._t;
           this.showPopup("PopupNote", {
           title : _t("Delivery Address!"),
           confirmText: _t("Confirm")
              });
          }
//
//          click_confirm: function() {
//            var value = this.$('input,textarea').val();
//
//            this.gui.close_popup();
//            if (this.options.confirm) {
//                this.options.confirm.call(this, value);
//                }
//          }


    }
    PopupNote.template = 'PopupNote';

    Registries.Component.add(PopupNote);

    return PopupNote;

    });