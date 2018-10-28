const Snackbar = ({attrs}) => {
  let open = true
  setTimeout(() => {open = false; m.redraw()}, 5000)
  setTimeout(() => {attrs.snackbar = null; m.redraw()}, 6000)

  return {
    view: () => [
      m('div' +b.zi(99).rel.l('-50%').b(24), {
          style: open
            ? b.$animate('1s 1', {from: b.b(-100), to: b.b(24)}).style
            : b.b(-100).$animate('1s 1', {from: b.b(24), to: b.b(-100)}).style
        },
        m('div' +b.bsi.size(344,48).bc('#323232').c('#dedede').fs(14).tal
          .bo('1px solid transparent').bs('0px 2px 5px 0px rgba(0,0,0,0.4)').bor(4),
          m('div' +b.p(8,0,8,16).h(36).m(6,0).$hover(b.default), attrs.snackbar.text),
          attrs.snackbar.atext &&
          m('div' +b.bsi.h(36).m(6,16).fw(500).tt('uppercase')
            .rel.t(-59).r(-4).pt(9).c('#349cfb').tar.$hover(b.pointer), {
            onclick: attrs.snackbar.action
          }, attrs.snackbar.atext)
        )
      )
    ]
  }
}

export default Snackbar
