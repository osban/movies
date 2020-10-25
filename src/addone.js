import CB   from './checkbox'
import Adds from './adds'

const Addone = {
  view: ({attrs: {S,A}}) =>
    m('div' +z`ofy auto; h calc(100vh - 242px)`,
      m('div' +z`bsi; p 0 36`,
        m('div' +z`dg; gtc 50% 50%; gtr auto; gta 'left right'`,
          m('div' +z`ga left`,
            m('h2',
              S.qone.Year
              ? `${S.qone.Title} (${S.qone.Year})`
              : S.qone.Title
            ),
            ['Plot','Director','Writer','Cast'].map(x =>
              m('div' +z`mb 12`,
                x === 'Plot'
                ? m('div' +z`fw bold`, 'plot:')
                : m('b' +z`mr 6`, `${x.toLowerCase()}: `),
                x === 'Cast'
                ? m('span', S.qone.Actors)
                : m('span', S.qone[x])
              )
            ),
            ['Country','Language','Runtime','Genre','Type'].map(x =>
              m('div' +z`${x === 'Genre' ? 'mb 12' : ''}`,
                m('b' +z`mr 6`, `${x.toLowerCase()}: `),
                x === 'Runtime'
                ? m('span', A.mm2hm(S.qone.Runtime.split(' ')[0] || 0))
                : m('span', S.qone[x])
              )
            ),
            ['Rating','Metascore','imdb'].map(x =>
              m('div',
                m('b' +z`mr 6`, `${x.toLowerCase()}: `),
                x === 'imdb'
                ? m('a', {
                    href: `https://www.imdb.com/title/${S.qone.imdbID}`,
                    target: '_blank'
                  }, `https://www.imdb.com/title/${S.qone.imdbID}`)
                : x === 'Rating'
                  ? m('span', S.qone.imdbRating)
                  : m('span', S.qone[x])
              )
            ),
            m('div', S.qone.Type === 'series' && m(Adds, {S}))
          ),
          m('div' +z`ga right`,
            m('div' +z`tar; mt 20`,
              m('img' +z`bs 0 1 5 1 rgba(0,0,0,0.5)`, {src: S.qone.Poster}),
              m('div' +z`tal; m 24 0 0 68`,
                m('label' +z`dib; w 60; fw bold`, 'disk'),
                m('input' +z`bsi; size 32; pl 0; tac`, {
                  oninput: e => S.qone.disk = e.target.value,
                  value: S.qone.disk
                }),
                m('span' +z`f right; m 10 24 0 0`,
                  m('a.material-icons' +z`fs 48; c #616161; pointer; :hover {c #349cfb}`, {
                    onclick: () => A.post()
                  }, 'save')
                )
              ),
              m('div' +z`tal; m 10 0 0 68`,
                m('label' +z`dib; w 60; fw bold`, 'seen'),
                m('span' +z`dib; va -4`,
                  m(CB, {checked: S.qone.seen, onchange: () => S.qone.seen = !S.qone.seen})
                )
              )
            )
          )
        )
      )
    )
}

export default Addone
