const Content = {
  // error
  error: (state, attrs) =>
    m('div' +b.m('auto').bsi.size(600,300).bc('#fff').p(20,16,16,16).rel
      .bs('0px 2px 5px 0px rgba(0,0,0,.4)').tal.overflowY('auto'),
      m('div' +b.fs(18).fw(500).pb(13).c('#3c3c3c'), attrs.header || 'Error'),
      m('div' +b.fs(14), m.trust(attrs.text)),
      m('div' +b.abs.b(16).r(24),
        m('span.material-icons' +b.c('#616161').pointer.$hover(b.c('#33b679')), {
          onclick: () => state.modal = null
        }, 'thumb_up')
      )
    ),

  // delete confirmation
  delok: (state, attrs) =>
    m('div' +b.m('auto').bsi.size(500,140).bc('#fff').p(20,16,16,16)
      .bs('0px 2px 5px 0px rgba(0,0,0,.4)').tal,
      m('div' +b.fs(18).fw(500).pb(13).c('#3c3c3c'), 'Are you sure?'),
      m('div' +b.fs(14), attrs.text),
      m('div' +b.f('right'),
        m('span.material-icons' +b.m(16,24,0,0).c('#616161').pointer.$hover(b.c('#33b679')), {
          onclick: () => {state.modal = null; attrs.click()}
        }, 'thumb_up'),
        m('span.material-icons' +b.mr(8).c('#616161').pointer.$hover(b.c('#ed2024')), {
          onclick: () => state.modal = null
        }, 'cancel')
      )
    )
}

const Modal = (state, attrs) =>
  m('div',
    m('div' +b.dt.abs.pos(0).size('100%').zi(99),
      m('div' +b.d('table-cell').va('middle'),
        Content[attrs.type](state, attrs.content)
      )
    ),
    m('.overlay' +b.db.zi(90).bc('#000').fix.pos(0).size('100%').o(.3))
  )

export default Modal
