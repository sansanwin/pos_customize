from itertools import groupby
from re import search

from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    delivery_address = fields.Char(string='Delivery Address')
    delivery_date = fields.Datetime(string='Deliver Date', index=True, default=fields.Datetime.now)

    @api.model
    def _order_fields(self, ui_order):
        order_fields = super(PosOrder, self)._order_fields(ui_order)
        order_fields['delivery_address'] = ui_order.get('delivery_address', False)
        return order_fields
