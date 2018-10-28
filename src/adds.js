import Checkbox from './checkbox'

const Adds = state =>
  m('div' +b.m(18,36,24,0),
    m('table' +b.coll,
      m('thead',
        m('th' +b.dib.w(95).pt(4), 'seasons:'),
        m('th' +b.p(4,16,4,4), 'O'),
        m('th' +b.p(4,16,4,5), 'S')
      ),
      m('tbody' +b.$nest('td', b.p(4,16,4,0)),
        [...new Array(Number(state.qone.totalSeasons)).keys()].map(i =>
          m('tr',
            m('td' +b.dib.w(97).pl(1), 'season ' + (i+1)),
            m('td',
              m('span' +b.dib.va(-4),
                Checkbox(
                  state.qone.seasonsowned[i],
                  () => state.qone.seasonsowned[i] = !state.qone.seasonsowned[i]
                )
              )
            ),
            m('td',
              m('span' +b.dib.va(-4),
                Checkbox(
                  state.qone.seasonsseen[i],
                  () => state.qone.seasonsseen[i] = !state.qone.seasonsseen[i]
                )
              )
            )
          )
        )
      )
    )
  )

export default Adds
