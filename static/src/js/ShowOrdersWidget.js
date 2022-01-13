odoo.define('pos_customize.ShowOrdersWidget ', function (require) {
    'use strict';

    var gui = require('point_of_sale.gui');
    var chrome = require('point_of_sale.chrome');
    var core = require('web.core');
    var models = require('point_of_sale.models');
    var PosModelSuper = models.PosModel;
    var pos_screens = require('point_of_sale.screens');
    var QWeb = core.qweb;
    var _t = core._t;

    var ShowOrdersWidget = pos_screens.ScreenWidget.extend({
        template: 'ShowOrdersWidget',

        init: function(options){
            this._super(parent,options);
            this.filter = null;
            this.searchDetails = {};
            this.hidden = false;
            this.order_cache = new pos_screens.DomCache();//new DomCache();
            this.order_by_id = {};
            this.order_write_date = null;
            this.details_visible = false;
             this.editing_client = false;
            this.integer_order_details = ['country_id', 'state_id', 'property_product_pricelist'];
            this.old_order = this.pos.get_order();
        },

        auto_back: true,
        show: function(){
            var self = this;
            this._super();
            this.renderElement();

            var screen = (this.gui.pos.get_order() ? this.gui.pos.get_order().get_screen_data('previous-screen') : this.gui.startup_screen) || this.gui.startup_screen;
            this.$('.back').click(function(){
                self.gui.show_screen(screen);
            });

//            this.$('.show-order-list-lines').on('click', '.order-line', function(event){
////                self.line_select(event,$(this),parseInt($(this).data('id')));
//
//                  var order = self.get_order_by_id(parseInt($(this).data('id')));//this.pos.db.get_partner_by_id(id);
//
//                  //console.log('update client',this.pos.get_client());
//                  var get_order = self.getOrder()
//                  self.setOrder(order);
//                  this.close();
//                  var get = self.getOrder();
//                  if (order === this.pos.get_order()) {
//                    console.log('equal orders');
//                    this.close();
//                    }
//            });
            //filter orders by session_id
            //console.log('session',this.pos.pos_session.id)
            var pos_orders = this.pos.pos_orders;
            //console.log('pos_orders before filter',pos_orders);
            var filtered_orders = [];
            for (var i in pos_orders) {
                if(this.pos.pos_session.id === pos_orders[i].session_id[0])
                {
                   // console.log(' success session',pos_orders[i].session_id[0], pos_orders[i].id)
                    filtered_orders[i] = pos_orders[pos_orders[i].id];
                    //console.log('filtered_orders',filtered_orders);
                }
            }

            this.render_list(filtered_orders);
            var search_timeout = null;
            if(this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard){
                this.chrome.widget.keyboard.connect(this.$('.searchbox input'));
            }
            this.$('.searchbox input').on('keyup',function(event){
                clearTimeout(search_timeout);
                var query = this.value;
                search_timeout = setTimeout(function(){
                    self.perform_search(query,event.which === 13);
                },70);
            });
            this.$('.searchbox .search-clear').click(function(){
                self.clear_search();
            });
        },

//        setOrder: function(order) {
//            //this.pos.set({ 'orders': order });
//            //const screen = order.get_screen_data();
//           // console.log('screen name', screen.name);
//            //return this.constants.screenToStatusMap[screen.name];
//
//            this.pos.set_order(order);
//        },
//
//        getOrder: function() {
//            console.log('get order !!',this.pos.get_order());
//            return this.pos.get_order();
//        },
//
        //  returns the order with the id provided
        get_order_by_id: function (id) {
            //console.log('update client',this.pos.get_client());
            return this.pos.pos_orders[id];
        },

        perform_search: function(query, associate_result){
            var new_orders;
            if(query){
                new_orders = this.search_order(query);
                this.render_list(new_orders);
            }else{
                var orders = this.pos.pos_orders;
                this.render_list(orders);
            }
        },

        search_order: function(query){
          var self = this;
          try {
          query = query.replace(/[\[\]\(\)\+\*\?\.\-\!\&\^\$\|\~\_\{\}\:\,\\\/]/g,'.');
          query = query.replace(' ','.+');
          var re = RegExp("([0-9]+):.*?"+query,"gi");
            }catch(e){
                return [];
            }
            var results = [];
            for(var i = 0; i < self.pos.pos_orders.length; i++){
                var r = re.exec(this.order_string);
                if(r){
                    var id = Number(r[1]);
                    results.push(this.get_order_by_id(id));
                }else{
                    break;
                }
            }
            var uniqueresults = [];
            $.each(results, function(i, el){
                if($.inArray(el, uniqueresults) === -1) uniqueresults.push(el);
            });
            return uniqueresults;
        },

        clear_search: function(){
            var orders = this.pos.pos_orders;
            this.render_list(orders);
            this.$('.searchbox input')[0].value = '';
            this.$('.searchbox input').focus();
        },

//        line_select: function(event,$line,id){
//        console.log('line_select', event,$line,id);
//        var order = this.get_order_by_id(id);//this.pos.db.get_partner_by_id(id);
//        this.$('.client-list .lowlight').removeClass('lowlight');
//        if ( $line.hasClass('highlight') ){
//            $line.removeClass('highlight');
//            $line.addClass('lowlight');
//            this.display_order_details('hide',order);
//            this.new_client = null;
//            this.toggle_save_button();
//        }else{
//            this.$('.client-list .highlight').removeClass('highlight');
//            $line.addClass('highlight');
//            var y = event.pageY - $line.parent().offset().top;
//            this.display_client_details('show',order,y);
//            this.new_client = partner;
//            this.toggle_save_button();
//        }
//        },

    // Shows,hides or edit the customer details box :
    // visibility: 'show', 'hide' or 'edit'
    // partner:    the partner object to show or edit
    // clickpos:   the height of the click on the list (in pixel), used
    //             to maintain consistent scroll.
//    display_order_details: function(visibility,order,clickpos){
//        var self = this;
//        var searchbox = this.$('.searchbox input');
//        var contents = this.$('.order-details-contents');
//        var parent   = this.$('.client-list').parent();
//        var scroll   = parent.scrollTop();
//        var height   = contents.height();
//
//        contents.off('click','.button.edit');
//        contents.off('click','.button.save');
//        contents.off('click','.button.undo');
//        contents.on('click','.button.edit',function(){ self.edit_order_details(order); });
//        contents.on('click','.button.save',function(){ self.save_order_details(order); });
//        contents.on('click','.button.undo',function(){ self.undo_order_details(order); });
//        this.editing_client = false;
//        this.uploaded_picture = null;
//
//        if(visibility === 'show'){
//            contents.empty();
//            contents.append($(QWeb.render('OrderDetails',{widget:this,order:order})));
//
//            var new_height   = contents.height();
//
//            if(!this.details_visible){
//                // resize client list to take into account client details
//                parent.height('-=' + new_height);
//
//                if(clickpos < scroll + new_height + 20 ){
//                    parent.scrollTop( clickpos - 20 );
//                }else{
//                    parent.scrollTop(parent.scrollTop() + new_height);
//                }
//            }else{
//                parent.scrollTop(parent.scrollTop() - height + new_height);
//            }
//
//            this.details_visible = true;
//            this.toggle_save_button();
//        } else if (visibility === 'edit') {
//            // Connect the keyboard to the edited field
//            if (this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard) {
//                contents.off('click', '.detail');
//                searchbox.off('click');
//                contents.on('click', '.detail', function(ev){
//                    self.chrome.widget.keyboard.connect(ev.target);
//                    self.chrome.widget.keyboard.show();
//                });
//                searchbox.on('click', function() {
//                    self.chrome.widget.keyboard.connect($(this));
//                });
//            }
//
//            this.editing_client = true;
//            contents.empty();
//            contents.append($(QWeb.render('ClientDetailsEdit',{widget:this,partner:partner})));
//            this.toggle_save_button();
//
//            // Browsers attempt to scroll invisible input elements
//            // into view (eg. when hidden behind keyboard). They don't
//            // seem to take into account that some elements are not
//            // scrollable.
//            contents.find('input').blur(function() {
//                setTimeout(function() {
//                    self.$('.window').scrollTop(0);
//                }, 0);
//            });
//
//            contents.find('.client-address-country').on('change', function (ev) {
//                var $stateSelection = contents.find('.client-address-states');
//                var value = this.value;
//                $stateSelection.empty()
//                $stateSelection.append($("<option/>", {
//                    value: '',
//                    text: 'None',
//                }));
//                self.pos.states.forEach(function (state) {
//                    if (state.country_id[0] == value) {
//                        $stateSelection.append($("<option/>", {
//                            value: state.id,
//                            text: state.name
//                        }));
//                    }
//                });
//            });
//
//            contents.find('.image-uploader').on('change',function(event){
//                if (event.target.files.length) {
//                    self.load_image_file(event.target.files[0],function(res){
//                        if (res) {
//                            contents.find('.client-picture img, .client-picture .fa').remove();
//                            contents.find('.client-picture').append("<img src='"+res+"'>");
//                            contents.find('.detail.picture').remove();
//                            self.uploaded_picture = res;
//                        }
//                    });
//                }
//            });
//        } else if (visibility === 'hide') {
//            contents.empty();
//            parent.height('100%');
//            if( height > scroll ){
//                contents.css({height:height+'px'});
//                contents.animate({height:0},400,function(){
//                    contents.css({height:''});
//                });
//            }else{
//                parent.scrollTop( parent.scrollTop() - height);
//            }
//            this.details_visible = false;
//            this.toggle_save_button();
//        }
//    },
//        toggle_save_button: function(){
//        var $button = this.$('.button.next');
//        if (this.editing_client) {
//            $button.addClass('oe_hidden');
//            return;
//        } else if( this.new_client ){
//            if( !this.old_order){
//                $button.text(_t('Set Customer'));
//            }else{
//                $button.text(_t('Change Customer'));
//            }
//        }else{
//            $button.text(_t('Deselect Customer'));
//        }
//        $button.toggleClass('oe_hidden',!this.has_client_changed());
//    },
//
//    has_order_changed: function(){
//    if( this.old_order && this.new_client ){
//        return this.old_order.id !== this.new_client.id;
//    }else{
//        return !!this.old_order !== !!this.new_client;
//    }
//    },
//
//    // ui handle for the 'edit selected customer' action
//    edit_order_details: function(order) {
//        this.display_order_details('edit',order);
//    },

      // what happens when we save the changes on the client edit form -> we fetch the fields, sanitize them,
    // send them to the backend for update, and call saved_client_details() when the server tells us the
    // save was successfull.
//    save_order_details: function(order) {
//        var self = this;
//
//        var fields = {};
//        this.$('.order-details-contents .detail').each(function(idx,el){
//            if (self.integer_order_details.includes(el.name)){
//                var parsed_value = parseInt(el.value, 10);
//                if (isNaN(parsed_value)){
//                    fields[el.name] = false;
//                }
//                else{
//                    fields[el.name] = parsed_value
//                }
//            }
//            else{
//                fields[el.name] = el.value || false;
//            }
//        });
//
//        if (!fields.name) {
//            this.gui.show_popup('error',_t('An Order Name Is Required'));
//            return;
//        }
//
//        if (this.uploaded_picture) {
//            fields.image_1920 = this.uploaded_picture;
//        }
//
//        fields.id = order.id || false;
//
//        var contents = this.$(".order-details-contents");
//        contents.off("click", ".button.save");
//
//
//        rpc.query({
//                model: 'pos.order',
//                method: 'create_from_ui',
//                args: [fields],
//            })
//            .then(function(order_id){
//                self.saved_client_details(order_id);
//            }).catch(function(error){
//                error.event.preventDefault();
//                var error_body = _t('Your Internet connection is probably down.');
//                if (error.message.data) {
//                    var except = error.message.data;
//                    error_body = except.arguments && except.arguments[0] || except.message || error_body;
//                }
//                self.gui.show_popup('error',{
//                    'title': _t('Error: Could not Save Changes'),
//                    'body': error_body,
//                });
//                contents.on('click','.button.save',function(){ self.save_order_details(order); });
//            });
//    },
//
//     // ui handle for the 'cancel order edit changes' action
//    undo_order_details: function(order) {
//        if (!order.id) {
//            this.display_order_details('hide');
//        } else {
//            this.display_order_details('show',order);
//        }
//    },
//
//    // what happens when we've just pushed modifications for a order of id order_id
//    saved_order_details: function (order_id) {
//        var self = this;
//        var always = function () {
//            $(".order-details-contents").on('click', '.button.save', function () {
//                self.save_order_details(order);
//            });
//        };
//        return this.reload_orders().then( function() {
//            var order = this.order_by_id[id];//self.pos.db.get_partner_by_id(partner_id);
//            if (partner) {
//                self.new_client = order;
//                self.toggle_save_button();
//                self.display_order_details('show',order);
//            } else {
//                // should never happen, because create_from_ui must return the id of the partner it
//                // has created, and reload_partner() must have loaded the newly created partner.
//                self.display_order_details('hide');
//            }
//        }).then(always, always);
//    },

     // This fetches partner changes on the server, and in case of changes,
    // rerenders the affected views
//    reload_orders: function(){
//        var self = this;
//        return load_new_orders().then(function(){
//            // partners may have changed in the backend
//            self.orderer_cache = new DomCache();
//
//            self.render_list(get_orders_sorted(1000));
//
//            // update the currently assigned client if it has been changed in db.
//            var curr_client = self.pos.get_order().get_client();
//            if (curr_client) {
//                self.pos.get_order().set_client(self.pos.db.get_partner_by_id(curr_client.id));
//            }
//        });
//    },
//
//    get_orders_sorted: function(max_count){
//        max_count = max_count ? Math.min(this.order_sorted.length, max_count) : this.order_sorted.length;
//        var orders = [];
//        for (var i = 0; i < max_count; i++) {
//            orders.push(this.order_by_id[this.order_sorted[i]]);
//        }
//        return orders;
//    },
//
//     get_order_by_id: function(id){
//        return order_by_id[id];
//    },
     // reload the list of partner, returns as a promise that resolves if there were
    // updated partners, and fails if not
//    load_new_orders: function(){
//        var self = this;
//        return new Promise(function (resolve, reject) {
//            var fields = _.find(self.models, function(model){ return model.label === 'load_orders'; }).fields;
//            var domain = self.prepare_new_orders_domain();
//            rpc.query({
//                model: 'pos.order',
//                method: 'search_read',
//                args: [domain, fields],
//            }, {
//                timeout: 3000,
//                shadow: true,
//            })
//            .then(function (orders) {
//                if (self.db.add_orders(orders)) {   // check if the partners we got were real updates
//                    resolve();
//                } else {
//                    reject();
//                }
//            }, function (type, err) { reject(); });
//        });
//    },

//     prepare_new_orders_domain: function(){
//        return [['write_date','>', this.get_order_write_date()]];
//    },
//
//    get_order_write_date: function(){
//        return this.order_write_date || "1970-01-01 00:00:00";
//    },

//     add_orders: function(orders){
//        var updated_count = 0;
//        var new_write_date = '';
//        var order;
//        for(var i = 0, len = orders.length; i < len; i++){
//            order = orders[i];
//
//            var local_order_date = (this.order_write_date || '').replace(/^(\d{4}-\d{2}-\d{2}) ((\d{2}:?){3})$/, '$1T$2Z');
//            var dist_order_date = (order.write_date || '').replace(/^(\d{4}-\d{2}-\d{2}) ((\d{2}:?){3})$/, '$1T$2Z');
//            if (    this.order_write_date &&
//                    this.order_by_id[order.id] &&
//                    new Date(local_order_date).getTime() + 1000 >=
//                    new Date(dist_order_date).getTime() ) {
//                // FIXME: The write_date is stored with milisec precision in the database
//                // but the dates we get back are only precise to the second. This means when
//                // you read partners modified strictly after time X, you get back partners that were
//                // modified X - 1 sec ago.
//                continue;
//            } else if ( new_write_date < order.write_date ) {
//                new_write_date  = order.write_date;
//            }
//            if (!this.order_by_id[order.id]) {
//                this.order_sorted.push(order.id);
//            }
//            this.order_by_id[order.id] = order;
//
//            updated_count += 1;
//        }
//
//        this.order_write_date = new_order_date || this.order_write_date;
//
//        if (updated_count) {
//            // If there were updates, we need to completely
//            // rebuild the search string and the barcode indexing
//
//            this.order_search_string = "";
//            this.order_by_barcode = {};
//
//            for (var id in this.order_by_id) {
//                order = this.order_by_id[id];
//
////                if(order.barcode){
////                    this.order_by_barcode[order.barcode] = order;
////                }
////                order.address = (order.street ? partner.street + ', ': '') +
////                                  (order.zip ? partner.zip + ', ': '') +
////                                  (order.city ? partner.city + ', ': '') +
////                                  (order.state_id ? partner.state_id[1] + ', ': '') +
////                                  (order.country_id ? partner.country_id[1]: '');
//                this.order_search_string += this._order_search_string(order);
//            }
//
//            this.order_search_string = utils.unaccent(this.order_search_string);
//        }
//        return updated_count;
//    },

//        back: function() {
//        var previous = this.pos.get_order().get_screen_data('previous-screen');
//        if (previous) {
//            this.show_screen(previous);
//        }
//        },
//
//        selectOrder: function(order) {
//            console.log('selectorder!!!');
//            this._setOrder(order);
//            if (order === this.pos.get_order()) {
//                this.close();
//            }
//        },
//
//         _setOrder(order) {
//            this.pos.set_order(order);
//        },

        render_list: function(orders){
            var self = this;
            for(var i = 0, len = Math.min(orders.length,1000); i < len; i++) {
                if (orders[i]) {
                    var order = orders[i];
                    self.order_string += i + ':' + order.pos_reference + '\n';
                }
            }
            var contents = this.$el[0].querySelector('.show-order-list-lines');
            if (contents){
                contents.innerHTML = "";
                for(var i = 0, len = Math.min(orders.length,1000); i < len; i++) {
                   if (orders[i]) {
                    var order = orders[i];
                    var clientline_html = QWeb.render('ShowOrderLines', {widget: this, order: order});
                    var orderline = document.createElement('tbody');
                    orderline.innerHTML = clientline_html;
                    orderline = orderline.childNodes[1];
                    contents.appendChild(orderline);
                   }
                }
            }
        },
    });

    models.load_models({
        model: 'pos.order',
        fields: ['id', 'name', 'session_id', 'state', 'pos_reference', 'partner_id', 'amount_total','lines', 'amount_tax','sequence_number', 'fiscal_position_id', 'pricelist_id', 'create_date'],
        domain: function(self){ return [['company_id','=',self.company.id]]; },
        loaded: function (self, pos_orders) {
           //console.log('models.load_models');

            var orders = [];
            for (var i in pos_orders){
                orders[pos_orders[i].id] = pos_orders[i];
            }
            self.pos_orders = orders;
            self.order = [];
            for (var i in pos_orders){
                self.order[i] = pos_orders[i];
            }
        },
    });

    models.PosModel = models.PosModel.extend({
      _save_to_server: function (orders, options) {
      //console.log('_save_to_server');
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
                self.gui.screen_instances.ShowOrdersWidget.render_list(orders_list);
            }
            return result_new;
        },
    });

    gui.define_screen({name:'ShowOrdersWidget', widget: ShowOrdersWidget});
    return {
        ShowOrdersWidget: ShowOrdersWidget,
    }
});

