import CB from './checkbox'

const Edits = {
  view: ({attrs: {S}}) =>
    m('div' +z`m 36 36 24 0`,
      m('table' +z`coll`,
        m('thead',
          m('th' +z`dib; w 95; fw bold; pt 4`, 'seasons:'),
          m('th' +z`p 4 16 4 5`, 'O'),
          m('th' +z`p 4 16 4 5`, 'S')
        ),
        m('tbody' +z`td {p 4 16 4 0}; span {dib; va -4}`,
          Object.keys(S.movie.seasonsowned).map((s,i) => [
            m('tr',
              m('td' +z`dib; w 97; pl 1`, 'season ' + (i+1)),
              m('td',
                m('span',
                  m(CB, {
                    checked: S.movie.seasonsowned[i],
                    onchange: () => S.movie.seasonsowned[i] = !S.movie.seasonsowned[i]
                  })
                )
              ),
              m('td',
                m('span',
                  m(CB, {
                    checked: S.movie.seasonsseen[i],
                    onchange: () => S.movie.seasonsseen[i] = !S.movie.seasonsseen[i]
                  })
                )
              )
            )
          ])
        )
      )
    )
}

export default Edits
