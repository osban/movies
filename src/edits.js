import Checkbox from './checkbox'

const Edits = state =>
  m('div' +b.m(36,36,24,0),
    m('table' +b.coll,
      m('thead',
        m('th' +b.dib.w(95).fw('bold').pt(4), 'seasons:'),
        m('th' +b.p(4,16,4,5), 'O'),
        m('th' +b.p(4,16,4,5), 'S')
      ),
      m('tbody' +b.$nest('td', b.p(4,16,4,0)),
        state.movie.seasonsowned.map((s,i) => [
          m('tr',
            m('td' +b.dib.w(97).pl(1), 'season ' + (i+1)),
            m('td',
              m('span' +b.dib.va(-4),
                Checkbox(
                  state.movie.seasonsowned[i],
                  () => state.movie.seasonsowned[i] = !state.movie.seasonsowned[i]
                )
              )
            ),
            m('td',
              m('span' +b.dib.va(-4),
                Checkbox(
                  state.movie.seasonsseen[i],
                  () => state.movie.seasonsseen[i] = !state.movie.seasonsseen[i]
                )
              )
            )
          )
        ])
      )
    )
  )

export default Edits
