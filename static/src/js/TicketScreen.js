odoo.define('pos_customize.TicketScreen', function (require) {
    'use strict';
     var gui = require('point_of_sale.gui');
    var chrome = require('point_of_sale.chrome');
    var core = require('web.core');
    var models = require('point_of_sale.models');
    var PosModelSuper = models.PosModel;
    var pos_screens = require('point_of_sale.screens');
    var QWeb = core.qweb;
    var _t = core._t;

    var TicketScreen = pos_screens.ScreenWidget.extend({
        template:'TicketScreen',

        init: function(parent, options){
            console.log('TicketScreen init',parent, options);
            //var order = this.pos.get_order();
            this._super(parent, options);

            this.order_string = "";
            var orders = this.pos.pos_orders;
            console.log('init orders - ',orders);
            this.pos.get('orders').bind('add remove change',this.renderElement,this);
            this.pos.bind('change:selectedOrder',this.renderElement,this);
            this.searchDetails = {};
            this.filter = null;

            var order = this.pos.get_order();
            //console.log('orderlist[13]', orders[13]);
            var data = {
            widget: this,
             pos: this.pos,
             order: order,
            //receipt: order.export_for_printing(),
            orders_list: orders[13],
            //paymentlines: order.get_paymentlines(),
             };
            //console.log('data', data);
            var receipt = QWeb.render('TicketScreen', data);
        },

        show: function(){
            console.log('show');
            var self = this;
            this._super();
            this.renderElement();
            var screen = (this.gui.pos.get_order() ? this.gui.pos.get_order().get_screen_data('previous-screen') : this.gui.startup_screen) || this.gui.startup_screen;
           // this.filteredOrderList = this.pos.pos_orders;
            this.$('.back').click(function(){
                //self.gui.back();
                this.gui.show_screen(screen);
            });
           },

        getDate: function(order) {
            return moment(order.creation_date).format('YYYY-MM-DD hh:mm A');
        },
        getTotal: function(order) {
            return this.env.pos.format_currency(order.get_total_with_tax());
        },
        getCustomer: function(order) {
            return order.get_client_name();
        },
        getCardholderName: function(order) {
            return order.get_cardholder_name();
        },
        getEmployee: function(order) {
            return order.employee ? order.employee.name : '';
        },
        getStatus: function(order) {
            const screen = order.get_screen_data();
            return this.constants.screenToStatusMap[screen.name];
        },
//        renderElement: function () {
//        this._super();
//        this.$('.back').click(function () {
//            this.gui.back();
//            });
//        this.$('.next').click(function () {
//            // some actions
//            });
//        },

//        mounted() {
//            posbus.on('ticket-button-clicked', this, this.close);
//            this.pos.get('orders').on('add remove change', () => this.render(), this);
//            this.pos.on('change:selectedOrder', () => this.render(), this);
//        },
//        willUnmount() {
//            posbus.off('ticket-button-clicked', this);
//            this.pos.get('orders').off('add remove change', null, this);
//            this.pos.off('change:selectedOrder', null, this);
//        },
//        _onFilterSelected(event) {
//            this.filter = event.detail.filter;
//            this.render();
//        },
//        _onSearch(event) {
//            const searchDetails = event.detail;
//            Object.assign(this.searchDetails, searchDetails);
//            this.render();
//        },
//        /**
//         * Override to conditionally show the new ticket button.
//         */
//        get showNewTicketButton() {
//            return true;
//        },
//        get orderList() {
//           var pos_orders = this.pos.pos_orders;
//           console.log('pos_orders show--',pos_orders);
//           console.log('orderList',this.pos.pos_orders);
//           return this.pos.pos_orders();
//           //return this.pos.get_order_list();
//        },
//        filteredOrderList: function() {
//            console.log('filteredOrderList');
//            var pos_orders = this.pos.pos_orders;
//            //console.log('filteredOrderList',this.models);
//            const { AllTickets } = this.getOrderStates();
//            var order = this.pos.pos_orders;
//            const filterCheck = (order) => {
//                if (this.filter && this.filter !== AllTickets) {
//                    const screen = order.get_screen_data();
//                    return this.filter === this.constants.screenToStatusMap[screen.name];
//                }
//                return true;
//            };
//            console.log('filtercheck');
//            const { fieldValue, searchTerm } = this.searchDetails;
//            const fieldAccessor = this._searchFields[fieldValue];
//            const searchCheck = (order) => {
//                if (!fieldAccessor) return true;
//                const fieldValue = fieldAccessor(order);
//                if (fieldValue === null) return true;
//                if (!searchTerm) return true;
//                return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
//            };
//            const predicate = (order) => {
//                return filterCheck(order) && searchCheck(order);
//            };
            //return this.orderList.filter(predicate);
//            return pos_orders;
//        },
//        selectOrder(order) {
//            this._setOrder(order);
//            if (order === this.pos.get_order()) {
//                this.close();
//            }
//        },
//        _setOrder(order) {
//            this.pos.set_order(order);
//        },
//        createNewOrder() {
//            this.pos.add_new_order();
//        },
//        async deleteOrder(order) {
//            const screen = order.get_screen_data();
//            if (['ProductScreen', 'PaymentScreen'].includes(screen.name) && order.get_orderlines().length > 0) {
//                const { confirmed } = await this.showPopup('ConfirmPopup', {
//                    title: 'Existing orderlines',
//                    body: `${order.name} has total amount of ${this.getTotal(
//                        order
//                    )}, are you sure you want delete this order?`,
//                });
//                if (!confirmed) return;
//            }
//            if (order) {
//                await this._canDeleteOrder(order);
//                order.destroy({ reason: 'abandon' });
//            }
//            posbus.trigger('order-deleted');
//        },
//        getDate(order) {
//            return moment(order.creation_date).format('YYYY-MM-DD hh:mm A');
//        },
//        getTotal(order) {
//            return this.pos.format_currency(order.get_total_with_tax());
//        },
//        getCustomer(order) {
//            return order.get_client_name();
//        },
//        getCardholderName(order) {
//            return order.get_cardholder_name();
//        },
//        getEmployee(order) {
//            return order.employee ? order.employee.name : '';
//        },
//        getStatus(order) {
//            const screen = order.get_screen_data();
//            return this.constants.screenToStatusMap[screen.name];
//        },
//        /**
//         * Hide the delete button if one of the payments is a 'done' electronic payment.
//         */
//        hideDeleteButton(order) {
//            return order
//                .get_paymentlines()
//                .some((payment) => payment.is_electronic() && payment.get_payment_status() === 'done');
//        },
//        showCardholderName() {
//            console.log('showCardholderName');
//            return this.pos.payment_methods.some(method => method.use_payment_terminal);
//        },
//        get searchBarConfig() {
//            return {
//                searchFields: this.constants.searchFieldNames,
//                filter: { show: true, options: this.filterOptions },
//            };
//        },
//        get filterOptions() {
//            const { AllTickets, Ongoing, Payment, Receipt } = this.getOrderStates();
//            return [AllTickets, Ongoing, Payment, Receipt];
//        },
//        /**
//         * An object with keys containing the search field names which map to functions.
//         * The mapped functions will be used to generate representative string for the order
//         * to match the search term when searching.
//         * E.g. Given 2 orders, search those with `Receipt Number` containing `1111`.
//         * ```
//         * orders = [{
//         *    name: '000-1111-222'
//         *    total: 10,
//         *   }, {
//         *    name: '444-5555-666'
//         *    total: 15,
//         * }]
//         * ```
//         * `Receipt Number` search field maps to the `name` of the order. So, the orders will be
//         * represented by their name, and the search will result to:
//         * ```
//         * result = [{
//         *    name: '000-1111-222',
//         *    total: 10,
//         * }]
//         * ```
//         * @returns Record<string, (models.Order) => string>
//         */
//        get _searchFields() {
//            const { ReceiptNumber, Date, Customer, CardholderName } = this.getSearchFieldNames();
//            var fields = {
//                [ReceiptNumber]: (order) => order.name,
//                [Date]: (order) => moment(order.creation_date).format('YYYY-MM-DD hh:mm A'),
//                [Customer]: (order) => order.get_client_name(),
//            };
//
//            if (this.showCardholderName()) {
//                fields[CardholderName] = (order) => order.get_cardholder_name();
//            }
//
//            return fields;
//        },
//        /**
//         * Maps the order screen params to order status.
//         */
//        get _screenToStatusMap() {
//            const { Ongoing, Payment, Receipt } = this.getOrderStates();
//            return {
//                ProductScreen: Ongoing,
//                PaymentScreen: Payment,
//                ReceiptScreen: Receipt,
//            };
//        },
//        _initializeSearchFieldConstants() {
//            this.constants = {};
//            Object.assign(this.constants, {
//                searchFieldNames: Object.keys(this._searchFields),
//                screenToStatusMap: this._screenToStatusMap,
//            });
//        },
//        async _canDeleteOrder(order) {
//            return true;
//        },
//        getOrderStates() {
//            return {
//                AllTickets: this._t('All Tickets'),
//                Ongoing: this._t('Ongoing'),
//                Payment: this._t('Payment'),
//                Receipt: this._t('Receipt'),
//            };
//        },
//        getSearchFieldNames() {
//            return {
//                ReceiptNumber: this._t('Receipt Number'),
//                Date: this._t('Date'),
//                Customer: this._t('Customer'),
//                CardholderName: this._t('Cardholder Name'),
//            };
//        },

});

    models.load_models({
        model: 'pos.order',
        fields: ['id', 'name', 'session_id', 'state', 'pos_reference', 'partner_id', 'amount_total','lines', 'amount_tax','sequence_number', 'fiscal_position_id', 'pricelist_id', 'create_date'],
        domain: function(self){ return [['company_id','=',self.company.id]]; },
        loaded: function (self, pos_orders) {
            console.log('models.load_models');
            var orders = [];
            for (var i in pos_orders){
                orders[pos_orders[i].id] = pos_orders[i];
            }
            self.pos_orders = orders;
            self.order = [];
            for (var i in pos_orders){
                self.order[i] = pos_orders[i];
                console.log('self.order[i]',self.order[i].name)
            }
        },
    });

    models.PosModel = models.PosModel.extend({
      _save_to_server: function (orders, options) {
      console.log(' models.PosModel');
      var result_new = PosModelSuper.prototype._save_to_server.call(this, orders, options);
       var self = this;
       var new_order = {};
       var orders_list = self.pos_orders;
        for (var i in orders) {
          var partners = self.partners;
          var partner = "";
          for(var j in partners){
               if(partners[j].id == orders[i].data.partner_id){
                    partner = partners[j].name;
                 }
             }
                new_order = {
                    'amount_tax': orders[i].data.amount_tax,
                    'amount_total': orders[i].data.amount_total,
                    'pos_reference': orders[i].data.name,
                    'partner_id': [orders[i].data.partner_id, partner],
                    'session_id': [self.pos_session.id, self.pos_session.name]
                };
                orders_list.push(new_order);
                self.pos_orders = orders_list;
                self.gui.screen_instances.TicketScreen.render_list(orders_list);
            }
            return result_new;
        },
    });

    gui.define_screen({name :'TicketScreen',widget : TicketScreen});

    return {
        TicketScreen : TicketScreen,
    };

});