# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name': 'POS_Customize',
    'version': '1.0',
    'summary': 'POS Customize',
    'sequence': 10,
    'description': """POS Customize Software""",
    'category': 'Productivity',
    'website': 'https://www.odoo.com/page/billing',
    'license': 'LGPL-3',
    'depends': [
                'base',
                'point_of_sale',
                'pos_restaurant',
                ],
    'data': [
        'views/pos_order_view.xml',
        'views/templates.xml',

        ],
    'demo': [],
    'qweb': [
        'static/src/xml/delivery_popup_widget.xml',
        'static/src/xml/TicketButtonWidget.xml',
        'static/src/xml/ShowOrdersWidget.xml',
         # 'static/src/xml/TicketScreen.xml',
        'static/src/xml/pos.xml',

    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
