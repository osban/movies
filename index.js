import m from 'mithril'

import Layout from './layout'
import List from './list'
import View from './view'
import Edit from './edit'
import Add from './add'

m.route(document.body, '/', {
  '/'         : {render: () => m(Layout, m(List))},
  '/view/:id' : {render: vnode => m(Layout, m(View, vnode.attrs))},
  '/edit/:id' : {render: vnode => m(Layout, m(Edit, vnode.attrs))},
  '/add'      : {render: () => m(Layout, m(Add))}
})
