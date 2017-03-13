import m from "mithril"

module.exports = {
  view(vnode) {
    return m('div.container',
			m('div.row',
        m('div.twelve columns',
				  m('img[src=movies.png]')
        )
			),
      m('div.row',
        m('div.twelve columns',
          m('a[href="/"].navbar', {
            oncreate: m.route.link,
            onclick: function() {this.blur()}
          }, "Home"),

          m('a[href="/view/0"].navbar', {
            oncreate: m.route.link,
            onclick: function() {this.blur()}
          }, "View"),

          m('a[href="/edit/0"].navbar', {
            oncreate: m.route.link,
            onclick: function() {this.blur()}
          }, "Edit"),

          m('a[href="/add/"].navbar', {
            oncreate: m.route.link,
            onclick: function() {this.blur()}
          }, "Add")
        )
      ),
      m('div.row',
        m('section', vnode.children)
      )
    )
  }
}
