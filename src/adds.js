import CB from './checkbox'

const Adds = {
  view: ({attrs: {S}}) =>
    m('div' +z`m 18 36 24 0`,
      m('table' +z`coll`,
        m('thead',
          m('th' +z`dib; w 95; pt 4`, 'seasons:'),
          m('th' +z`p 4 16 4 4`, 'O'),
          m('th' +z`p 4 16 4 5`, 'S')
        ),
        m('tbody' +z`td {p 4 16 4 0}`,
          [...new Array(+S.qone.totalSeasons).keys()].map(i =>
            m('tr' +z`span {dib; va -4}`,
              m('td' +z`dib; w 97; pl 1`, 'season ' + (i+1)),
              m('td',
                m('span',
                  m(CB, {
                    checked: S.qone.seasonsowned[i],
                    onchange: () => S.qone.seasonsowned[i] = !S.qone.seasonsowned[i]
                  })
                )
              ),
              m('td',
                m('span',
                  m(CB, {
                    checked: S.qone.seasonsseen[i],
                    onchange: () => S.qone.seasonsseen[i] = !S.qone.seasonsseen[i]
                  })
                )
              )
            )
          )
        )
      )
    )
}

export default Adds
