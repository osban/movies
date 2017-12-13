import m from "mithril"

const Layout = {
  view: vnode => [
    m('div.container',
			m('div.row',
        m('div.twelve columns',
				  m('img', {src: 'images/movies.png'})
        )
			),
      m('div.row',
        m('div.twelve columns',
          m('a.navbar', {
            href: '/',
            oncreate: m.route.link,
            onclick: e => e.target.blur()
          }, "Home"),

          m('a.navbar', {
            href: '/view/0',
            oncreate: m.route.link,
            onclick: e => e.target.blur()
          }, "View"),

          m('a.navbar', {
            href: '/edit/0',
            oncreate: m.route.link,
            onclick: e => e.target.blur()
          }, "Edit"),

          m('a.navbar', {
            href: '/add',
            oncreate: m.route.link,
            onclick: e => e.target.blur()
          }, "Add")
        )
      ),
      m('div.row',
        m('section', vnode.children)
      )
    )
  ]
}
export default Layout
