const Infos = {
  view: ({attrs: {S,A}}) =>
    m('div' +z`dg; gtc 50% 50%; gtr auto; gta 'left right'; mt 24`,
      m('div' +z`ga left`,
        m('table' +z`coll`,
          m('thead',
            m('th' +z`dib; w 95; fw bold; pt 4`, 'seasons:'),
            m('th' +z`p 4 16 4 1`, 'O'),
            m('th' +z`p 4 16 4 1`, 'S')
          ),
          m('tbody' +z`td {p 4 16 4 0}; img {va -2}`,
            Object.values(S.movie.seasonsowned).map((s,i) => [
              m('tr',
                m('td' +z`pl 1`,
                  m('a', {
                    onclick: () => A.geteps(i+1)
                  }, 'season ' + (i+1))
                ),
                m('td',
                  m('span', s
                    ? m('img', {src: 'images/checkmark-16.png'})
                    : m('img', {src: 'images/xmark-16.png'})
                  )
                ),
                m('td',
                  m('span', S.movie.seasonsseen[i]
                    ? m('img', {src: 'images/checkmark-16.png'})
                    : m('img', {src: 'images/xmark-16.png'})
                  )
                )
              )
            ])
          )
        )
      ),
      S.season > 0 &&
      m('div' +z`ga right`,
        m('table',
          m('thead' +z`th {p 4 16 4 1}`,
            m('th'),
            m('th', 'Season ' + S.season)
          ),
          m('tbody' +z`td {p 4 16 4 0}`,
            S.eps.Episodes.map(ep => [
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
}

export default Infos
