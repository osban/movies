const Addlist = {
  view: ({attrs: {S,A}}) =>
    m('div' +z`p 0 36; ofy auto; h calc(100vh - 242px)`,
      m('h4', `Found: ${S.qres.totalResults}`,
        m('span' +z`ml ${(((+S.qpage - 1) * 10) + 1) < 10 ? 108 : 100}`,
          (((+S.qpage - 1) * 10) + 1)
          + ' - '
          + (+S.qpage * 10 > S.qres.totalResults ? S.qres.totalResults : +S.qpage * 10)
        ),
        m('span' +z`ml 100`,
          m('span.material-icons' +z`mr 20; va -7; us none; v ${A.isporn('prev') ? 'visible' : 'hidden'}; pointer; :hover {c #349cfb}`, {
            onclick: () => {
              if (A.isporn('prev')) A.querypage('prev')
            }
          }, 'keyboard_arrow_left'),
          m('span.material-icons' +z`va -7; us none; v ${A.isporn('next') ? 'visible' : 'hidden'}; pointer; :hover {c #349cfb}`, {
            onclick: () => {
              if (A.isporn('next')) A.querypage('next')
            }
          }, 'keyboard_arrow_right')
        )
      ),
      m('div',
        S.qres.Search.map((x,i) =>
          m('div' +z`bsi; h 24; lh 24; mb 5; ${S.qres.Search[i].imdbID === S.qone.imdbID && 'c #349cfb'};
            :hover {${S.qres.Search[i].imdbID === S.qone.imdbID ? 'default' : 'c #349cfb; pointer'}}`, {
              onclick: () => A.queryid(S.qres.Search[i].imdbID)
            },
            m('span' +z`mr 8; ml ${i < 9 ? 8 : 0}`, `${i+1}.`),
            m('span', x.Title),
            m('span', ` (${x.Year})`),
            m('span', ` - ${x.Type}`)
          )
        )
      )
    )
}

export default Addlist
