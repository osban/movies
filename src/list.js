import CB from './checkbox'

const List = {
  oninit: ({attrs: {S}}) => {S.sort = 'title'},
  view: ({attrs: {S,A}}) =>
    m('div', A.sort(),
      m('div' +z`tal; mb 12`,
        m('span' +z`rel`,
          m('input' +z`bsi; size 300 36; ml 16; pl 40; bo 1 solid #d2d2d2; fs 13`, {
            placeholder: 'Search title...',
            oninput: e => S.search = e.target.value,
            value: S.search
          }),
          m('span.material-icons' +z`abs; plt 22 -1; c #acacac`, 'search'),
          m('span.material-icons' +z`abs; plt 285 -2; c #616161; pointer; :hover{c #349cfb}`, {
            onclick: () => S.search = ''
          }, 'close')
        ),
        m('span',
          m('a.material-icons' +z`m 0 24 0 12; va -7; c #616161; pointer; :hover {c #349cfb}`, {
            onclick: () => {S.page = 'add'; m.route.set('/add')}
          }, 'add'),
          m('span' +z`va -8; tra o 0.2s ease-in`, {
              style: Object.keys(S.checks).some(x => S.checks[x] === true)
                ? z.style`o 1; default`
                : z.style`o 0; default`
            },
            m('a.material-icons' +z`mr 24; c #616161; pointer; :hover {c #33b679}`, {
              onclick: () => A.seen()
            }, 'check_circle'),
            m('a.material-icons' +z`mr 24; c #616161; pointer; :hover {c #ed2024}`, {
              onclick: () => S.modal = {
                type: 'delok',
                content: {
                  text: `You are about to delete ${Object.keys(S.checks).filter(x => S.checks[x]).length} movie(s)...continue?`,
                  click: () => A.del(false)
                }
              }
            }, 'delete')
          )
        ),
        m('span' +z`nowrap`,
          Object.keys(S.filters).map(x =>
            m('select' +z`p 4 8`, {
                onchange: e => {
                  A.setfilter(x, e.target.value)
                  e.target.blur()
                }
              },
              S.filters[x].map(y =>
                m('option' +z`p 4 0`, {selected: y === S.filter[x]}, y)
              )
            )
          ),
          m('a.material-icons' +z`m 0 24; va -7; c #616161; pointer; :hover {c #349cfb}`, {
            onclick: () => A.selclear()
          }, 'cancel')
        ),
        m('span' +z`f right; mt 8`,
          ['title','idasc','iddesc'].map(x =>
            m('span.material-icons' +z`mr 16; ${S.sort === x && 'c #349cfb'}; pointer; :hover {c #349cfb}`, {
              sortby: x
            }, x === 'title' ? 'sort_by_alpha' : x === 'idasc' ? 'arrow_upward' : 'arrow_downward')
          )
        )
      ),
      m('div' +z`dg gtc auto; gtr auto; gta 'table'; bt 1 solid #d2d2d2`,
        m('div' +z`ga 'table'; h calc(100vh - 193px); of auto`,
          m('table' +z`w 100%; ofy auto; coll`,
            m('thead' +z`w 100%; rel; zi 10; th {p 8 16; bc #f5f5f5; position sticky; t 0; pr 1em; bs 0 1 0 0 #d2d2d2}`,
              m('tr',
                m('th', ''),
                m('th' +z`tac`, '#'),
                m('th' +z`tal; pointer; us none`, {sortby: 'title'}, 'Title'),
                m('th' +z`tal; pointer; us none`, {sortby: 'runtime'}, 'Time'),
                m('th' +z`tal; pointer; us none`, {sortby: 'year'}, 'Year'),
                m('th' +z`tal; pointer; us none`, {sortby: 'type'}, 'Type'),
                m('th' +z`tal; pointer; us none`, {sortby: 'genre'}, 'Genre'),
                m('th' +z`tar; pointer; us none`, {sortby: 'disk'}, 'Disk'),
                m('th', 'Seen')
              )
            ),
            m('tbody' +z`td {bsi; p 8 16; h 36; bb 1 solid #f5f5f5}`,
              S.list
              .filter(x =>
                (S.filter.time  !== '< Time' && A.mm2hm(x.runtime) > S.filter.time)                   ||
                (S.filter.yrgt  !== '> Year' && x.year < S.filter.yrgt)                               ||
                (S.filter.yrlt  !== '< Year' && x.year > S.filter.yrlt)                               ||
                (S.filter.type  !== 'Type'   && x.type !== S.filter.type)                             ||
                (S.filter.genre !== 'Genre'  && !x.genre.split(', ').find(x => x === S.filter.genre)) ||
                (S.filter.disk  !== 'Disk'   && x.disk !== S.filter.disk)                             ||
                (S.filter.seen  !== 'Seen'   && (x.seen ? 'Yes' : 'No') !== S.filter.seen)            ||
                (x.title.toLowerCase().indexOf(S.search.toLowerCase()) === -1)
                ? false
                : true
              )
              .map((x,i) =>
                m('tr' +z`nowrap; pointer; :hover {bc #efefef}`, {onclick: () => A.selmovie(x._id)},
                  m('td',
                    m(CB, {checked: S.checks[x._id], onchange: () => A.checkit(x._id)})
                  ),
                  m('td', i+1),
                  m('td' +z`tal`, x.title),
                  m('td' +z`tal`, A.mm2hm(x.runtime)),
                  m('td' +z`tal`, x.year),
                  m('td' +z`tal`, x.type),
                  m('td' +z`tal`, x.genre),
                  m('td' +z`tar`, x.disk),
                  m('td' +z`tac`,
                    x.seen
                    ? m('img' +z`va -2`, {src: 'images/checkmark-16.png'})
                    : m('img' +z`va -2`, {src: 'images/xmark-16.png'})
                  )
                )
              )
            )
          )
        )
      )
    )
}

export default List
