import Info  from './info'
import Infos from './infos'
import Edit  from './edit'
import Edits from './edits'

const Movie = {
  view: ({attrs: {S,A}}) =>
    m('div' +z`tal`,
      m('div' +z`h 36; pl 36; mb 36; bb 1 solid #d2d2d2; a {mr 24; c #616161; pointer; :hover {c #349cfb}}`,
        m('span',
          m('a.material-icons', {
            onclick: () => {S.page = 'list'; m.route.set('/list')}
          }, 'home')
        ),
        S.page === 'info'
        ? m('span',
            m('a.material-icons', {
              onclick: () => S.page = 'edit'
            }, 'edit')
          )
        : m('span',
            m('a.material-icons', {
              onclick: () => {S.page = 'info'; m.route.set('/movie')}
            }, 'visibility')
          ),
        m('span',
          m('a.material-icons' +z`:hover {c #ed2024}`, {
            onclick: () => S.modal = {
              type: 'delok',
              content: {
                text: `Delete ${S.movie.title}?`,
                click: () => A.del(true)
              }
            }
          }, 'delete')
        ),
        S.page === 'info'
        ? m('span',
            m('a.material-icons', {
              onclick: () => {S.page = 'add'; m.route.set('/add')}
            }, 'add')
          )
        : m('span',
            m('a.material-icons', {
              onclick: () => A.put().then(() => {S.page = 'info'; m.route.set('/movie')})
            }, 'save')
          )
      ),
      m('div' +z`dg; gtc 67% 33%; gtr auto; gta 'info poster'; ofy auto; h calc(100vh - 217px)`,
        m('div' +z`ga info; bsi; p 0 36`,
          S.page === 'info' && m(Info, {S,A}),
          S.page === 'edit' && m(Edit, {S}),
          m('div',
            S.page === 'info' && S.movie.type === 'series'  ? m(Infos, {S,A}) :
            S.page === 'edit' && S.movie.type === 'series' && m(Edits, {S,A})
          )
        ),
        m('div' +z`ga poster; tac; pt 20`,
          m('img' +z`bs 0 1 5 1 rgba(0,0,0,0.5)`, {src: S.movie.poster})
        )
      )
    )
}

export default Movie
