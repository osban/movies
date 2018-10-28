const Addlist = (state, actions) =>
  m('div' +b.p(0,36).overflowY('auto').h('calc(100vh - 242px)'),
    m('h4', `Found: ${state.qres.totalResults}`,
      m('span' +b.ml((((Number(state.qpage) - 1) * 10) + 1) < 10 ? 108 : 100),
        (((Number(state.qpage) - 1) * 10) + 1) + ' - '
        + (Number(state.qpage) * 10 > state.qres.totalResults ? state.qres.totalResults : Number(state.qpage) * 10)
      ),
      m('span' +b.ml(100),
        m('span.material-icons' +b.mr(20).va(-7).o(actions.isporn('prev') ? 1 : 0)
          .$hover(b.c('#349cfb').pointer), {
          onclick: () => {
            if (actions.isporn('prev')) actions.querypage('prev')
          }
        }, 'keyboard_arrow_left'),
        m('span.material-icons' +b.va(-7).o(actions.isporn('next') ? 1 : 0)
          .$hover(b.c('#349cfb').pointer), {
          onclick: () => {
            if (actions.isporn('next')) actions.querypage('next')
          }
        }, 'keyboard_arrow_right')
      )
    ),
    m('div',
      state.qres.Search.map((x,i) =>
        m('div' +b.bsi.h(24).lh(24).mb(5).c(state.qres.Search[i].imdbID === state.qone.imdbID ? '#349cfb' : null)
          .$hover(state.qres.Search[i].imdbID === state.qone.imdbID ? b.default : b.c('#349cfb').pointer), {
            onclick: () => actions.queryid(state.qres.Search[i].imdbID)
          },
          m('span' +b.mr(8).ml(i < 9 ? 8 : 0), `${i+1}.`),
          m('span', x.Title),
          m('span', ` (${x.Year})`),
          m('span', ` - ${x.Type}`)
        )
      )
    )
  )

export default Addlist
