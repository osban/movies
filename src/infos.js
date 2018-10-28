const Infos = (state, actions) =>
  m('div' +b.dg.gtc('50%','50%').gtr('auto').gta(`'left right'`).mt(24),
    m('div' +b.ga('left'),
      m('table' +b.coll,
        m('thead',
          m('th' +b.dib.w(95).fw('bold').pt(4), 'seasons:'),
          m('th' +b.p(4,16,4,1), 'O'),
          m('th' +b.p(4,16,4,1), 'S')
        ),
        m('tbody' +b.$nest('td', b.p(4,16,4,0)),
          state.movie.seasonsowned.map((s,i) => [
            m('tr',
              m('td' +b.pl(1),
                m('a', {
                  onclick: () => actions.geteps(i+1)
                }, 'season ' + (i+1))
              ),
              m('td',
                m('span', s
                  ? m('img' +b.va(-2), {src: 'images/checkmark-16.png'})
                  : m('img' +b.va(-2), {src: 'images/xmark-16.png'})
                )
              ),
              m('td',
                m('span', state.movie.seasonsseen[i]
                  ? m('img' +b.va(-2), {src: 'images/checkmark-16.png'})
                  : m('img' +b.va(-2), {src: 'images/xmark-16.png'})
                )
              )
            )
          ])
        )
      )
    ),
    state.season > 0 &&
    m('div' +b.ga('right'),
      m('table',
        m('thead' +b.$nest('th', b.p(4,16,4,1)),
          m('th'),
          m('th', 'Season ' + state.season)
        ),
        m('tbody' +b.$nest('td', b.p(4,16,4,0)),
          state.eps.Episodes.map(ep => [
            m('tr',
              m('td', ep.Episode + '.'),
              m('td',
                m('a', {href: 'https://www.imdb.com/title/' + ep.imdbID, target: '_blank'}, ep.Title)
              )
            )
          ])
        )
      )
    )
  )

export default Infos
